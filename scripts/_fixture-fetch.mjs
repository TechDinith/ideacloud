/**
 * Test-only preload for scripts/_test-prerender.mjs.
 * Intercepts Firestore REST calls with fixtures so the prerenderer can be
 * exercised without touching the live database. Never loaded in production.
 */

import { readFileSync } from "node:fs";

const IDEAS = [
  {
    name: "ideas/a1",
    fields: {
      title: { stringValue: 'AI <Tutor> & "Math"' },
      brief: { stringValue: "An app that explains hard topics with visuals & voice." },
      category: { stringValue: "Education" },
      creatorId: { stringValue: "uid1" },
      creatorName: { stringValue: "CreativeIdeas" },
      createdAt: { timestampValue: "2026-09-20T10:00:00.000Z" },
    },
  },
  {
    name: "ideas/b2",
    fields: {
      title: { stringValue: "Grocery price tracker" },
      brief: { stringValue: "Scans receipts, charts price trends per store." },
      category: { stringValue: "Finance" },
      creatorId: { stringValue: "uid1" },
      creatorName: { stringValue: "CreativeIdeas" },
      createdAt: { timestampValue: "2026-09-22T10:00:00.000Z" },
    },
  },
  {
    name: "ideas/c3",
    fields: {
      title: { stringValue: "Neighborhood tool library" },
      brief: { stringValue: "Borrow drills, ladders, sewing machines." },
      category: { stringValue: "Other" },
      creatorId: { stringValue: "uid2" },
      creatorName: { stringValue: "Dilanjan" },
      createdAt: { timestampValue: "2026-09-25T10:00:00.000Z" },
    },
  },
];

const USERS = [
  { name: "users/uid1", fields: { name: { stringValue: "CreativeIdeas" }, bio: { stringValue: "A creative mind" } } },
  { name: "users/uid2", fields: { name: { stringValue: "Dilanjan" }, bio: { stringValue: "" } } },
];

const realFetch = globalThis.fetch;

const EMPTY = process.env.FIXTURE_EMPTY === "1";

globalThis.fetch = async (url, ...rest) => {
  const u = String(url);
  if (u.includes("/documents/ideas")) {
    return new Response(JSON.stringify({ documents: EMPTY ? [] : IDEAS }), { status: 200 });
  }
  if (u.includes("/documents/users")) {
    return new Response(JSON.stringify({ documents: USERS }), { status: 200 });
  }
  return realFetch(url, ...rest);
};

if (!process.env.VITE_FIREBASE_PROJECT_ID) {
  process.env.VITE_FIREBASE_PROJECT_ID = "fixture-project";
  process.env.VITE_FIREBASE_API_KEY = "fixture-key";
}

void readFileSync;
