import { useNavigate } from "react-router-dom";
import { Badge } from "./ui/badge";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "./ui/card";

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

const sizes = {
  xs: {
    title: "text-sm",
    content: "text-xs leading-relaxed line-clamp-1",
  },
  compact: {
    title: "text-base",
    content: "text-sm leading-relaxed line-clamp-2",
  },
  default: {
    title: "text-lg",
    content: "text-sm leading-relaxed line-clamp-3",
  },
  expanded: {
    title: "text-lg",
    content: "text-sm leading-relaxed max-h-28 overflow-y-auto",
  },
  xl: {
    title: "text-xl",
    content: "text-base leading-relaxed max-h-32 overflow-y-auto",
  },
};

function getDefaultSize(brief) {
  const len = brief?.length || 0;
  if (len < 40) return "xs";
  if (len < 80) return "compact";
  if (len < 160) return "default";
  if (len < 250) return "expanded";
  return "xl";
}

export default function IdeaCard({ idea, index = 0, cardSize, action }) {
  const navigate = useNavigate();
  const { title, brief, category, cardColor, creatorName, creatorId, createdAt } = idea;
  const sz = sizes[cardSize || getDefaultSize(brief)];

  return (
    <Card
      className="text-white border-0 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up mb-5"
      style={{
        backgroundColor: cardColor || "#374151",
        animationDelay: `${index * 80}ms`,
      }}
    >
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary" className="bg-white/20 text-white text-xs border-0">
            {category || "General"}
          </Badge>
          <span className="text-xs text-white/60">{timeAgo(createdAt)}</span>
        </div>
        <CardTitle className={`text-white leading-tight ${sz.title}`}>{title}</CardTitle>
      </CardHeader>

      <CardContent className="pb-0">
        <p className={`text-white/70 ${sz.content}`}>{brief}</p>
      </CardContent>

      <CardFooter className="border-t border-white/15 mt-auto flex items-center justify-between">
        <button
          onClick={() => navigate(`/profile/${creatorId}`)}
          className="group/name"
        >
          <span className="text-sm rounded-full border border-white/15 px-2.5 py-0.5 text-white/70 group-hover/name:text-white group-hover/name:border-white/30 transition-all">
            {creatorName || "Anonymous"}
          </span>
        </button>
        {action && <div className="shrink-0">{action}</div>}
      </CardFooter>
    </Card>
  );
}
