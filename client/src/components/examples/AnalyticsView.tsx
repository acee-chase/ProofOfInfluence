import AnalyticsView from "../AnalyticsView";

export default function AnalyticsViewExample() {
  const mockData = {
    totalClicks: 3582,
    totalViews: 8924,
    topLinks: [
      { title: "My Website", clicks: 1234 },
      { title: "GitHub Profile", clicks: 856 },
      { title: "Twitter", clicks: 492 },
      { title: "YouTube Channel", clicks: 387 },
      { title: "LinkedIn", clicks: 213 },
    ],
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <AnalyticsView {...mockData} />
    </div>
  );
}
