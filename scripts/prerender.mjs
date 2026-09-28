/**
 * Build-time prerenderer for IdeaCloud.
 *
 * Vercel runs `npm run build` -> vite build -> this script. It reads public
 * data from Firestore and injects it into the built HTML so crawlers receive
 * real content without executing JavaScript.
 *
 * Produces, inside dist/:
 *   /index.html                 home, ideas + ItemList JSON-LD
 *   /profile/<uid>/index.html   one per public profile + ProfilePage JSON-LD
 *   /sitemap.xml                every prerendered URL with lastmod
 *   /robots.txt                 sitemap line forced to the canonical origin
 *
 * Reads .env for VITE_FIREBASE_* so it works locally and on Vercel.
 * A missing or unreadable Firestore never fails the build - it degrades to a
 * shell page, which is what the SPA would have served anyway.
 */

import { readFileSync } from "node:fs";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const SITE_ORIGIN = "https://ideacloud-itrans.vercel.app";
const SITE_NAME = "IdeaCloud";
const MAX_IDEAS = 24;
const MAX_PROFILES = 200;
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = process.env.PRERENDER_DIST
  ? path.resolve(process.env.PRERENDER_DIST)
  : path.resolve(ROOT, "..", "dist");
const SHELL_CACHE = process.env.PRERENDER_SHELL_CACHE
  ? path.resolve(process.env.PRERENDER_SHELL_CACHE)
  : path.resolve(ROOT, "..", "node_modules", ".cache", "prerender-shell.html");
const FIRESTORE_API = "https://firestore.googleapis.com/v1";

loadEnv();
await main();

async function main() {
  if (!existsSync(DIST)) {
    fail(`dist/ not found at ${DIST} - run "vite build" first.`);
  }

  const [ideas, profiles] = await Promise.all([fetchIdeas(), fetchProfiles()]);
  log(`Fetched ${ideas.length} idea(s) across ${profiles.length} profile(s).`);

  const shell = await readShell();

  await writeRoute(shell, "/", buildHome(ideas, profiles));
  for (const profile of profiles) {
    await writeRoute(shell, `/profile/${profile.uid}`, buildProfile(profile, ideas));
  }

  await writeSitemap(ideas, profiles);
  await patchRobots();

  log("Prerender complete.");
}

/* ------------------------------------------------------------------ pages */

function buildHome(ideas, profiles) {
  const title = `${SITE_NAME} — Where Ideas Meet Sponsors`;
  const description = describeSite(ideas);

  const list = ideas.length
    ? ideas
        .map(
          (idea) => `        <li>
          <a href="/profile/${esc(idea.creatorId)}/"><strong>${esc(idea.title || "Untitled idea")}</strong></a>
          <p>${esc(idea.brief || "")}</p>
          <p>${esc(idea.category || "Other")} — ${esc(idea.creatorName || "Anonymous")}</p>
        </li>`
        )
        .join("\n")
    : "        <li>No ideas posted yet.</li>";

  const graph = [
    {
      "@type": "WebSite",
      "@id": `${SITE_ORIGIN}/#website`,
      url: `${SITE_ORIGIN}/`,
      name: SITE_NAME,
      description,
      inLanguage: "en",
      publisher: { "@id": `${SITE_ORIGIN}/#org` },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_ORIGIN}/#org`,
      name: SITE_NAME,
      url: `${SITE_ORIGIN}/`,
      logo: `${SITE_ORIGIN}/og-image.png`,
      description: "A marketplace bridging idea generators and sponsors.",
    },
  ];

  if (ideas.length) {
    graph.push({
      "@type": "ItemList",
      "@id": `${SITE_ORIGIN}/#ideas`,
      name: "Latest ideas",
      numberOfItems: ideas.length,
      itemListElement: ideas.map((idea, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_ORIGIN}/profile/${idea.creatorId}/`,
        item: ideaToCreativeWork(idea),
      })),
    });
  }

  if (profiles.length) {
    graph.push({
      "@type": "ItemList",
      "@id": `${SITE_ORIGIN}/#creators`,
      name: "Idea generators",
      itemListElement: profiles.map((profile, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_ORIGIN}/profile/${profile.uid}/`,
        name: profile.name,
      })),
    });
  }

  const categoryBlock = (() => {
    const counts = categories(ideas);
    if (!counts.length) return "";
    return `      <h2>Browse by category</h2>
      <ul>
${counts.map((c) => `        <li>${esc(c.name)} (${c.count})</li>`).join("\n")}
      </ul>`;
  })();

  return {
    route: "/",
    ogType: "website",
    title,
    description,
    jsonLd: { "@context": "https://schema.org", "@graph": graph },
    body: `      <h1>${SITE_NAME}</h1>
      <p>Where ideas meet sponsors. Browse ideas from creative minds and get in touch with the people who can fund them.</p>
      <h2>Latest ideas</h2>
      <ul>
${list}
      </ul>
${categoryBlock}`,
  };
}

function buildProfile(profile, ideas) {
  const own = ideas.filter((idea) => idea.creatorId === profile.uid);
  const description =
    profile.bio || `${profile.name} shares ${own.length} idea${plural(own.length)} on ${SITE_NAME}.`;

  const list = own.length
    ? own
        .map(
          (idea) => `        <li>
          <strong>${esc(idea.title || "Untitled idea")}</strong>
          <p>${esc(idea.brief || "")}</p>
          <p>${esc(idea.category || "Other")}</p>
        </li>`
        )
        .join("\n")
    : "        <li>No ideas posted yet.</li>";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${SITE_ORIGIN}/profile/${profile.uid}/#profile`,
        url: `${SITE_ORIGIN}/profile/${profile.uid}/`,
        name: profile.name,
        description,
        inLanguage: "en",
        mainEntity: {
          "@type": "Person",
          "@id": `${SITE_ORIGIN}/profile/${profile.uid}/#person`,
          name: profile.name,
          description: profile.bio || undefined,
          url: `${SITE_ORIGIN}/profile/${profile.uid}/`,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_ORIGIN}/#website`,
        url: `${SITE_ORIGIN}/`,
        name: SITE_NAME,
        publisher: { "@id": `${SITE_ORIGIN}/#org` },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_ORIGIN}/#org`,
        name: SITE_NAME,
        url: `${SITE_ORIGIN}/`,
        logo: `${SITE_ORIGIN}/og-image.png`,
      },
    ],
  };

  return {
    route: `/profile/${profile.uid}`,
    ogType: "profile",
    title: `${profile.name} — ${SITE_NAME}`,
    description,
    jsonLd,
    body: `      <h1>${esc(profile.name)}</h1>
${profile.bio ? `      <p>${esc(profile.bio)}</p>\n` : ""}      <p>${own.length} idea${plural(own.length)} shared on ${SITE_NAME}.</p>
      <h2>Ideas</h2>
      <ul>
${list}
      </ul>`,
  };
}

function ideaToCreativeWork(idea) {
  return {
    "@type": "CreativeWork",
    name: idea.title || "Untitled idea",
    description: idea.brief || "",
    url: `${SITE_ORIGIN}/profile/${idea.creatorId}/`,
    genre: idea.category || undefined,
    datePublished: idea.createdAt || undefined,
    author: {
      "@type": "Person",
      name: idea.creatorName || "Anonymous",
      url: `${SITE_ORIGIN}/profile/${idea.creatorId}/`,
    },
  };
}

function describeSite(ideas) {
  const base =
    "IdeaCloud connects idea generators with sponsors. Browse and share innovative ideas, and reach the people who can fund them.";
  if (!ideas.length) return base;
  const cats = [
    ...new Set(ideas.map((i) => i.category).filter((c) => c && c !== "Other")),
  ].slice(0, 4);
  if (!cats.length) return base;
  return `${base} Browse ideas in ${listify(cats)}.`;
}

function categories(ideas) {
  const map = new Map();
  for (const idea of ideas) {
    const key = idea.category || "Other";
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()].map(([name, count]) => ({ name, count }));
}

function plural(n) {
  return n === 1 ? "" : "s";
}

function listify(items) {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

/* ------------------------------------------------------------------ output */

async function writeRoute(shell, route, page) {
  const url = `${SITE_ORIGIN}${route === "/" ? "/" : `${route}/`}`;

  let html = shell;
  html = replaceTitle(html, page.title);
  html = replaceMeta(html, "name", "description", page.description);
  html = replaceMeta(html, "name", "twitter:title", page.title);
  html = replaceMeta(html, "name", "twitter:description", page.description);
  html = replaceMeta(html, "property", "og:type", page.ogType);
  html = replaceMeta(html, "property", "og:title", page.title);
  html = replaceMeta(html, "property", "og:description", page.description);
  html = replaceMeta(html, "property", "og:url", url);
  html = replaceCanonical(html, url);
  html = html.replace(
    "</head>",
    `    <script type="application/ld+json">${JSON.stringify(page.jsonLd)}</script>\n  </head>`
  );
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root"></div>\n    <div id="prerender-root" hidden aria-hidden="true">\n${page.body}\n    </div>`
  );

  const dir = path.join(DIST, route.replace(/^\//, ""));
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "index.html"), html, "utf8");
  log(`  ${route}`);
}
/**
 * Vite's index.html, snapshotted by the prerenderShell() plugin in
 * vite.config.js during every build.
 *
 * Every route is rendered from this pristine template, so re-running this script
 * can never inherit its own previous output. It lives outside dist/ so it is
 * never deployed, and Vite rewrites it on every build so it can never go stale.
 * Normalised to LF, so output is byte-identical on Windows and Linux CI.
 */
async function readShell() {
  if (existsSync(SHELL_CACHE)) return normalizeEol(await readFile(SHELL_CACHE, "utf8"));

  // No Vite cache: fall back to dist/index.html and snapshot it, so a manual
  // `node scripts/prerender.mjs` still behaves sensibly.
  const source = path.join(DIST, "index.html");
  const html = normalizeEol(await readFile(source, "utf8"));
  await writeFile(SHELL_CACHE, html, "utf8");
  return html;
}

function normalizeEol(html) {
  return html.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

async function writeSitemap(ideas, profiles) {
  const latest = ideas.reduce((acc, i) => (i.createdAt > acc ? i.createdAt : acc), "");
  const homeMod = (latest || new Date().toISOString()).slice(0, 10);

  const urls = [
    `  <url>
    <loc>${SITE_ORIGIN}/</loc>
    <lastmod>${homeMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`,
    ...profiles.map(
      (profile) => `  <url>
    <loc>${SITE_ORIGIN}/profile/${profile.uid}/</loc>
    <lastmod>${homeMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
    ),
  ];

  await writeFile(
    path.join(DIST, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`,
    "utf8"
  );
  log(`sitemap.xml: ${urls.length} URL(s)`);
}

async function patchRobots() {
  const file = path.join(DIST, "robots.txt");
  const fallback = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`;
  if (!existsSync(file)) {
    await writeFile(file, fallback, "utf8");
    return;
  }
  const current = normalizeEol(await readFile(file, "utf8"));
  const stripped = current
    .replace(/^Sitemap:.*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd();
  await writeFile(file, `${stripped}\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`, "utf8");
}

/* ---------------------------------------------------------------- firestore */

async function fetchIdeas() {
  const { project, key } = credentials();
  if (!project || !key) {
    warn("VITE_FIREBASE_PROJECT_ID / VITE_FIREBASE_API_KEY missing - skipping idea content.");
    return [];
  }
  const params = new URLSearchParams({ pageSize: String(MAX_IDEAS), orderBy: "createdAt desc" });
  const url = `${FIRESTORE_API}/projects/${project}/databases/(default)/documents/ideas?${params}`;
  try {
    return (await firestoreGet(url, key)).map(fromIdea);
  } catch (err) {
    warn(`Idea fetch failed (${err.message}) - continuing without idea content.`);
    return [];
  }
}

async function fetchProfiles() {
  const { project, key } = credentials();
  if (!project || !key) return [];
  const params = new URLSearchParams({ pageSize: String(MAX_PROFILES) });
  const url = `${FIRESTORE_API}/projects/${project}/databases/(default)/documents/users?${params}`;
  try {
    return (await firestoreGet(url, key))
      .map(fromUser)
      .filter((user) => user.uid && user.name);
  } catch (err) {
    warn(`Profile fetch failed (${err.message}) - continuing without profile pages.`);
    return [];
  }
}

function credentials() {
  return {
    project: process.env.VITE_FIREBASE_PROJECT_ID,
    key: process.env.VITE_FIREBASE_API_KEY,
  };
}

async function firestoreGet(url, key) {
  const res = await fetch(url, { headers: { "x-goog-api-key": key } });
  if (!res.ok) throw new Error(`Firestore ${res.status}: ${(await res.text()).slice(0, 160)}`);
  return (await res.json()).documents || [];
}

function fromIdea(doc) {
  const f = doc.fields || {};
  return {
    id: doc.name.split("/").pop(),
    title: f.title?.stringValue ?? "",
    brief: f.brief?.stringValue ?? "",
    category: f.category?.stringValue ?? "",
    creatorId: f.creatorId?.stringValue ?? "",
    creatorName: f.creatorName?.stringValue ?? "",
    createdAt: f.createdAt?.timestampValue ?? "",
  };
}

function fromUser(doc) {
  const f = doc.fields || {};
  return {
    uid: doc.name.split("/").pop(),
    name: f.name?.stringValue ?? f.displayName?.stringValue ?? "",
    bio: f.bio?.stringValue ?? "",
  };
}

/* ------------------------------------------------------------------ markup */

function replaceTitle(html, title) {
  return /<title>[\s\S]*?<\/title>/i.test(html)
    ? html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`)
    : html.replace("</head>", `  <title>${esc(title)}</title>\n  </head>`);
}

function replaceMeta(html, attr, key, content) {
  const tag = `<meta ${attr}="${key}" content="${esc(content)}" />`;
  const re = new RegExp(`<meta\\s+${attr}="${key}"\\s+content="[^"]*"\\s*/?>`, "i");
  return re.test(html) ? html.replace(re, tag) : html.replace("</head>", `  ${tag}\n  </head>`);
}

function replaceCanonical(html, url) {
  const tag = `<link rel="canonical" href="${url}" />`;
  const re = /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i;
  return re.test(html) ? html.replace(re, tag) : html.replace("</head>", `  ${tag}\n  </head>`);
}

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function loadEnv() {
  for (const file of [".env", ".env.local", ".env.production"]) {
    const full = path.resolve(ROOT, "..", file);
    if (!existsSync(full)) continue;
    for (const line of readFileSync(full, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const [, key, raw] = match;
      if (process.env[key]) continue;
      process.env[key] = raw.replace(/^["']|["']$/g, "");
    }
  }
}

function log(msg) {
  process.stdout.write(`[prerender] ${msg}\n`);
}

function warn(msg) {
  process.stdout.write(`[prerender] WARNING: ${msg}\n`);
}

function fail(msg) {
  process.stderr.write(`[prerender] ERROR: ${msg}\n`);
  process.exit(1);
}
