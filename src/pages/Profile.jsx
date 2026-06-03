import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { fetchUserIdeas } from "../firebase/ideas";
import SEO from "../components/SEO";
import IdeaCard from "../components/IdeaCard";
import { Button } from "../components/ui/button";

export default function Profile() {
  const { uid } = useParams();
  const [profile, setProfile] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    async function load() {
      try {
        const [userSnap, userIdeas] = await Promise.all([
          getDoc(doc(db, "users", uid)),
          fetchUserIdeas(uid),
        ]);
        if (cancelledRef.current) return;
        if (userSnap.exists()) setProfile(userSnap.data());
        setIdeas(userIdeas);
      } catch {
        if (cancelledRef.current) return;
      }
      setLoading(false);
    }
    load();
    return () => { cancelledRef.current = true; };
  }, [uid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="size-8 border-2 border-[var(--theme-spinner)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400 text-lg">User not found.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950">
      <SEO title={profile.name} description={profile.bio || `${profile.name}'s ideas on IdeaCloud.`} path={`/profile/${uid}`} />
      <div className="relative">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "var(--theme-overlay)" }} />
        <div className="absolute top-0 left-1/3 size-72 max-w-[100vw] rounded-full blur-3xl pointer-events-none" style={{ background: "var(--theme-glow-1)" }} />
        <div className="absolute -bottom-32 right-1/4 size-64 max-w-[100vw] rounded-full blur-3xl pointer-events-none" style={{ background: "var(--theme-glow-2)" }} />
        <div className="max-w-4xl mx-auto px-5 sm:px-6 py-16 relative">
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6 flex flex-col sm:flex-row items-start justify-between gap-4 animate-fade-in-up">
            <div className="text-left">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--theme-from)] via-[var(--theme-via)] to-[var(--theme-to)] bg-clip-text text-transparent">
                {profile.name}
              </h1>
              {profile.bio && (
                <p className="text-gray-400 text-sm mt-1 max-w-lg">{profile.bio}</p>
              )}
            </div>
            <a href={`mailto:${profile.email}`} className="shrink-0">
              <Button variant="outline" size="sm">
                Contact via Email
              </Button>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-6 pb-16 -mt-6 relative">
        <h2 className="text-xl font-semibold text-white mb-4">
          Ideas <span className="text-gray-500 text-base font-normal">({ideas.length})</span>
        </h2>
        {ideas.length === 0 ? (
          <p className="text-gray-500">No ideas posted yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ideas.map((idea, i) => (
              <IdeaCard key={idea.id} idea={idea} index={i} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
