import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { signInWithGoogle, logOut } from "../firebase/auth";
import ThemeDrawer from "./ThemeDrawer";
import { Sheet, SheetContent } from "./ui/sheet";

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  function closeMobileNav() { setMobileNavOpen(false); }

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-5 sm:px-6 py-3 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
      <Link to="/" className="text-lg font-bold tracking-tight bg-gradient-to-r from-[var(--theme-from)] via-[var(--theme-via)] to-[var(--theme-to)] bg-clip-text text-transparent">
        IdeaCloud
      </Link>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <>
              <Link to="/your-ideas">
                <Button variant="ghost" size="sm" className="text-gray-300">
                  Your Ideas
                </Button>
              </Link>
              <button
                type="button"
                onClick={() => navigate("/settings")}
                className="rounded-full border border-gray-700 px-3 py-1 text-sm text-gray-300 hover:text-white hover:border-gray-600 transition-all cursor-pointer"
              >
                {user.displayName || user.email}
              </button>
              <Button type="button" variant="outline" size="sm" onClick={async () => { await logOut(); navigate("/"); }}>
                Sign Out
              </Button>
            </>
          ) : (
            <Button variant="default" size="sm" onClick={signInWithGoogle}>
              Sign in with Google
            </Button>
          )}
        </div>

        <button
          type="button"
          aria-label="Change theme"
          onClick={() => setDrawerOpen(true)}
          className="size-8 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 transition-all cursor-pointer"
        >
          <svg className="size-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25m18 0a3.75 3.75 0 0 0-5.304 0l-6.401 6.402M21 17.25A3.75 3.75 0 0 0 17.25 21M7.5 4.875a3.75 3.75 0 0 0 5.25 0m0 0a3.75 3.75 0 0 0 5.25 0M7.5 4.875a3.75 3.75 0 0 0-5.25 0m0 0A3.75 3.75 0 0 0 4.875 7.5m-5.25 0A3.75 3.75 0 0 0 7.5 4.875M4.875 16.5a3.75 3.75 0 0 0 5.25 0m0 0a3.75 3.75 0 0 0 5.25 0" />
          </svg>
        </button>

        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setMobileNavOpen(true)}
          className="sm:hidden size-8 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 transition-all cursor-pointer"
        >
          <svg className="size-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>

      <ThemeDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-72 bg-gray-950 border-gray-800 text-gray-300 pt-16">
          <div className="flex flex-col gap-6 px-6">
            <Link to="/" onClick={closeMobileNav} className="text-lg font-bold tracking-tight bg-gradient-to-r from-[var(--theme-from)] via-[var(--theme-via)] to-[var(--theme-to)] bg-clip-text text-transparent">
              IdeaCloud
            </Link>

            <div className="flex flex-col gap-2">
              {user ? (
                <>
                  <Link to="/your-ideas" onClick={closeMobileNav}>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-gray-300">
                      Your Ideas
                    </Button>
                  </Link>
                  <Link to="/settings" onClick={closeMobileNav}>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-gray-300">
                      Settings
                    </Button>
                  </Link>
                  <div className="pt-2 border-t border-gray-800">
                    <p className="text-sm text-gray-500 mb-2 truncate">{user.displayName || user.email}</p>
                    <Button type="button" variant="outline" size="sm" className="w-full" onClick={async () => { closeMobileNav(); await logOut(); navigate("/"); }}>
                      Sign Out
                    </Button>
                  </div>
                </>
              ) : (
                <Button variant="default" size="sm" className="w-full" onClick={() => { closeMobileNav(); signInWithGoogle(); }}>
                  Sign in with Google
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
