export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-slate-950 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-slate-500">
            Starlight Intelligence System — a memory layer for humans and
            agents.
          </p>
          <div className="flex gap-6 text-xs text-slate-600">
            <a
              href="https://github.com/frankxai/Starlight-Intelligence-System"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-400"
            >
              GitHub
            </a>
            <a
              href="https://arcanea.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-400"
            >
              Arcanea
            </a>
          </div>
          <p className="text-xs text-slate-700">
            Local-first. Portable. Open source.
          </p>
        </div>
      </div>
    </footer>
  );
}
