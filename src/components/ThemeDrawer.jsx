import { themes } from "../lib/themes";
import { useTheme } from "../lib/ThemeContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";

export default function ThemeDrawer({ open, onOpenChange }) {
  const { theme, setTheme } = useTheme();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-72 bg-gray-900 border-gray-800 text-gray-300">
        <SheetHeader>
          <SheetTitle className="text-gray-100">Theme</SheetTitle>
        </SheetHeader>

        <div className="space-y-3 px-6">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTheme(t.id); onOpenChange(false); }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border transition-all cursor-pointer ${
                theme === t.id
                  ? "border-gray-500 bg-gray-800"
                  : "border-gray-800 bg-gray-900/50 hover:bg-gray-800/50"
              }`}
            >
              <div className="flex gap-1">
                {t.swatch.map((color, i) => (
                  <div
                    key={i}
                    className="size-4 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-300">{t.label}</span>
              {theme === t.id && (
                <svg className="size-4 ml-auto text-gray-400" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
