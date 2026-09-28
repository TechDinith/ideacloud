/**
 * Offline check for scripts/prerender.mjs.
 *
 * Copies dist/ into a temp sandbox, runs the prerenderer there with Firestore
 * stubbed by scripts/_fixture-fetch.mjs, and asserts the generated markup.
 * Never touches the live database or your real dist/.
 *
 *   node scripts/_test-prerender.mjs
 */

import { readFileSync, writeFileSync, existsSync, rmSync, mkdirSync, cpSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import path from "node:path";
import os from "node:os";

const ROOT = process.cwd();
const TMP = path.join(os.tmpdir(), "ideacloud-prerender-test");
const SANDBOX_DIST = path.join(TMP, "dist");

let pass = 0;
let fail = 0;

function check(label, cond, extra = "") {
  if (cond) {
    pass++;
    console.log(`  ok    ${label}`);
  } else {
    fail++;
    console.log(`  FAIL  ${label}${extra ? `  -> ${extra}` : ""}`);
  }
}

rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });
cpSync(path.join(ROOT, "dist"), SANDBOX_DIST, { recursive: true });

// The prerender reads its pristine template from this cache, written by Vite
// during the build. Point it at a temp copy of the sandbox so the test never
// touches the real node_modules/.cache.
const SHELL_CACHE = path.join(TMP, "shell-cache.html");
writeFileSync(SHELL_CACHE, readFileSync(path.join(SANDBOX_DIST, "index.html"), "utf8"));

const runPrerender = (env = {}) =>
  execFileSync(
    process.execPath,
    [
      "--import",
      pathToFileURL(path.join(ROOT, "scripts", "_fixture-fetch.mjs")).href,
      path.join(ROOT, "scripts", "prerender.mjs"),
    ],
    {
      cwd: ROOT,
      encoding: "utf8",
      env: { ...process.env, PRERENDER_DIST: SANDBOX_DIST, PRERENDER_SHELL_CACHE: SHELL_CACHE, ...env },
    }
  ).trim();


const out = runPrerender();

console.log("\nprerender output:");
console.log(out.split("\n").map((l) => `  ${l}`).join("\n"));

const home = readFileSync(path.join(SANDBOX_DIST, "index.html"), "utf8");
const prof1 = readFileSync(path.join(SANDBOX_DIST, "profile", "uid1", "index.html"), "utf8");
const prof2 = readFileSync(path.join(SANDBOX_DIST, "profile", "uid2", "index.html"), "utf8");
const sitemap = readFileSync(path.join(SANDBOX_DIST, "sitemap.xml"), "utf8");
const robots = readFileSync(path.join(SANDBOX_DIST, "robots.txt"), "utf8");

console.log("\nassertions:");

check("home title", home.includes("<title>IdeaCloud — Where Ideas Meet Sponsors</title>"));
check("home canonical", home.includes('rel="canonical" href="https://ideacloud-itrans.vercel.app/"'));
check("home og:type=website", home.includes('property="og:type" content="website"'));
check(
  "home lists all 3 idea titles",
  ["Grocery price tracker", "Neighborhood tool library"].every((t) => home.includes(t))
);
check("home escapes < > & \" in idea titles", home.includes("AI &lt;Tutor&gt; &amp; &quot;Math&quot;"));
check("home does NOT emit raw <Tutor>", !/<strong>AI <Tutor>/.test(home));
check("home description includes categories", /Browse ideas in Education and Finance\./.test(home));
check(
  "home category counts",
  home.includes("<li>Education (1)</li>") &&
    home.includes("<li>Finance (1)</li>") &&
    home.includes("<li>Other (1)</li>")
);
check("home ItemList JSON-LD", home.includes('"@type":"ItemList"') && home.includes('"numberOfItems":3'));
check("home CreativeWork JSON-LD", home.includes('"@type":"CreativeWork"'));
check("home lastmod = newest idea date", sitemap.includes("<lastmod>2026-09-25</lastmod>"));

check("profile1 generated", existsSync(path.join(SANDBOX_DIST, "profile", "uid1", "index.html")));
check("profile1 title", prof1.includes("<title>CreativeIdeas — IdeaCloud</title>"));
check("profile1 og:type=profile", prof1.includes('property="og:type" content="profile"'));
check(
  "profile1 canonical trailing slash",
  prof1.includes('rel="canonical" href="https://ideacloud-itrans.vercel.app/profile/uid1/"')
);
check("profile1 lists own ideas only",
  prof1.includes("Grocery price tracker") && !prof1.includes("Neighborhood tool library"));
check("profile1 plural count text", prof1.includes("2 ideas shared on IdeaCloud"));
check("profile1 ProfilePage JSON-LD", prof1.includes('"@type":"ProfilePage"'));

check("profile2 fallback description (no bio)",
  prof2.includes('content="Dilanjan shares 1 idea on IdeaCloud."'));
check("profile2 singular pluralisation", prof2.includes("1 idea shared on IdeaCloud"));

check("sitemap has 3 <loc>", (sitemap.match(/<loc>/g) || []).length === 3);
check("sitemap home url", sitemap.includes("<loc>https://ideacloud-itrans.vercel.app/</loc>"));
check("sitemap profile urls", sitemap.includes("/profile/uid1/") && sitemap.includes("/profile/uid2/"));
check("robots has exactly 1 Sitemap line", (robots.match(/^Sitemap:/gm) || []).length === 1);
check("robots canonical origin", robots.includes("Sitemap: https://ideacloud-itrans.vercel.app/sitemap.xml"));
check(
  "no stale ideacloud.vercel.app origin",
  ![home, prof1, prof2, sitemap, robots].some((s) => s.includes("ideacloud.vercel.app"))
);

check("react mount point preserved", home.includes('<div id="root"></div>'));
check("prerender block hidden", home.includes('id="prerender-root" hidden'));
check("module script preserved", home.includes('<script type="module"'));
check("no noindex leaked onto public pages",
  ![home, prof1, prof2].some((s) => s.includes("noindex")));
check("category section rendered when ideas exist", home.includes("<h2>Browse by category</h2>"));

/* --- idempotency: a second run must not duplicate anything -------------- */
runPrerender();
const home2 = readFileSync(path.join(SANDBOX_DIST, "index.html"), "utf8");
const prof1b = readFileSync(path.join(SANDBOX_DIST, "profile", "uid1", "index.html"), "utf8");
const sitemap2 = readFileSync(path.join(SANDBOX_DIST, "sitemap.xml"), "utf8");
const robots2 = readFileSync(path.join(SANDBOX_DIST, "robots.txt"), "utf8");

check("re-run: home byte-identical", home2 === home);
check("re-run: profile byte-identical", prof1b === prof1);
check("re-run: sitemap byte-identical", sitemap2 === sitemap);
check("re-run: robots byte-identical", robots2 === robots);
check("re-run: still one ld+json", (home2.match(/application\/ld\+json/g) || []).length === 1);
check("re-run: one prerender-root", (home2.match(/id="prerender-root"/g) || []).length === 1);
check("re-run: one title tag", (home2.match(/<title>/g) || []).length === 1);
check("re-run: one canonical", (home2.match(/rel="canonical"/g) || []).length === 1);
check("re-run: one robots Sitemap line", (robots2.match(/^Sitemap:/gm) || []).length === 1);
check("output uses LF only (no CRLF drift)", ![home, prof1, sitemap, robots].some((s) => s.includes("\r")));
check("re-run output uses LF only", ![home2, sitemap2, robots2].some((s) => s.includes("\r")));
check("re-run: all 3 routes still present",
  ["/index.html", "profile/uid1/index.html", "profile/uid2/index.html"].every((f) =>
    existsSync(path.join(SANDBOX_DIST, f))
  ));
check("shell cache kept outside dist",
  !existsSync(path.join(SANDBOX_DIST, ".prerender-shell.html")) &&
  !readdirSync(SANDBOX_DIST).some((f) => f.includes("shell")));

/* --- Search Console ownership token -------------------------------------
 * Google re-checks /googledf41cbb3e682b374.html periodically and revokes
 * Search Console access if it ever 404s. The filename and body must stay
 * byte-for-byte identical to the file Google issued, so assert both.
 */
const VERIFY_FILE = "googledf41cbb3e682b374.html";
const VERIFY_BODY = "google-site-verification: googledf41cbb3e682b374.html";
const verifyPath = path.join(SANDBOX_DIST, VERIFY_FILE);
check("google verification file present in dist root", existsSync(verifyPath));
check(
  "google verification file body is byte-exact",
  existsSync(verifyPath) && readFileSync(verifyPath, "utf8") === VERIFY_BODY
);
check(
  "google verification file has no BOM or CRLF",
  existsSync(verifyPath) && !readFileSync(verifyPath).includes(Buffer.from([13, 10]))
);
check("google verification file is not in the sitemap",
  !sitemap.includes(VERIFY_FILE) && !sitemap2.includes(VERIFY_FILE));

/* --- empty collection: must degrade gracefully, not crash -------------- */
rmSync(SANDBOX_DIST, { recursive: true, force: true });
cpSync(path.join(ROOT, "dist"), SANDBOX_DIST, { recursive: true });
let emptyRan = true;
try {
  runPrerender({ FIXTURE_EMPTY: "1" });
} catch (e) {
  emptyRan = false;
  console.log(`  (empty run threw: ${e.message})`);
}
check("empty collection: build does not fail", emptyRan);

if (emptyRan) {
  const eh = readFileSync(path.join(SANDBOX_DIST, "index.html"), "utf8");
  const es = readFileSync(path.join(SANDBOX_DIST, "sitemap.xml"), "utf8");
  const ep = readFileSync(path.join(SANDBOX_DIST, "profile", "uid1", "index.html"), "utf8");
  check("empty collection: falls back to generic description",
    eh.includes("IdeaCloud connects idea generators with sponsors"));
  check("empty collection: no ideas ItemList JSON-LD", !eh.includes('"#ideas"'));
  check("empty collection: shows no-ideas copy", eh.includes("No ideas posted yet."));
  check("empty collection: omits category section", !eh.includes("Browse by category"));
  check("empty collection: still prerenders profiles", ep.includes("<title>CreativeIdeas — IdeaCloud</title>"));
  check("empty collection: profile says 0 ideas", ep.includes("0 ideas shared on IdeaCloud"));
  check("empty collection: sitemap still has 3 urls", (es.match(/<loc>/g) || []).length === 3);
  check("empty collection: sitemap lastmod falls back to today",
    /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/.test(es));
}

const ldCount = (home.match(/application\/ld\+json/g) || []).length;
check("exactly one ld+json block per page", ldCount === 1 && (prof1.match(/application\/ld\+json/g) || []).length === 1);

for (const [name, json] of [["home", home], ["profile1", prof1], ["profile2", prof2]]) {
  const m = json.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  let ok = false;
  try {
    const parsed = JSON.parse(m[1]);
    ok = parsed["@context"] === "https://schema.org" && Array.isArray(parsed["@graph"]);
  } catch (e) {
    ok = false;
  }
  check(`${name} JSON-LD parses`, ok);
}

rmSync(TMP, { recursive: true, force: true });

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
