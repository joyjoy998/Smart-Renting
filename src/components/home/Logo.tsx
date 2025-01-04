import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <img src="/logo.png" alt="Logo" className="h-8 w-8 rounded-full" />
      <span className="font-semibold text-xl">Smart Renting</span>
    </Link>
  );
}
