import { useEffect, useState, useCallback } from "react";
import { Navigate } from "react-router-dom";
import IdeaCard from "../components/IdeaCard";
import IdeaForm from "../components/IdeaForm";
import { Button } from "../components/ui/button";
import { fetchUserIdeas, deleteIdea } from "../firebase/ideas";

export default function Dashboard({ user }) {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!user) return <Navigate to="/" replace />;

  const loadIdeas = useCallback(async () => {
    setLoading(true);
    const data = await fetchUserIdeas(user.uid);
    setIdeas(data);
    setLoading(false);
  }, [user.uid]);

  useEffect(() => { loadIdeas(); }, [loadIdeas]);

  async function handleDelete(ideaId) {
    await deleteIdea(ideaId);
    setIdeas((prev) => prev.filter((i) => i.id !== ideaId));
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="relative">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "var(--theme-overlay)" }} />
        <div className="absolute top-0 left-1/3 size-72 rounded-full blur-3xl pointer-events-none" style={{ background: "var(--theme-glow-1)" }} />
        <div className="absolute -bottom-32 right-1/4 size-64 rounded-full blur-3xl pointer-events-none" style={{ background: "var(--theme-glow-2)" }} />
        <div className="max-w-4xl mx-auto px-5 sm:px-6 py-16 relative">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--theme-from)] via-[var(--theme-via)] to-[var(--theme-to)] bg-clip-text text-transparent">
            Your Ideas
          </h1>
          <p className="text-gray-400 mt-1">Post and manage your ideas.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-6 pb-16 space-y-10 -mt-6 relative">
        <IdeaForm user={user} onIdeaAdded={loadIdeas} />

        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            All Ideas <span className="text-gray-500 text-base font-normal">({ideas.length})</span>
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl h-44 bg-gray-900 animate-shimmer" />
              ))}
            </div>
          ) : ideas.length === 0 ? (
            <div className="text-center py-16 animate-fade-in-up">
              <div className="size-14 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(to bottom right, var(--theme-accent-from), var(--theme-accent-to))" }}>
                <svg className="size-7" style={{ color: "var(--theme-text)" }} fill="none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
              </div>
              <p className="text-gray-400 font-medium">No ideas yet</p>
              <p className="text-sm text-gray-600 mt-1">Post your first idea above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {ideas.map((idea, i) => (
                <div key={idea.id} className="relative group animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <IdeaCard idea={idea} />
                  <button
                    onClick={() => handleDelete(idea.id)}
                    className="absolute bottom-2 right-2 size-7 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/30 transition-all cursor-pointer"
                  >
                    <svg className="size-3.5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
