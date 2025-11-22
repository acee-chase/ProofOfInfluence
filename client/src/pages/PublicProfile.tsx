import React, { useEffect } from "react";
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
  Loader2,
  ExternalLink,
} from "lucide-react";

interface PublicProfileData {
  profile: {
    id: string;
    name: string;
    bio: string | null;
    avatarUrl: string | null;
    totalViews: number;
    isPublic: boolean;
  };
  user: {
    id: string;
    username: string;
  };
  links: Array<{
    id: string;
    title: string;
    url: string;
    clicks: number;
  }>;
  stats: {
    views: number;
    linksCount: number;
  };
  isOwner: boolean;
}

export default function PublicProfile() {
  const { theme } = useTheme();
  const [, params] = useRoute("/:username");
  const username = params?.username || "unknown";

  // Fetch real profile data
  const { data, isLoading, error } = useQuery<PublicProfileData>({
    queryKey: ['/api/profile', username],
    queryFn: async () => {
      const res = await fetch(`/api/profile/${username}`);
      if (res.status === 404) {
        throw new Error('NOT_FOUND');
      }
      if (!res.ok) {
        throw new Error('FAILED');
      }
      return res.json();
    },
  });

  // Store referral info in localStorage (if not owner)
  useEffect(() => {
    if (data?.profile?.id && !data.isOwner) {
      localStorage.setItem('ref_profile_id', data.profile.id);
      localStorage.setItem('ref_username', username);
      localStorage.setItem('ref_timestamp', Date.now().toString());
    }
  }, [data, username]);

  // Handle link click with tracking
  const handleLinkClick = async (linkId: string, url: string) => {
    // Track click (fire and forget)
    fetch(`/api/links/${linkId}/click`, { method: 'POST' })
      .catch(() => {});
    
    // Open link in new tab
    window.open(url, '_blank');
  };

  // Loading state
  if (isLoading) {
    return (
      <PageLayout>
        <Section>
          <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className={cn(
                "w-12 h-12 animate-spin mx-auto mb-4",
                theme === 'cyberpunk' ? 'text-cyan-400' : 'text-blue-500'
              )} />
              <p className={cn(
                "text-sm opacity-70",
                theme === 'cyberpunk' ? 'font-rajdhani' : 'font-poppins'
              )}>
                Loading profile...
              </p>
            </div>
          </div>
        </Section>
      </PageLayout>
    );
  }

  // Error state - 404
  if (error && (error as Error).message === 'NOT_FOUND') {
    return (
      <PageLayout>
        <Section>
          <div className="max-w-4xl mx-auto">
            <ThemedCard className="p-12 text-center">
              <div className={cn(
                "text-6xl mb-4",
                theme === 'cyberpunk' ? 'text-cyan-400/20' : 'text-slate-300'
              )}>
                404
              </div>
              <h2 className={cn(
                "text-2xl font-bold mb-2",
                theme === 'cyberpunk' ? 'font-orbitron' : 'font-fredoka'
              )}>
                Profile Not Found
              </h2>
              <p className="text-sm opacity-70 mb-6">
                The user @{username} doesn't exist or their profile is private.
              </p>
              <a
                href="/"
                className={cn(
                  "inline-block px-6 py-2 rounded-lg transition-all",
                  theme === 'cyberpunk'
                    ? 'bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-300 border border-cyan-400/30'
                    : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                )}
              >
                Go Home
              </a>
            </ThemedCard>
          </div>
        </Section>
      </PageLayout>
    );
  }

  // Error state - General
  if (error) {
    return (
      <PageLayout>
        <Section>
          <div className="max-w-4xl mx-auto">
            <ThemedCard className="p-12 text-center">
              <h2 className={cn(
                "text-2xl font-bold mb-2",
                theme === 'cyberpunk' ? 'font-orbitron text-red-400' : 'font-fredoka text-red-600'
              )}>
                Error Loading Profile
              </h2>
              <p className="text-sm opacity-70 mb-6">
                Something went wrong. Please try again later.
              </p>
              <button
                onClick={() => window.location.reload()}
                className={cn(
                  "inline-block px-6 py-2 rounded-lg transition-all",
                  theme === 'cyberpunk'
                    ? 'bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-300 border border-cyan-400/30'
                    : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                )}
              >
                Reload Page
              </button>
            </ThemedCard>
          </div>
        </Section>
      </PageLayout>
    );
  }

  // Main profile view
  const profile = data!;

  // Example badges (still mock for now)
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
                {profile.profile.avatarUrl ? (
                  <img
                    src={profile.profile.avatarUrl}
                    alt={profile.profile.name}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover ring-4 ring-cyan-400/20"
                  />
                ) : (
                  <div className={cn(
                    'w-32 h-32 md:w-40 md:h-40 rounded-full mb-3',
                    theme === 'cyberpunk'
                      ? 'bg-gradient-to-br from-cyan-400/40 to-pink-500/40 ring-4 ring-cyan-400/20'
                      : 'bg-gradient-to-br from-blue-200 to-purple-200 ring-4 ring-blue-200'
                  )} />
                )}

                <div className="flex items-center justify-center gap-2 mt-3">
                  <Star className={cn(
                    'w-5 h-5',
                    theme === 'cyberpunk' ? 'text-yellow-400' : 'text-yellow-500'
                  )} />
                  <span className={cn(
                    'font-bold',
                    theme === 'cyberpunk' ? 'font-orbitron text-cyan-300' : 'font-poppins text-blue-600'
                  )}>
                    Level 4
                  </span>
                </div>
              </div>

              {/* Info */}
              <div>
                <h1 className={cn(
                  'text-2xl md:text-3xl font-bold mb-1',
                  theme === 'cyberpunk' ? 'font-orbitron' : 'font-fredoka'
                )}>
                  {profile.profile.name}
                </h1>
                <div className="flex items-center gap-2 text-sm opacity-70 mb-3">
                  <span>@{profile.user.username}</span>
                  {data && data.isOwner && (
                    <>
                      <span>•</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-xs",
                        theme === 'cyberpunk'
                          ? 'bg-cyan-400/20 text-cyan-300'
                          : 'bg-blue-100 text-blue-700'
                      )}>
                        Your Profile
                      </span>
                    </>
                  )}
                </div>

                {profile.profile.bio && (
                  <p className="text-sm opacity-90 mb-4">{profile.profile.bio}</p>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <ThemedCard className="p-3 text-center">
                    <div className="text-xs opacity-70 mb-1">Views</div>
                    <div className={cn(
                      'font-bold',
                      theme === 'cyberpunk' ? 'font-rajdhani text-cyan-300' : 'font-poppins text-blue-600'
                    )}>
                      {profile.stats.views}
                    </div>
                  </ThemedCard>
                  <ThemedCard className="p-3 text-center">
                    <div className="text-xs opacity-70 mb-1">Links</div>
                    <div className={cn(
                      'font-bold',
                      theme === 'cyberpunk' ? 'font-rajdhani text-cyan-300' : 'font-poppins text-blue-600'
                    )}>
                      {profile.stats.linksCount}
                    </div>
                  </ThemedCard>
                  <ThemedCard className="p-3 text-center">
                    <div className="text-xs opacity-70 mb-1">Level</div>
                    <div className={cn(
                      'font-bold',
                      theme === 'cyberpunk' ? 'font-rajdhani text-cyan-300' : 'font-poppins text-blue-600'
                    )}>
                      4
                    </div>
                  </ThemedCard>
                </div>
              </div>
            </div>
          </ThemedCard>

          {/* Links Section */}
          {profile.links.length > 0 && (
            <ThemedCard className="p-6 mb-6">
              <h3 className={cn(
                'text-lg font-bold mb-4',
                theme === 'cyberpunk' ? 'font-rajdhani text-cyan-200' : 'font-poppins text-slate-900'
              )}>
                Links
              </h3>
              <div className="space-y-3">
                {profile.links.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => handleLinkClick(link.id, link.url)}
                    className={cn(
                      'w-full flex items-center justify-between p-4 rounded-lg transition-all group',
                      theme === 'cyberpunk'
                        ? 'bg-slate-900/60 border border-cyan-400/20 hover:border-cyan-400/40 hover:bg-slate-900/80'
                        : 'bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    )}
                  >
                    <span className="font-medium">{link.title}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs opacity-70">{link.clicks} clicks</span>
                      <ExternalLink className={cn(
                        'w-4 h-4 transition-transform group-hover:scale-110',
                        theme === 'cyberpunk' ? 'text-cyan-400' : 'text-blue-500'
                      )} />
                    </div>
                  </button>
                ))}
              </div>
            </ThemedCard>
          )}

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

          {/* Recent Activity - mock for now */}
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
