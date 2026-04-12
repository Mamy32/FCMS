import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const PageHeader = ({ title, description, actionLabel, onAction }: PageHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="gap-2">
          <Plus className="w-4 h-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default PageHeader;
