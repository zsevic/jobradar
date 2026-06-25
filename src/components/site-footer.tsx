export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-800/80 px-6 py-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 text-center text-sm text-slate-500 sm:flex-row sm:text-left">
        <p>
          Built by{" "}
          <a
            href="https://sevic.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-cyan-300/90 underline decoration-cyan-500/40 underline-offset-2 transition hover:text-cyan-200"
          >
            sevic.dev
          </a>
        </p>
        <p className="text-slate-600">© {new Date().getFullYear()} JobRadar</p>
      </div>
    </footer>
  );
}
