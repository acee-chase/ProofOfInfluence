import { GripVertical, Trash2, Eye, EyeOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export interface LinkEditorData {
  id: string;
  title: string;
  url: string;
  visible: boolean;
  clicks: number;
  position?: number;
  isNew?: boolean;
  isDirty?: boolean;
}

interface LinkEditorProps {
  link: LinkEditorData;
  onUpdate: (id: string, updates: Partial<LinkEditorData>) => void;
  onDelete: (id: string) => void;
  dragHandleProps?: any;
  disabled?: boolean;
}

export default function LinkEditor({ link, onUpdate, onDelete, dragHandleProps, disabled }: LinkEditorProps) {
  return (
    <Card className="p-4" data-testid={`link-editor-${link.id}`}>
      <div className="flex items-start gap-3">
        <div
          {...dragHandleProps}
          className="cursor-grab active:cursor-grabbing pt-3"
          data-testid={`drag-handle-${link.id}`}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <Label htmlFor={`title-${link.id}`} className="text-sm font-medium mb-1.5 block">
              Title
            </Label>
            <Input
              id={`title-${link.id}`}
              value={link.title}
              onChange={(e) => onUpdate(link.id, { title: e.target.value })}
              placeholder="Link title"
              data-testid={`input-title-${link.id}`}
              disabled={disabled}
            />
          </div>

          <div>
            <Label htmlFor={`url-${link.id}`} className="text-sm font-medium mb-1.5 block">
              URL
            </Label>
            <Input
              id={`url-${link.id}`}
              value={link.url}
              onChange={(e) => onUpdate(link.id, { url: e.target.value })}
              placeholder="https://example.com"
              className="font-mono text-sm"
              data-testid={`input-url-${link.id}`}
              disabled={disabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id={`visible-${link.id}`}
                checked={link.visible}
                onCheckedChange={(checked) => onUpdate(link.id, { visible: checked })}
                data-testid={`switch-visible-${link.id}`}
                disabled={disabled}
              />
              <Label htmlFor={`visible-${link.id}`} className="text-sm flex items-center gap-1.5">
                {link.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {link.visible ? "Visible" : "Hidden"}
              </Label>
            </div>

            <span className="text-xs text-muted-foreground" data-testid={`text-clicks-${link.id}`}>
              {link.clicks} clicks
            </span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(link.id)}
          className="flex-shrink-0"
          data-testid={`button-delete-${link.id}`}
          disabled={disabled}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
