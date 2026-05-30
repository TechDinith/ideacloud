import { useState } from "react";
import { Button } from "./ui/button";
import { addIdea } from "../firebase/ideas";

const categories = ["Technology", "Education", "Health", "Finance", "Design", "Music", "Art", "Food", "Travel", "Other"];

export default function IdeaForm({ user, onIdeaAdded }) {
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [category, setCategory] = useState("Technology");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !brief.trim()) return;
    setSubmitting(true);
    try {
      await addIdea({
        title: title.trim(),
        brief: brief.trim(),
        category,
        creatorId: user.uid,
        creatorName: user.displayName || user.email,
      });
      setTitle("");
      setBrief("");
      setCategory("Technology");
      onIdeaAdded?.();
    } catch (err) {
      console.error("Failed to add idea:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
      <h2 className="text-lg font-semibold bg-gradient-to-r from-[var(--theme-from)] to-[var(--theme-via)] bg-clip-text text-transparent">Post a New Idea</h2>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Title</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your idea a name..."
          className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--theme-ring)]"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Brief</label>
        <textarea
          required
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="Describe your idea in a few sentences..."
          rows={3}
          className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--theme-ring)] resize-none"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-ring)]"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Posting..." : "Post Idea"}
      </Button>
    </form>
  );
}
