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

        <div className="flex items-center">
          <div className="w-11 h-11 flex items-center justify-center">
            <ThemeToggle />
          </div>
          <SignedOut>
            <div className="w-full flex items-center justify-between px-6 py-3">
              <AvatarButton />
            </div>
          </SignedOut>
          <SignedIn>
            <div className="w-11 h-11 flex items-center justify-center">
              <UserButton data-testid="avatar-button" />
            </div>
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
