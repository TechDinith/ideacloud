import { useState, useEffect, useRef } from "react";
import SEO from "../components/SEO";
import IdeaFeed from "../components/IdeaFeed";

const taglines = [
  "Browse ideas from creative minds",
  "Find your next big project",
  "Where ideas meet opportunity",
  "Connect with builders",
  "Discover what's possible",
];

const categories = ["Technology", "Education", "Health", "Finance", "Design", "Music", "Art", "Food", "Travel", "Other"];

export default function Home({ user, surpriseTrigger }) {
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const feedRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => {
      setTaglineIndex((i) => (i + 1) % taglines.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="min-h-screen bg-gray-950">
      <SEO title="Home" path="/" />
      <div className="relative">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "var(--theme-overlay)" }} />
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 size-80 rounded-full blur-3xl pointer-events-none" style={{ background: "var(--theme-glow-1)" }} />
        <div className="absolute top-1/3 right-1/4 size-64 rounded-full blur-3xl pointer-events-none" style={{ background: "var(--theme-glow-2)" }} />
        <div className="absolute -bottom-48 left-1/2 -translate-x-1/2 size-[40rem] max-w-[100vw] rounded-full blur-3xl pointer-events-none" style={{ background: "var(--theme-glow-3)" }} />
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-20 relative">
          <div className="text-center space-y-4">
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-[var(--theme-from)] via-[var(--theme-via)] to-[var(--theme-to)] bg-clip-text text-transparent">
              IdeaCloud
            </h1>
            <p className="text-gray-400 text-lg max-w-md mx-auto h-7 transition-all duration-500 animate-fade-in-up" key={taglineIndex}>
              {taglines[taglineIndex]}
            </p>
          </div>

          <div className="max-w-xl mx-auto mt-8 space-y-4">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                aria-label="Search ideas"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ideas..."
                className="w-full h-10 rounded-xl bg-gray-900/80 border border-gray-800 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[var(--theme-ring)] focus:ring-1 focus:ring-[var(--theme-ring)] transition-all"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setCategory("")}
                aria-pressed={!category}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium border transition-all cursor-pointer ${
                  !category
                    ? "border-[var(--theme-ring)] text-white bg-[var(--theme-ring)]/10"
                    : "border-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-300"
                }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCategory(c === category ? "" : c)}
                  aria-pressed={category === c}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium border transition-all cursor-pointer ${
                    category === c
                      ? "border-[var(--theme-ring)] text-white bg-[var(--theme-ring)]/10"
                      : "border-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-300"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-6 pb-16 -mt-6 relative">
        <IdeaFeed
          ref={feedRef}
          user={user}
          search={search}
          category={category}
          surpriseTrigger={surpriseTrigger}
        />
      </div>
    </main>
  );
}
