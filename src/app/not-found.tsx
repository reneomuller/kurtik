import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <h1 className="text-2xl font-bold">Tuhle stránku jsme nenašli</h1>
      <p className="mt-3">Odkaz je možná neúplný nebo zastaralý.</p>
      <Link
        href="/"
        className="mt-6 flex min-h-11 w-full items-center justify-center rounded-xl bg-clay px-4 font-semibold text-white hover:bg-clay/90"
      >
        Vybrat termín
      </Link>
    </>
  );
}
