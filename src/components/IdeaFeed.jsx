import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { useNavigate } from "react-router-dom";
import IdeaCard from "./IdeaCard";
import { fetchIdeas } from "../firebase/ideas";
import { signInWithGoogle } from "../firebase/auth";
import { Skeleton } from "./ui/skeleton";
import { Spinner } from "./ui/spinner";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "./ui/empty";

function filterIdeas(ideas, search, category) {
  let result = ideas;
  if (category) result = result.filter((idea) => idea.category === category);
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (idea) =>
        (idea.title || "").toLowerCase().includes(q) ||
        (idea.brief || "").toLowerCase().includes(q)
    );
  }
  return result;
}

const IdeaFeed = forwardRef(function IdeaFeed({ user, search, category, surpriseTrigger }, ref) {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const cursorRef = useRef(null);
  const sentinelRef = useRef(null);
  const feedElRef = useRef(null);

  useImperativeHandle(ref, () => feedElRef.current);

  useEffect(() => {
    setLoading(true);
    setError(null);
    cursorRef.current = null;
    fetchIdeas({ pageSize: 6 }).then((res) => {
      setIdeas(res.ideas);
      cursorRef.current = res.lastDoc;
      setHasMore(res.hasMore);
      setLoading(false);
    }).catch((err) => {
      setError(err.message);
      setLoading(false);
    });
  }, [category]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await fetchIdeas({ pageSize: 6, cursor: cursorRef.current });
      setIdeas((prev) => [...prev, ...res.ideas]);
      cursorRef.current = res.lastDoc;
      setHasMore(res.hasMore);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, category]);

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

  useEffect(() => {
    if (!surpriseTrigger) return;
    const cards = feedElRef.current?.querySelectorAll("[data-card-index]");
    if (!cards?.length) return;
    const idx = Math.floor(Math.random() * cards.length);
    cards[idx].scrollIntoView({ behavior: "smooth", block: "center" });
  }, [surpriseTrigger]);

  const displayed = filterIdeas(ideas, search, category);
  const filteredOut = ideas.length - displayed.length;

  function handleAdd() {
    if (user) {
      navigate("/your-ideas");
    } else {
      signInWithGoogle();
    }
  }

  function getCardSize(idea) {
    const len = idea.brief?.length || 0;
    if (len < 40) return "xs";
    if (len < 80) return "compact";
    if (len < 160) return "default";
    if (len < 250) return "expanded";
    return "xl";
  }

  if (loading) {
    return (
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="break-inside-avoid-column mb-5">
            <Skeleton className={`rounded-xl bg-gray-900 ${i % 3 === 0 ? "h-52" : i % 3 === 1 ? "h-40" : "h-44"}`} />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center animate-fade-in-up">
        <p className="text-red-400 text-sm mb-1">Failed to load ideas</p>
        <p className="text-gray-500 text-xs max-w-md mx-auto">{error}</p>
      </div>
    );
  }

  if (!ideas.length) {
    return (
      <div className="py-24 animate-fade-in-up">
        <Empty>
          <EmptyHeader>
            <button
              onClick={handleAdd}
              className="size-16 rounded-full flex items-center justify-center transition-all cursor-pointer"
              style={{ background: "linear-gradient(to bottom right, var(--theme-accent-from), var(--theme-accent-to))" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "linear-gradient(to bottom right, var(--theme-accent-from-hover), var(--theme-accent-to-hover))"}
              onMouseLeave={(e) => e.currentTarget.style.background = "linear-gradient(to bottom right, var(--theme-accent-from), var(--theme-accent-to))"}
            >
              <svg className="size-8" style={{ color: "var(--theme-text)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </button>
            <EmptyTitle className="text-gray-400">No ideas yet</EmptyTitle>
            <EmptyDescription className="text-gray-600">Be the first to share one.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">
          <span className="text-gray-300 font-medium">{displayed.length}</span> idea{displayed.length !== 1 ? "s" : ""}
          {category && <span> in <span className="text-gray-300">{category}</span></span>}
          {filteredOut > 0 && <span> (filtered)</span>}
        </p>
      </div>

      <div ref={feedElRef}>
        {displayed.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-500">No ideas match your search.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
            {displayed.map((idea, i) => (
              <div key={idea.id} className="break-inside-avoid-column" data-card-index={i}>
                <IdeaCard idea={idea} index={i} cardSize={getCardSize(idea)} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div ref={sentinelRef} className="flex justify-center py-10">
        {loadingMore && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Spinner className="text-[var(--theme-spinner)]" />
            Loading more ideas...
          </div>
        )}
      </div>
    </div>
  );
});

export default IdeaFeed;
