import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";

interface AddLinkButtonProps {
  onClick: () => void;
}

export default function AddLinkButton({ onClick }: AddLinkButtonProps) {
  return (
    <Card
      className="w-full py-6 cursor-pointer border-dashed border-2 hover-elevate active-elevate-2 transition-all duration-200"
      onClick={onClick}
      data-testid="button-add-link"
    >
      <div className="flex items-center justify-center gap-2 text-muted-foreground">
        <Plus className="h-5 w-5" />
        <span className="text-base font-medium">Add New Link</span>
      </div>
    </Card>
  );
}
