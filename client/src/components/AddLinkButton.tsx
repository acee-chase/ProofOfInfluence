import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";

interface AddLinkButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function AddLinkButton({ onClick, disabled }: AddLinkButtonProps) {
  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };

  return (
    <Card
      className={`w-full py-6 cursor-pointer border-dashed border-2 transition-all duration-200 ${
        disabled ? "opacity-60 pointer-events-none" : "hover-elevate active-elevate-2"
      }`}
      onClick={handleClick}
      aria-disabled={disabled}
      data-testid="button-add-link"
    >
      <div className="flex items-center justify-center gap-2 text-muted-foreground">
        <Plus className="h-5 w-5" />
        <span className="text-base font-medium">Add New Link</span>
      </div>
    </Card>
  );
}
