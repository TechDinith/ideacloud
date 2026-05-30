import IdeaFeed from "../components/IdeaFeed";

export default function Home({ user }) {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="relative">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "var(--theme-overlay)" }} />
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 size-80 rounded-full blur-3xl pointer-events-none" style={{ background: "var(--theme-glow-1)" }} />
        <div className="absolute top-1/3 right-1/4 size-64 rounded-full blur-3xl pointer-events-none" style={{ background: "var(--theme-glow-2)" }} />
        <div className="absolute -bottom-48 left-1/2 -translate-x-1/2 size-[40rem] rounded-full blur-3xl pointer-events-none" style={{ background: "var(--theme-glow-3)" }} />
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-24 relative">
          <div className="text-center space-y-4">
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-[var(--theme-from)] via-[var(--theme-via)] to-[var(--theme-to)] bg-clip-text text-transparent">
              IdeaCloud
            </h1>
            <p className="text-gray-400 text-lg max-w-md mx-auto">
              Browse ideas from creative minds.
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-5 sm:px-6 pb-16 -mt-8 relative">
        <IdeaFeed user={user} />
      </div>
    </div>
  );
}
