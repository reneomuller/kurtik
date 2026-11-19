"use client";

export default function ErrorPage({ retry }: { error: unknown; retry: () => void }) {
  return (
    <div className="mx-auto max-w-[640px]">
      <h1 className="text-2xl font-bold tracking-tight">Něco se nepovedlo</h1>
      <p className="mt-3">Stránku se teď nepodařilo načíst. Zkuste to prosím znovu.</p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-6 flex min-h-12 w-full items-center justify-center rounded-xl bg-green px-4 font-bold text-white hover:bg-green-dark"
      >
        Zkusit znovu
      </button>
    </div>
  );
}
