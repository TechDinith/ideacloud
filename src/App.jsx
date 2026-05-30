import { useEffect, useState } from "react";
import { auth } from "./firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "./lib/ThemeContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <ThemeProvider>
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
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/profile/:uid" element={<Profile />} />
            <Route path="/settings" element={<Settings user={user} />} />
          </Routes>
        </BrowserRouter>
      )}
    </ThemeProvider>
  );
}
