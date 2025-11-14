import React, { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { ThemedCard, ThemedButton, ThemedProgress, ThemedTable, ThemedBadge, ThemedInput } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Copy,
  Users,
  Gift,
  Trophy,
  TrendingUp,
  Share2,
} from "lucide-react";

export default function Referral() {
  const { theme } = useTheme();
  const { toast } = useToast();

  const [referralLink] = useState("https://poi.app/r/CHASE");

  // Example data
  const myStats = {
    invites: 42,
    rewards: "$4,320",
    nextTier: 8,
  };

  // Leaderboard data
  const leaderboard = [
    { rank: 1, username: "@neo", invites: 128, reward: "$980" },
    { rank: 2, username: "@trinity", invites: 88, reward: "$620" },
    { rank: 3, username: "@morpheus", invites: 77, reward: "$540" },
    { rank: 4, username: "@smith", invites: 60, reward: "$410" },
    { rank: 5, username: "@oracle", invites: 54, reward: "$380" },
  ];

  // Reward tiers
  const tiers = [
    { invites: "1-10", reward: "$5/invite", bonus: "-" },
    { invites: "11-50", reward: "$8/invite", bonus: "+$50" },
    { invites: "51-100", reward: "$12/invite", bonus: "+$200" },
    { invites: "100+", reward: "$15/invite", bonus: "+$500" },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "已复制！",
      description: "推荐链接已复制到剪贴板",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join ProofOfInfluence',
        text: 'Join me on ProofOfInfluence and earn rewards!',
        url: referralLink,
      });
    } else {
      handleCopy();
    }
  };

  const progress = (myStats.invites / (myStats.invites + myStats.nextTier)) * 100;

  return (
    <PageLayout>
      {/* Hero Section */}
      <Section
        title="Referral Program"
        subtitle="邀请好友，共同获得丰厚奖励"
      >
        <div className="grid gap-6 md:grid-cols-3">
          <ThemedCard className="p-5">
            <Users className={cn(
              'w-8 h-8 mb-3',
              theme === 'cyberpunk' ? 'text-cyan-400' : 'text-blue-600'
            )} />
            <div className="text-sm opacity-70 mb-1">我的邀请</div>
            <div className={cn(
              'text-3xl font-bold',
              theme === 'cyberpunk' ? 'font-orbitron text-cyan-300' : 'font-poppins text-blue-600'
            )}>
              {myStats.invites}
            </div>
          </ThemedCard>

          <ThemedCard className="p-5">
            <Gift className={cn(
              'w-8 h-8 mb-3',
              theme === 'cyberpunk' ? 'text-pink-400' : 'text-green-600'
            )} />
            <div className="text-sm opacity-70 mb-1">累计奖励</div>
            <div className={cn(
              'text-3xl font-bold',
              theme === 'cyberpunk' ? 'font-orbitron text-pink-300' : 'font-poppins text-green-600'
            )}>
              {myStats.rewards}
            </div>
          </ThemedCard>

          <ThemedCard className="p-5">
            <TrendingUp className={cn(
              'w-8 h-8 mb-3',
              theme === 'cyberpunk' ? 'text-purple-400' : 'text-purple-600'
            )} />
            <div className="text-sm opacity-70 mb-1">距离下一档</div>
            <div className={cn(
              'text-3xl font-bold',
              theme === 'cyberpunk' ? 'font-orbitron text-purple-300' : 'font-poppins text-purple-600'
            )}>
              {myStats.nextTier}
            </div>
          </ThemedCard>
        </div>
      </Section>

      {/* Referral Link Section */}
      <Section title="我的推荐链接" subtitle="分享链接给好友">
        <div className="grid gap-6 md:grid-cols-2">
          <ThemedCard className="p-6">
            <label className={cn(
              'text-xs mb-2 block',
              theme === 'cyberpunk' ? 'text-slate-400 font-rajdhani' : 'text-slate-600 font-poppins'
            )}>
              推荐链接
            </label>

            <div className="flex gap-2">
              <ThemedInput
                value={referralLink}
                readOnly
                className="flex-1"
              />
              <ThemedButton
                onClick={handleCopy}
                variant="outline"
              >
                <Copy className="w-4 h-4" />
              </ThemedButton>
            </div>

            <div className="mt-4 flex gap-2">
              <ThemedButton
                emphasis
                onClick={handleShare}
                className="flex-1"
              >
                <Share2 className="w-4 h-4 mr-2" />
                分享链接
              </ThemedButton>
            </div>
          </ThemedCard>

          <ThemedCard className="p-6">
            <label className={cn(
              'text-xs mb-2 block',
              theme === 'cyberpunk' ? 'text-slate-400 font-rajdhani' : 'text-slate-600 font-poppins'
            )}>
              邀请进度
            </label>

            <ThemedProgress value={progress} showLabel animated className="mb-3" />

            <div className={cn(
              'text-xs opacity-70',
              theme === 'cyberpunk' ? 'font-rajdhani' : 'font-poppins'
            )}>
              已邀请 {myStats.invites} 人，距离下一档还差 {myStats.nextTier} 人
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <ThemedBadge variant="success">活跃用户: 38</ThemedBadge>
              <ThemedBadge variant="warning">待验证: 4</ThemedBadge>
            </div>
          </ThemedCard>
        </div>
      </Section>

      {/* Reward Tiers */}
      <Section title="奖励档位" subtitle="邀请越多，奖励越高">
        <ThemedCard className="p-6">
          <ThemedTable
            headers={["邀请人数", "单次奖励", "档位奖金", ""]}
            rows={tiers.map((tier, index) => [
              tier.invites,
              <span className={cn(
                'font-bold',
                theme === 'cyberpunk' ? 'text-cyan-300' : 'text-blue-600'
              )}>
                {tier.reward}
              </span>,
              tier.bonus === "-" ? (
                <span className="opacity-50">{tier.bonus}</span>
              ) : (
                <span className={cn(
                  'font-bold',
                  theme === 'cyberpunk' ? 'text-green-400' : 'text-green-600'
                )}>
                  {tier.bonus}
                </span>
              ),
              myStats.invites >= parseInt(tier.invites) ? (
                <ThemedBadge variant="success">已达成</ThemedBadge>
              ) : (
                <ThemedBadge>未达成</ThemedBadge>
              ),
            ])}
          />
        </ThemedCard>
      </Section>

      {/* Leaderboard */}
      <Section title="排行榜" subtitle="Top 5 推荐者">
        <ThemedCard className="p-6">
          <ThemedTable
            headers={["排名", "用户", "邀请数", "奖励"]}
            rows={leaderboard.map((item) => [
              <div className="flex items-center gap-2">
                {item.rank <= 3 && (
                  <Trophy className={cn(
                    'w-5 h-5',
                    item.rank === 1 ? 'text-yellow-500' :
                    item.rank === 2 ? 'text-gray-400' :
                    'text-orange-600'
                  )} />
                )}
                <span className="font-bold">#{item.rank}</span>
              </div>,
              <span className="font-semibold">{item.username}</span>,
              <span className={cn(
                'font-bold',
                theme === 'cyberpunk' ? 'text-cyan-300' : 'text-blue-600'
              )}>
                {item.invites}
              </span>,
              <span className={cn(
                'font-bold',
                theme === 'cyberpunk' ? 'text-green-400' : 'text-green-600'
              )}>
                {item.reward}
              </span>,
            ])}
          />
        </ThemedCard>
      </Section>

      {/* How It Works */}
      <Section title="如何运作" subtitle="简单三步开始赚取奖励">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              step: 1,
              title: "分享链接",
              desc: "将您的专属推荐链接分享给好友",
            },
            {
              step: 2,
              title: "好友注册",
              desc: "好友通过链接注册并完成验证",
            },
            {
              step: 3,
              title: "获得奖励",
              desc: "您和好友都将获得奖励",
            },
          ].map((item) => (
            <ThemedCard key={item.step} hover className="p-6 text-center">
              <div className={cn(
                'mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 text-xl font-bold',
                theme === 'cyberpunk'
                  ? 'bg-cyan-400/20 text-cyan-300 border-2 border-cyan-400/40'
                  : 'bg-blue-100 text-blue-600 border-2 border-blue-300'
              )}>
                {item.step}
              </div>
              <h4 className={cn(
                'font-bold mb-2',
                theme === 'cyberpunk' ? 'font-rajdhani' : 'font-poppins'
              )}>
                {item.title}
              </h4>
              <p className="text-sm opacity-80">{item.desc}</p>
            </ThemedCard>
          ))}
        </div>
      </Section>
    </PageLayout>
  );
}
