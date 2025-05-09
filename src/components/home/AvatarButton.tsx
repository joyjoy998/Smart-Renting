import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";
import { UserPlus } from "lucide-react";

export function AvatarButton() {
  return (
    <SignInButton mode="modal">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full w-11 h-11 [&_svg]:!size-5"
      >
        <UserPlus size={24} strokeWidth={2} />
      </Button>
    </SignInButton>
  );
}
