import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { useAuth, SignInButton } from "@clerk/nextjs";

export function MenuButton() {
  const setOpen = useSidebarStore((state) => state.setOpen);
  const { isSignedIn } = useAuth();

  if (isSignedIn)
    return (
      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-transparent"
        onClick={() => setOpen(true)}
        data-testid="sidebar-menu-button"
      >
        <Menu className="h-5 w-5 text-black" />
      </Button>
    );

  return (
    <SignInButton mode="modal">
      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-transparent"
        data-testid="sidebar-menu-button"
      >
        <Menu className="h-5 w-5 text-black" />
      </Button>
    </SignInButton>
  );
}
