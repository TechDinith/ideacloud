import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import IdeaCard from "./IdeaCard";
import { fetchIdeas } from "../firebase/ideas";
import { signInWithGoogle } from "../firebase/auth";

export default function IdeaFeed({ user }) {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const cursorRef = useRef(null);
  const sentinelRef = useRef(null);

  useEffect(() => {
    fetchIdeas({ pageSize: 6 }).then((res) => {
      setIdeas(res.ideas);
      cursorRef.current = res.lastDoc;
      setHasMore(res.hasMore);
      setLoading(false);
    });
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const res = await fetchIdeas({ pageSize: 6, cursor: cursorRef.current });
    setIdeas((prev) => [...prev, ...res.ideas]);
    cursorRef.current = res.lastDoc;
    setHasMore(res.hasMore);
    setLoadingMore(false);
  }, [loadingMore, hasMore]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  function handleAdd() {
    if (user) {
      navigate("/dashboard");
    } else {
      signInWithGoogle();
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl h-52 bg-gray-900 animate-shimmer rounded-xl" />
        ))}
      </div>
    );
  }

  if (!ideas.length) {
    return (
      <div className="text-center py-24 animate-fade-in-up">
        <button
          onClick={handleAdd}
          className="size-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-all cursor-pointer"
          style={{ background: "linear-gradient(to bottom right, var(--theme-accent-from), var(--theme-accent-to))" }}
          onMouseEnter={(e) => e.currentTarget.style.background = "linear-gradient(to bottom right, var(--theme-accent-from-hover), var(--theme-accent-to-hover))"}
          onMouseLeave={(e) => e.currentTarget.style.background = "linear-gradient(to bottom right, var(--theme-accent-from), var(--theme-accent-to))"}
        >
          <svg className="size-8" style={{ color: "var(--theme-text)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </button>
        <p className="text-xl text-gray-400 font-medium">No ideas yet</p>
        <p className="text-sm text-gray-600 mt-1">Be the first to share one.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {ideas.map((idea, i) => (
          <IdeaCard key={idea.id} idea={idea} index={i} />
        ))}
      </div>

      <div ref={sentinelRef} className="flex justify-center py-10">
        {loadingMore && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="size-4 border-2 border-[var(--theme-spinner)] border-t-transparent rounded-full animate-spin" />
            Loading more ideas...
          </div>
        )}
      </div>
    </div>
  );
}
