import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { getUser, updateUserProfile } from "../firebase/users";

export default function Settings({ user }) {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  if (!user) return <Navigate to="/" replace />;

  useEffect(() => {
    getUser(user.uid).then((p) => {
      if (p) {
        setDisplayName(p.name || "");
        setBio(p.bio || "");
      }
    });
  }, [user.uid]);

  async function handleSave(e) {
    e.preventDefault();
    if (!displayName.trim()) return;
    setSaving(true);
    try {
      await updateUserProfile({ displayName: displayName.trim(), bio: bio.trim() });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="relative">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "var(--theme-overlay)" }} />
        <div className="absolute top-0 left-1/3 size-72 rounded-full blur-3xl pointer-events-none" style={{ background: "var(--theme-glow-1)" }} />
        <div className="absolute -bottom-32 right-1/4 size-64 rounded-full blur-3xl pointer-events-none" style={{ background: "var(--theme-glow-2)" }} />
        <div className="max-w-2xl mx-auto px-5 sm:px-6 py-16 relative">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--theme-from)] via-[var(--theme-via)] to-[var(--theme-to)] bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-gray-400 mt-1">Edit your public profile.</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 sm:px-6 pb-16 -mt-6 relative">
        <form onSubmit={handleSave} className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Display Name</label>
            <input
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--theme-ring)]"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people about yourself..."
              rows={3}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--theme-ring)] resize-none"
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Profile"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
