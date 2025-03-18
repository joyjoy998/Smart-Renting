import { Button } from "@/components/ui/button";
import { useSignIn } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { UserPlus } from "lucide-react";

export function AvatarButton() {
  return (
    <SignInButton mode="modal">
      <Button variant="ghost" size="icon" className="rounded-full">
        <UserPlus />
      </Button>
    </SignInButton>
  );
}
