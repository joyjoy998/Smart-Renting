import { Button } from "@/components/ui/button";

export function AccountButton() {
  return (
    <Button variant="ghost" size="icon" className="rounded-full">
      <img
        src="/user-avator.png"
        alt="User avatar"
        className="h-8 w-8 rounded-full"
      />
    </Button>
  );
}
