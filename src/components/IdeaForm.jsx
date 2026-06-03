import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
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

      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-gray-400">Title</Label>
        <Input
          id="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your idea a name..."
          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:border-[var(--theme-ring)] focus-visible:ring-[var(--theme-ring)]"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="brief" className="text-gray-400">Brief</Label>
        <Textarea
          id="brief"
          required
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="Describe your idea in a few sentences..."
          rows={3}
          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:border-[var(--theme-ring)] focus-visible:ring-[var(--theme-ring)] resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-gray-400">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white focus-visible:border-[var(--theme-ring)] focus-visible:ring-[var(--theme-ring)]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700 text-white">
            {categories.map((c) => (
              <SelectItem key={c} value={c} className="focus:bg-gray-800 focus:text-white">{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Posting..." : "Post Idea"}
      </Button>
    </form>
  );
}
