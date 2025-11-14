import React from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { ThemedCard, ThemedButton } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import {
  Target,
  Users,
  TrendingUp,
  Shield,
  Globe,
  Mail,
  Twitter,
  MessageCircle,
} from "lucide-react";

export default function About() {
  const { theme } = useTheme();

  const stats = [
    { label: "Total TVL", value: "$42.3M", icon: TrendingUp },
    { label: "Creators", value: "6,284", icon: Users },
    { label: "Reward Paid", value: "$3.8M", icon: Shield },
  ];

  const team = [
    { name: "Chase (CEO)", role: "前 Web3 创业者，区块链行业 5+ 年经验" },
    { name: "Annie (CMO)", role: "营销专家，曾服务多个知名 Web3 项目" },
    { name: "Simon (Advisor)", role: "技术顾问，DeFi 协议架构师" },
  ];

  const values = [
    {
      icon: Target,
      title: "使命",
      desc: "让每个人的影响力都能被公平衡量和变现",
    },
    {
      icon: Users,
      title: "愿景",
      desc: "成为全球领先的去中心化影响力经济平台",
    },
    {
      icon: Shield,
      title: "价值观",
      desc: "透明、公平、创新、用户至上",
    },
  ];

  return (
    <PageLayout>
      <Section>
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className={cn(
            'text-3xl md:text-5xl font-extrabold mb-4',
            theme === 'cyberpunk' ? 'font-orbitron' : 'font-fredoka'
          )}>
            About Us
          </h1>
          <p className={cn(
            'text-lg opacity-80',
            theme === 'cyberpunk' ? 'text-slate-300' : 'text-slate-600'
          )}>
            构建影响力经济的未来
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-12">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <ThemedCard key={stat.label} className="p-6 text-center">
                <Icon className={cn(
                  'w-10 h-10 mx-auto mb-3',
                  theme === 'cyberpunk' ? 'text-cyan-400' : 'text-blue-600'
                )} />
                <div className="text-xs opacity-70 mb-2">{stat.label}</div>
                <div className={cn(
                  'text-3xl font-bold',
                  theme === 'cyberpunk' ? 'font-orbitron text-cyan-300' : 'font-poppins text-blue-600'
                )}>
                  {stat.value}
                </div>
              </ThemedCard>
            );
          })}
        </div>
      </Section>

      {/* Mission & Vision */}
      <Section title="我们的使命与愿景">
        <div className="grid gap-6 md:grid-cols-3">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <ThemedCard key={value.title} hover className="p-6 text-center">
                <Icon className={cn(
                  'w-12 h-12 mx-auto mb-4',
                  theme === 'cyberpunk' ? 'text-pink-400' : 'text-purple-600'
                )} />
                <h3 className={cn(
                  'text-lg font-bold mb-2',
                  theme === 'cyberpunk' ? 'font-orbitron' : 'font-fredoka'
                )}>
                  {value.title}
                </h3>
                <p className="text-sm opacity-90">{value.desc}</p>
              </ThemedCard>
            );
          })}
        </div>
      </Section>

      {/* Team */}
      <Section title="核心团队" subtitle="经验丰富的 Web3 团队">
        <div className="grid gap-6 md:grid-cols-3">
          {team.map((member) => (
            <ThemedCard key={member.name} hover className="p-6">
              <div className={cn(
                'w-24 h-24 rounded-full mx-auto mb-4',
                theme === 'cyberpunk'
                  ? 'bg-gradient-to-br from-cyan-400/30 to-pink-500/30 border border-cyan-400/40'
                  : 'bg-gradient-to-br from-blue-200 to-purple-200 border border-blue-300'
              )} />
              <h4 className="text-lg font-bold text-center mb-2">{member.name}</h4>
              <p className="text-sm opacity-80 text-center">{member.role}</p>
            </ThemedCard>
          ))}
        </div>
      </Section>

      {/* Contact */}
      <Section title="联系我们">
        <ThemedCard className="p-8 max-w-2xl mx-auto">
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <a
              href="mailto:contact@proofofinfluence.com"
              className={cn(
                'flex items-center gap-2 p-3 rounded-lg transition-colors',
                theme === 'cyberpunk'
                  ? 'hover:bg-cyan-400/10'
                  : 'hover:bg-blue-50'
              )}
            >
              <Mail className="w-5 h-5" />
              <span className="text-sm">Email</span>
            </a>

            <a
              href="https://twitter.com/proofofinfluence"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center gap-2 p-3 rounded-lg transition-colors',
                theme === 'cyberpunk'
                  ? 'hover:bg-cyan-400/10'
                  : 'hover:bg-blue-50'
              )}
            >
              <Twitter className="w-5 h-5" />
              <span className="text-sm">Twitter</span>
            </a>

            <a
              href="https://discord.gg/proofofinfluence"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center gap-2 p-3 rounded-lg transition-colors',
                theme === 'cyberpunk'
                  ? 'hover:bg-cyan-400/10'
                  : 'hover:bg-blue-50'
              )}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">Discord</span>
            </a>
          </div>

          <div className="text-center">
            <Globe className={cn(
              'w-8 h-8 mx-auto mb-2 opacity-50',
              theme === 'cyberpunk' ? 'text-cyan-400' : 'text-blue-600'
            )} />
            <p className="text-sm opacity-70">
              Based in Singapore | Serving the World
            </p>
          </div>
        </ThemedCard>
      </Section>
    </PageLayout>
  );
}
