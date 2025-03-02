import { Button } from "@/components/ui/button";
import { useSignIn } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";

export function AvatarButton() {
  return (
    <SignInButton mode="modal">
      <Button variant="ghost" size="icon" className="rounded-full">
        <img
          src="/user-avator.png"
          alt="User avatar"
          className="h-8 w-8 rounded-full"
        />
      </Button>
    </SignInButton>
  );
}
