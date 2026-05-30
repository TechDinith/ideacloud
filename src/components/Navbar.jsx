import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { signInWithGoogle, logOut } from "../firebase/auth";
import ThemeDrawer from "./ThemeDrawer";

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
      <Link to="/" className="text-lg font-bold tracking-tight bg-gradient-to-r from-[var(--theme-from)] via-[var(--theme-via)] to-[var(--theme-to)] bg-clip-text text-transparent">
        IdeaCloud
      </Link>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="text-gray-300">
                Your Ideas
              </Button>
            </Link>
            <button
              onClick={() => navigate("/settings")}
              className="rounded-full border border-gray-700 px-3 py-1 text-sm text-gray-300 hover:text-white hover:border-gray-600 transition-all cursor-pointer"
            >
              {user.displayName || user.email}
            </button>
            <Button variant="outline" size="sm" onClick={logOut}>
              Sign Out
            </Button>
          </>
        ) : (
          <Button variant="default" size="sm" onClick={signInWithGoogle}>
            Sign in with Google
          </Button>
        )}
        <button
          onClick={() => setDrawerOpen(true)}
          className="size-8 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 transition-all cursor-pointer"
          title="Change theme"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25m18 0a3.75 3.75 0 0 0-5.304 0l-6.401 6.402M21 17.25A3.75 3.75 0 0 0 17.25 21M7.5 4.875a3.75 3.75 0 0 0 5.25 0m0 0a3.75 3.75 0 0 0 5.25 0M7.5 4.875a3.75 3.75 0 0 0-5.25 0m0 0A3.75 3.75 0 0 0 4.875 7.5m-5.25 0A3.75 3.75 0 0 0 7.5 4.875M4.875 16.5a3.75 3.75 0 0 0 5.25 0m0 0a3.75 3.75 0 0 0 5.25 0" />
          </svg>
        </button>
      </div>

      <ThemeDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </nav>
  );
}
