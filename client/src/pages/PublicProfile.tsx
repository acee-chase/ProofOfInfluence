import React from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { ThemedCard, ThemedBadge } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Star,
  TrendingUp,
  Users,
  Award,
  Lock,
  Trophy,
} from "lucide-react";

export default function PublicProfile() {
  const { theme } = useTheme();
  const [, params] = useRoute("/:username");
  const username = params?.username || "unknown";

  // Mock user profile data (would fetch from API)
  const profile = {
    username: `@${username}`,
    displayName: username.charAt(0).toUpperCase() + username.slice(1),
    location: "United States",
    level: 4,
    bio: "Web3 enthusiast and creator. Building the future of social finance.",
    stats: {
      pnl: "$4.3k",
      tasks: "128",
      invites: "42",
    },
  };

  // Example badges
  const badges = [
    { id: 1, earned: true, color: "from-cyan-400 to-blue-500" },
    { id: 2, earned: true, color: "from-pink-400 to-purple-500" },
    { id: 3, earned: true, color: "from-yellow-400 to-orange-500" },
    { id: 4, earned: true, color: "from-green-400 to-teal-500" },
    { id: 5, earned: false, color: "from-purple-400 to-pink-500" },
    { id: 6, earned: false, color: "from-blue-400 to-cyan-500" },
    { id: 7, earned: false, color: "from-orange-400 to-red-500" },
    { id: 8, earned: false, color: "from-indigo-400 to-purple-500" },
    { id: 9, earned: false, color: "from-red-400 to-pink-500" },
    { id: 10, earned: false, color: "from-teal-400 to-green-500" },
    { id: 11, earned: false, color: "from-violet-400 to-purple-500" },
    { id: 12, earned: false, color: "from-amber-400 to-yellow-500" },
  ];

  return (
    <PageLayout>
      <Section>
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <ThemedCard className="p-6 md:p-8 mb-6">
            <div className="grid gap-6 md:grid-cols-[200px_1fr]">
              {/* Avatar */}
              <div className="mx-auto md:mx-0">
                <div className={cn(
                  'w-32 h-32 md:w-40 md:h-40 rounded-full mb-3',
                  theme === 'cyberpunk'
                    ? 'bg-gradient-to-br from-cyan-400/40 to-pink-500/40 ring-4 ring-cyan-400/20'
                    : 'bg-gradient-to-br from-blue-200 to-purple-200 ring-4 ring-blue-200'
                )} />

                <div className="flex items-center justify-center gap-2">
                  <Star className={cn(
                    'w-5 h-5',
                    theme === 'cyberpunk' ? 'text-yellow-400' : 'text-yellow-500'
                  )} />
                  <span className={cn(
                    'font-bold',
                    theme === 'cyberpunk' ? 'font-orbitron text-cyan-300' : 'font-poppins text-blue-600'
                  )}>
                    Level {profile.level}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div>
                <h1 className={cn(
                  'text-2xl md:text-3xl font-bold mb-1',
                  theme === 'cyberpunk' ? 'font-orbitron' : 'font-fredoka'
                )}>
                  {profile.displayName}
                </h1>
                <div className="flex items-center gap-2 text-sm opacity-70 mb-3">
                  <span>{profile.username}</span>
                  <span>•</span>
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>

                <p className="text-sm opacity-90 mb-4">{profile.bio}</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(profile.stats).map(([key, value]) => (
                    <ThemedCard key={key} className="p-3 text-center">
                      <div className="text-xs opacity-70 mb-1 capitalize">{key}</div>
                      <div className={cn(
                        'font-bold',
                        theme === 'cyberpunk' ? 'font-rajdhani text-cyan-300' : 'font-poppins text-blue-600'
                      )}>
                        {value}
                      </div>
                    </ThemedCard>
                  ))}
                </div>
              </div>
            </div>
          </ThemedCard>

          {/* Badges Wall */}
          <ThemedCard className="p-6">
            <h3 className={cn(
              'text-lg font-bold mb-4 flex items-center gap-2',
              theme === 'cyberpunk' ? 'font-rajdhani text-cyan-200' : 'font-poppins text-slate-900'
            )}>
              <Award className="w-5 h-5" />
              徽章墙
            </h3>

            <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={cn(
                    'aspect-square rounded-lg transition-all relative group cursor-pointer',
                    badge.earned
                      ? `bg-gradient-to-br ${badge.color}`
                      : theme === 'cyberpunk'
                        ? 'bg-slate-800/60 border border-cyan-400/20'
                        : 'bg-slate-100 border border-slate-200'
                  )}
                >
                  {badge.earned ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white drop-shadow-lg" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className={cn(
                        'w-4 h-4 opacity-30',
                        theme === 'cyberpunk' ? 'text-slate-600' : 'text-slate-400'
                      )} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className={cn(
              'mt-4 text-center text-sm opacity-70',
              theme === 'cyberpunk' ? 'font-rajdhani' : 'font-poppins'
            )}>
              已解锁 {badges.filter(b => b.earned).length} / {badges.length} 徽章
            </div>
          </ThemedCard>

          {/* Recent Activity */}
          <ThemedCard className="p-6 mt-6">
            <h3 className={cn(
              'text-lg font-bold mb-4',
              theme === 'cyberpunk' ? 'font-rajdhani text-cyan-200' : 'font-poppins text-slate-900'
            )}>
              Recent Activity
            </h3>

            <div className="space-y-3">
              {[
                { action: "Completed Early-Bird task", time: "2 hours ago" },
                { action: "Referred a new user", time: "5 hours ago" },
                { action: "Earned 'Community Hero' badge", time: "1 day ago" },
              ].map((activity, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex justify-between p-3 rounded-lg',
                    theme === 'cyberpunk'
                      ? 'bg-slate-900/60 border border-cyan-400/10'
                      : 'bg-slate-50 border border-slate-100'
                  )}
                >
                  <span className="text-sm">{activity.action}</span>
                  <span className="text-xs opacity-70">{activity.time}</span>
                </div>
              ))}
            </div>
          </ThemedCard>
        </div>
      </Section>
    </PageLayout>
  );
}
