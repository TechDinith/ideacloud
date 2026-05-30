import { useNavigate } from "react-router-dom";
import { Badge } from "./ui/badge";

function timeAgo(timestamp) {
  if (!timestamp?.toMillis) return "";
  const diff = Date.now() - timestamp.toMillis();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function IdeaCard({ idea, index = 0 }) {
  const navigate = useNavigate();
  const { title, brief, category, cardColor, creatorName, creatorId, createdAt } = idea;

  return (
    <div
      className="rounded-xl p-5 text-white flex flex-col gap-3 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-default group animate-fade-in-up"
      style={{
        backgroundColor: cardColor || "#374151",
        animationDelay: `${index * 80}ms`,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <Badge variant="secondary" className="bg-white/20 text-white text-xs border-0">
          {category || "General"}
        </Badge>
        <span className="text-xs text-white/60">{timeAgo(createdAt)}</span>
      </div>

      <h3 className="text-lg font-semibold leading-tight group-hover:brightness-110 transition-all">{title}</h3>
      <p className="text-sm text-white/70 line-clamp-3 leading-relaxed">{brief}</p>

      <div className="mt-auto flex items-center gap-2 pt-3 border-t border-white/15">
        <button
          onClick={() => navigate(`/profile/${creatorId}`)}
          className="group/name"
        >
          <span className="text-sm rounded-full border border-white/15 px-2.5 py-0.5 text-white/70 group-hover/name:text-white group-hover/name:border-white/30 transition-all">
            {creatorName || "Anonymous"}
          </span>
        </button>
      </div>
    </div>
  );
}
