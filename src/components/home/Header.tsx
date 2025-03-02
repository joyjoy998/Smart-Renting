import { ModeToggle } from "@/components/theme/ModeToggle";
import { AvatarButton } from "./AvatarButton";
import { LanguageToggle } from "../userCustomization/LanguageToggle";
import { SearchBox } from "./SearchBox";
import { useMap } from "@vis.gl/react-google-maps";
import { useEffect } from "react";
import { SignedOut, SignedIn, UserButton } from "@clerk/nextjs";

export function Header() {
  return (
    <header className="fixed top-0 w-full z-50 ">
      <div className="h-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <SearchBox />
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />
          {/* <LanguageToggle /> */}
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
