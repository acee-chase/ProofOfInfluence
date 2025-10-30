import { Card } from "@/components/ui/card";
import { BarChart, Eye } from "lucide-react";

interface LinkAnalytics {
  title: string;
  clicks: number;
}

interface AnalyticsViewProps {
  totalClicks: number;
  totalViews: number;
  topLinks: LinkAnalytics[];
}

export default function AnalyticsView({ totalClicks, totalViews, topLinks }: AnalyticsViewProps) {
  const maxClicks = Math.max(...topLinks.map((link) => link.clicks), 1);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <BarChart className="h-5 w-5" />
        Analytics
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="p-4 bg-muted/50">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Eye className="h-4 w-4" />
            Profile Views
          </div>
          <div className="text-3xl font-bold" data-testid="text-total-views">
            {totalViews.toLocaleString()}
          </div>
        </Card>

        <Card className="p-4 bg-muted/50">
          <div className="text-muted-foreground text-sm mb-1">Total Clicks</div>
          <div className="text-3xl font-bold" data-testid="text-total-clicks">
            {totalClicks.toLocaleString()}
          </div>
        </Card>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-3">Top Links</h4>
        <div className="space-y-3">
          {topLinks.map((link, index) => {
            const percentage = (link.clicks / maxClicks) * 100;
            return (
              <div key={index} data-testid={`analytics-link-${index}`}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="truncate flex-1 mr-2">{link.title}</span>
                  <span className="font-medium" data-testid={`text-link-clicks-${index}`}>
                    {link.clicks}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
