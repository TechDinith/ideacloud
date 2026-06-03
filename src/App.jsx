import { useEffect, useState, lazy, Suspense } from "react";
import { auth } from "./firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "./lib/ThemeContext";
import Navbar from "./components/Navbar";

const Home = lazy(() => import("./pages/Home"));
const YourIdeas = lazy(() => import("./pages/YourIdeas"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [surpriseTrigger, setSurpriseTrigger] = useState(0);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <ThemeProvider>
      <HelmetProvider>
      {loading ? (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
          <div className="text-3xl font-bold bg-gradient-to-r from-[var(--theme-from)] via-[var(--theme-via)] to-[var(--theme-to)] bg-clip-text text-transparent" style={{ animation: "pulse-logo 1.5s ease-in-out infinite" }}>
            IdeaCloud
          </div>
          <div className="size-5 border-2 border-[var(--theme-spinner)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <BrowserRouter>
          <Navbar user={user} />
          <Toaster position="bottom-center" toastOptions={{ style: { background: "#1f2937", color: "#fff", border: "1px solid #374151" } }} />
          <Suspense fallback={
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
              <div className="size-6 border-2 border-[var(--theme-spinner)] border-t-transparent rounded-full animate-spin" />
            </div>
          }>
          <Routes>
            <Route path="/" element={<Home user={user} surpriseTrigger={surpriseTrigger} />} />
            <Route path="/your-ideas" element={<YourIdeas user={user} />} />
            <Route path="/profile/:uid" element={<Profile />} />
            <Route path="/settings" element={<Settings user={user} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
          <button
            type="button"
            aria-label="Surprise me"
            onClick={() => setSurpriseTrigger((n) => n + 1)}
            className="surprise-btn fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-white shadow-lg transition-all hover:scale-105 cursor-pointer"
          >
            <svg className="size-4 shrink-0" style={{ color: "var(--theme-text)" }} aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
            </svg>
            <span className="hidden sm:inline">Surprise Me</span>
          </button>
        </BrowserRouter>
      )}
      </HelmetProvider>
    </ThemeProvider>
  );
}
