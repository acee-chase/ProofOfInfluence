import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LinkButtonProps {
  title: string;
  url: string;
  clicks?: number;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export default function LinkButton({ title, url, clicks, icon, onClick }: LinkButtonProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Card
      className="w-full py-4 px-6 cursor-pointer hover-elevate active-elevate-2 transition-all duration-200"
      onClick={handleClick}
      data-testid={`link-button-${title.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {icon && <div className="flex-shrink-0">{icon}</div>}
          <span className="text-base md:text-lg font-medium truncate">{title}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {clicks !== undefined && (
            <Badge variant="secondary" className="text-xs" data-testid={`badge-clicks-${title}`}>
              {clicks} clicks
            </Badge>
          )}
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </Card>
  );
}
