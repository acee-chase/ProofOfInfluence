import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import {
  Gift,
  Users,
  Trophy,
  ArrowRight,
  Coins,
  TrendingUp,
  Loader2,
} from "lucide-react";

interface UserRewardsSummary {
  totalEarned: number;
  totalPotential: number;
  tasksCompleted: number;
  totalTasks: number;
}

export default function RewardsSummaryWidget() {
  // Fetch user rewards summary
  const { data: rewardsSummary, isLoading } = useQuery<UserRewardsSummary>({
    queryKey: ["/api/early-bird/user/rewards"],
    staleTime: 1000 * 30, // 30 seconds
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        </div>
      </Card>
    );
  }

  if (!rewardsSummary) {
    return null;
  }

  const rewardSources = [
    {
      icon: Gift,
      label: "早鸟任务",
      value: rewardsSummary.totalEarned,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      icon: Users,
      label: "推荐奖励",
      value: 0, // TODO: Implement referral rewards
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      icon: Trophy,
      label: "空投奖励",
      value: 0, // TODO: Implement airdrop rewards
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    },
  ];

  const totalRewards = rewardSources.reduce((sum, source) => sum + source.value, 0);

  return (
    <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-900 border-green-200 dark:border-slate-700">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-6 h-6 text-green-600 dark:text-green-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                我的奖励
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              您已累计获得的 POI 代币
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {totalRewards}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">POI</div>
          </div>
        </div>

        {/* Reward Sources */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rewardSources.map((source, index) => {
            const Icon = source.icon;
            return (
              <div
                key={index}
                className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg ${source.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${source.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {source.label}
                    </div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {source.value}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Potential Earnings */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                潜在奖励
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                还可获得 {rewardsSummary.totalPotential - rewardsSummary.totalEarned} POI
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                完成剩余 {rewardsSummary.totalTasks - rewardsSummary.tasksCompleted} 个任务
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Link href="/early-bird" className="flex-1">
            <Button className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600">
              <Gift className="mr-2 w-4 h-4" />
              赚取更多
            </Button>
          </Link>
          <Link href="/referral" className="flex-1">
            <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20">
              <Users className="mr-2 w-4 h-4" />
              邀请好友
            </Button>
          </Link>
        </div>

        {/* Info Note */}
        <div className="text-xs text-center text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-slate-700">
          所有奖励将在 TGE 后分发到您的钱包 •{" "}
          <Link href="/tge">
            <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
              了解详情
            </span>
          </Link>
        </div>
      </div>
    </Card>
  );
}

