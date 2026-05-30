import { themes } from "../lib/themes";
import { useTheme } from "../lib/ThemeContext";

export default function ThemeDrawer({ open, onClose }) {
  const { theme, setTheme } = useTheme();

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      )}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-gray-900 border-l border-gray-800 shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Theme</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTheme(t.id); onClose(); }}
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
                  <svg className="size-4 ml-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
