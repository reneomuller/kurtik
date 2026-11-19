import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[640px]">
      <h1 className="text-2xl font-bold tracking-tight">Tuhle stránku jsme nenašli</h1>
      <p className="mt-3">Odkaz je možná neúplný nebo zastaralý.</p>
      <Link
        href="/"
        className="mt-6 flex min-h-12 w-full items-center justify-center rounded-xl bg-green px-4 font-bold text-white hover:bg-green-dark"
      >
        Vybrat termín
      </Link>
    </div>
  );
}
