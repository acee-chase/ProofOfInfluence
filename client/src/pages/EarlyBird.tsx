import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import {
  Gift,
  Clock,
  CheckCircle2,
  Circle,
  Trophy,
  Users,
  Coins,
  ArrowRight,
  LogIn,
  Zap,
} from "lucide-react";

// Early-Bird Task Interface
interface EarlyBirdTask {
  id: string;
  title: string;
  description: string;
  reward: number;
  icon: any;
  actionLink?: string;
  actionText?: string;
}

// User Task Progress Interface
interface UserTaskProgress {
  taskId: string;
  completed: boolean;
  completedAt?: string;
  claimed: boolean;
}

// Campaign Stats Interface
interface CampaignStats {
  totalParticipants: number;
  participantCap?: number;
  totalRewardsDistributed: string;
  totalRewardPool: string;
  endDate: string;
}

// User Rewards Summary Interface
interface UserRewardsSummary {
  totalEarned: number;
  totalPotential: number;
  tasksCompleted: number;
  totalTasks: number;
}

// Fallback data
const DEFAULT_TASKS: EarlyBirdTask[] = [
  {
    id: "register_verify_email",
    title: "注册并验证邮箱",
    description: "创建账户并验证您的邮箱地址",
    reward: 10,
    icon: CheckCircle2,
    actionLink: "/login",
    actionText: "立即注册",
  },
  {
    id: "complete_profile",
    title: "完善个人资料",
    description: "设置用户名、头像和个人简介",
    reward: 5,
    icon: Users,
    actionLink: "/app/settings",
    actionText: "完善资料",
  },
  {
    id: "connect_wallet",
    title: "连接钱包",
    description: "连接您的 Web3 钱包地址",
    reward: 10,
    icon: Coins,
    actionLink: "/app/settings",
    actionText: "连接钱包",
  },
  {
    id: "first_trade",
    title: "首次交易",
    description: "在市场上完成第一笔 POI 代币交易",
    reward: 20,
    icon: Zap,
    actionLink: "/app/market",
    actionText: "开始交易",
  },
  {
    id: "join_community",
    title: "加入社区",
    description: "加入我们的 Discord 或 Telegram 社区",
    reward: 5,
    icon: Users,
    actionLink: "/tge#community",
    actionText: "加入社区",
  },
];

export default function EarlyBird() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch campaign stats
  const { data: campaignStats } = useQuery<CampaignStats>({
    queryKey: ["/api/early-bird/stats"],
    queryFn: async () => {
      const response = await fetch("/api/early-bird/stats");
      if (!response.ok) throw new Error("Failed to fetch campaign stats");
      return response.json();
    },
    staleTime: 1000 * 60, // Cache for 1 minute
  });

  // Fetch user rewards (only if authenticated)
  const { data: userRewards } = useQuery<UserRewardsSummary>({
    queryKey: ["/api/early-bird/user/rewards"],
    queryFn: async () => {
      const response = await fetch("/api/early-bird/user/rewards", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch user rewards");
      return response.json();
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 30, // Cache for 30 seconds
  });

  // Fetch user task progress (only if authenticated)
  const { data: userProgress } = useQuery<UserTaskProgress[]>({
    queryKey: ["/api/early-bird/user/progress"],
    queryFn: async () => {
      const response = await fetch("/api/early-bird/user/progress", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch user progress");
      return response.json();
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 30,
  });

  // Countdown to campaign end
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!campaignStats?.endDate) return;

    const calculateTimeLeft = () => {
      const difference = new Date(campaignStats.endDate).getTime() - new Date().getTime();
      
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [campaignStats?.endDate]);

  // Check if a task is completed
  const isTaskCompleted = (taskId: string): boolean => {
    if (!userProgress) return false;
    const progress = userProgress.find(p => p.taskId === taskId);
    return progress?.completed || false;
  };

  // Calculate completion progress
  const completionPercentage = userRewards
    ? Math.round((userRewards.tasksCompleted / userRewards.totalTasks) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Header lang="zh" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-semibold">
            <Gift className="w-4 h-4" />
            <span>早鸟空投计划</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight text-white">
            Early-Bird Airdrop
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto">
            完成简单任务，赚取免费 POI 代币奖励
          </p>

          {/* Countdown */}
          {campaignStats?.endDate && (
            <Card className="max-w-2xl mx-auto p-6 bg-slate-800/50 border-slate-700">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-semibold text-white">活动倒计时</h3>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "天", value: timeLeft.days },
                  { label: "时", value: timeLeft.hours },
                  { label: "分", value: timeLeft.minutes },
                  { label: "秒", value: timeLeft.seconds },
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-yellow-400">
                      {String(item.value).padStart(2, "0")}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{item.label}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Campaign Stats */}
      {campaignStats && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-700/50">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">参与人数</h3>
              </div>
              <div className="text-3xl font-bold text-blue-400">
                {campaignStats.totalParticipants.toLocaleString()}
                {campaignStats.participantCap && (
                  <span className="text-lg text-slate-400">
                    {" "}/ {campaignStats.participantCap.toLocaleString()}
                  </span>
                )}
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-700/50">
              <div className="flex items-center gap-3 mb-2">
                <Coins className="w-6 h-6 text-green-400" />
                <h3 className="text-lg font-semibold text-white">已分发奖励</h3>
              </div>
              <div className="text-3xl font-bold text-green-400">
                {parseFloat(campaignStats.totalRewardsDistributed).toLocaleString()} POI
              </div>
              <div className="text-sm text-slate-400 mt-1">
                总奖励池: {parseFloat(campaignStats.totalRewardPool).toLocaleString()} POI
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-700/50">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">奖励进度</h3>
              </div>
              <Progress 
                value={
                  (parseFloat(campaignStats.totalRewardsDistributed) / 
                  parseFloat(campaignStats.totalRewardPool)) * 100
                } 
                className="h-3 mt-3"
              />
              <div className="text-sm text-slate-400 mt-2">
                {Math.round(
                  (parseFloat(campaignStats.totalRewardsDistributed) / 
                  parseFloat(campaignStats.totalRewardPool)) * 100
                )}% 已分发
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* User Rewards Summary (if authenticated) */}
      {isAuthenticated && userRewards && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <Card className="p-8 bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-700">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">您的奖励</h2>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-blue-400">
                    {userRewards.totalEarned}
                  </span>
                  <span className="text-xl text-slate-400">
                    / {userRewards.totalPotential} POI
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-2">
                  已完成 {userRewards.tasksCompleted} / {userRewards.totalTasks} 个任务
                </p>
              </div>

              <div className="w-full md:w-64">
                <Progress value={completionPercentage} className="h-4" />
                <p className="text-sm text-slate-400 mt-2 text-center md:text-right">
                  完成度: {completionPercentage}%
                </p>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/app">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  查看详细进度
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      )}

      {/* Login Prompt (if not authenticated) */}
      {!isAuthenticated && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <Card className="p-8 bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600 text-center">
            <LogIn className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">
              登录查看您的奖励进度
            </h2>
            <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
              注册或登录账户，立即开始赚取 POI 代币奖励。完成任务越多，获得的奖励越丰厚！
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <LogIn className="mr-2 w-5 h-5" />
                  立即注册/登录
                </Button>
              </Link>
              <Link href="/tge">
                <Button size="lg" variant="outline" className="border-slate-600 hover:bg-slate-800">
                  了解更多
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      )}

      {/* Tasks List */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">任务列表</h2>
          <p className="text-xl text-slate-400">
            完成以下任务，赚取 POI 代币奖励
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {DEFAULT_TASKS.map((task) => {
            const Icon = task.icon;
            const completed = isTaskCompleted(task.id);

            return (
              <Card
                key={task.id}
                className={`p-6 transition-all ${
                  completed
                    ? "bg-green-900/20 border-green-700/50"
                    : "bg-slate-800/50 border-slate-700 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      completed
                        ? "bg-green-500/20"
                        : "bg-blue-500/10"
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 ${
                        completed ? "text-green-400" : "text-blue-400"
                      }`}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-xl font-bold text-white">
                        {task.title}
                      </h3>
                      <Badge
                        variant={completed ? "default" : "outline"}
                        className={
                          completed
                            ? "bg-green-500/20 text-green-400 border-green-500/50"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/50"
                        }
                      >
                        +{task.reward} POI
                      </Badge>
                    </div>

                    <p className="text-slate-400 mb-4">{task.description}</p>

                    {completed ? (
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-semibold">已完成</span>
                      </div>
                    ) : (
                      task.actionLink && (
                        <Link href={task.actionLink}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                          >
                            {task.actionText || "开始"}
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                        </Link>
                      )
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <Card className="p-12 bg-gradient-to-r from-blue-900 to-purple-900 border-blue-700 text-center">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {isAuthenticated ? "继续完成任务" : "立即开始赚取奖励"}
          </h2>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            {isAuthenticated
              ? "完成更多任务，获得更多 POI 代币。所有奖励将在 TGE 后分发到您的钱包。"
              : "注册账户，完成简单任务，即可获得免费的 POI 代币空投。早鸟优惠，名额有限！"}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link href="/login">
                  <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 px-8 text-lg">
                    立即注册
                  </Button>
                </Link>
                <Link href="/tge">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 px-8 text-lg"
                  >
                    了解 TGE
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/app">
                  <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 px-8 text-lg">
                    查看我的进度
                  </Button>
                </Link>
                <Link href="/referral">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 px-8 text-lg"
                  >
                    邀请好友获得更多
                  </Button>
                </Link>
              </>
            )}
          </div>
        </Card>
      </section>

      <Footer lang="zh" />
    </div>
  );
}

