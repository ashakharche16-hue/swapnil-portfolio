export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
        Portfolio · in progress
      </p>

      <h1 className="mt-6 font-serif text-4xl font-semibold tracking-tight text-body sm:text-6xl">
        Swapnil Kharche
      </h1>

      <p className="mt-4 max-w-xl font-sans text-base text-muted sm:text-lg">
        Software Development Manager &amp; Technical Lead — 12+ years
        modernizing mission-critical platforms.
      </p>

      <div className="mt-10 flex items-center gap-2 font-mono text-xs text-muted">
        <span className="inline-block h-2 w-2 rounded-full bg-signal" />
        Slice 0 deployed — building the full site next
      </div>
    </main>
  );
}
