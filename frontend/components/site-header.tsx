import Link from "next/link";

const navLinks = ["How it works", "Examples", "For workshops", "For suppliers"];

export function SiteHeader({ minimal = false }: { minimal?: boolean }) {
  if (minimal) {
    return (
      <header className="border-b-[1.5px] border-ink">
        <div className="flex h-20 items-center px-4 sm:px-14">
          <Link href="/" className="font-display text-[34px] font-extrabold leading-none">
            MakeLocal
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b-[1.5px] border-ink">
      <div className="mx-auto flex h-16 w-full max-w-[1080px] items-center justify-between gap-6 px-4 sm:px-10">
        <Link href="/" className="font-display text-[28px] font-extrabold leading-none">
          MakeLocal
        </Link>
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex gap-7 text-[15px] font-medium">
            {navLinks.map((label) => (
              <li key={label}>
                <a href="#" className="underline-offset-4 hover:underline">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-4 sm:gap-6">
          <a href="#" className="text-[15px] font-medium underline-offset-4 hover:underline">
            Log in
          </a>
          <a
            href="#"
            className="rounded-lg bg-ink px-4 py-2.5 text-[14px] font-semibold whitespace-nowrap text-sun hover:bg-ink/90"
          >
            List your workshop
          </a>
        </div>
      </div>
    </header>
  );
}
