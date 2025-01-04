import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <Moon
        className={`h-4 w-4 ${theme === "dark" ? "text-white" : "text-black"}`}
      />
      <Switch
        checked={theme === "light"}
        onCheckedChange={(checked) => setTheme(checked ? "light" : "dark")}
        className={`${
          theme === "dark" ? "[&>span]:bg-white [&]:bg-white" : ""
        }`}
      />
      <Sun
        className={`h-4 w-4 ${theme === "dark" ? "text-white" : "text-black"}`}
      />
    </div>
  );
}
