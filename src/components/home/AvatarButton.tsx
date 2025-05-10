import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";
import { UserPlus } from "lucide-react";

export function AvatarButton() {
  return (
    <SignInButton mode="modal">
      <Button className="flex items-center gap-2 bg-[#4F5BD5] text-white font-bold rounded-full px-6 py-2 hover:bg-[#3b47a1] transition-colors">
        <UserPlus size={20} strokeWidth={2} />
        Sign in
      </Button>
    </SignInButton>
  );
}
