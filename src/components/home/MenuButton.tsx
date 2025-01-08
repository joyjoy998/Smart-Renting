import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/stores/useSidebarStore";

export function MenuButton() {
  const setOpen = useSidebarStore((state) => state.setOpen);
  return (
    <Button
      variant="ghost"
      size="icon"
      className="hover:bg-transparent"
      onClick={() => setOpen(true)}
    >
      <Menu className="h-5 w-5 text-black" />
    </Button>
  );
}
