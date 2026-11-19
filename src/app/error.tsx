"use client";

export default function ErrorPage({ retry }: { error: unknown; retry: () => void }) {
  return (
    <>
      <h1 className="text-2xl font-bold">Něco se nepovedlo</h1>
      <p className="mt-3">Stránku se teď nepodařilo načíst. Zkuste to prosím znovu.</p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-6 flex min-h-11 w-full items-center justify-center rounded-xl bg-clay px-4 font-semibold text-white hover:bg-clay/90"
      >
        Zkusit znovu
      </button>
    </>
  );
}
