import { ModeToggle } from "@/components/theme/ModeToggle";

export function MapHeader() {
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2">
      <div className="bg-background/80 backdrop-blur-sm p-2 rounded-lg shadow-lg">
        <ModeToggle />
      </div>
    </div>
  );
}
