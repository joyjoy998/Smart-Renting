import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { AvatarButton } from "./AvatarButton";
import { SearchBox } from "./SearchBox";
import { SignedOut, SignedIn, UserButton } from "@clerk/nextjs";

export function Header() {
  return (
    <header className="fixed top-0 w-full z-50 ">
      <div className="h-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <SearchBox />
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <SignedOut>
            <AvatarButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
