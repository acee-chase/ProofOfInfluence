import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { ThemedCard, ThemedButton, ThemedProgress } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import {
  Clock,
  Wallet,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

export default function TGE() {
  const { theme } = useTheme();

  // TGE Target date (example: December 1, 2025 12:00 UTC)
  const targetDate = new Date('2025-12-01T12:00:00Z');
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fundraising progress (example data)
  const raised = 1823000;
  const target = 5000000;
  const progress = (raised / target) * 100;

  // Participation steps
  const steps = [
    { icon: Wallet, label: "连接钱包", desc: "使用 MetaMask 或其他钱包" },
    { icon: ShieldCheck, label: "KYC 验证", desc: "完成身份验证" },
    { icon: CreditCard, label: "充值", desc: "USDC 或 ETH" },
    { icon: CheckCircle2, label: "确认", desc: "完成认购" },
  ];

  const numberBoxStyles = theme === 'cyberpunk'
    ? 'font-orbitron text-cyan-200 text-2xl md:text-3xl font-bold'
    : 'font-poppins text-blue-600 text-2xl md:text-3xl font-bold';

  const labelStyles = theme === 'cyberpunk'
    ? 'text-xs text-slate-400 mt-1 font-rajdhani'
    : 'text-xs text-slate-600 mt-1 font-poppins';

  return (
    <PageLayout>
      {/* Hero Section */}
      <Section
        title="TGE Launch"
        subtitle="代币生成事件 - 加入 ProofOfInfluence 生态系统"
      >
        <div className="grid gap-6 md:grid-cols-2">
          {/* Countdown */}
          <ThemedCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className={cn(
                'w-5 h-5',
                theme === 'cyberpunk' ? 'text-cyan-400' : 'text-blue-600'
              )} />
              <h3 className={cn(
                'text-sm font-semibold',
                theme === 'cyberpunk' ? 'font-rajdhani' : 'font-poppins'
              )}>
                距离 TGE 开始
              </h3>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {[
                { value: timeLeft.days, label: 'Days' },
                { value: timeLeft.hours, label: 'Hours' },
                { value: timeLeft.minutes, label: 'Mins' },
                { value: timeLeft.seconds, label: 'Secs' },
              ].map((item) => (
                <ThemedCard key={item.label} className="p-3 text-center">
                  <div className={numberBoxStyles}>
                    {String(item.value).padStart(2, '0')}
                  </div>
                  <div className={labelStyles}>{item.label}</div>
                </ThemedCard>
              ))}
            </div>

            <div className={cn(
              'mt-4 text-xs opacity-70 text-center',
              theme === 'cyberpunk' ? 'font-rajdhani' : 'font-poppins'
            )}>
              TGE 开始时间: UTC 2025-12-01 12:00
            </div>
          </ThemedCard>

          {/* Fundraising Progress */}
          <ThemedCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className={cn(
                'w-5 h-5',
                theme === 'cyberpunk' ? 'text-pink-400' : 'text-green-600'
              )} />
              <h3 className={cn(
                'text-sm font-semibold',
                theme === 'cyberpunk' ? 'font-rajdhani' : 'font-poppins'
              )}>
                募集进度
              </h3>
            </div>

            <div className="space-y-3">
              <div className={cn(
                'text-2xl font-bold',
                theme === 'cyberpunk' ? 'font-orbitron text-cyan-300' : 'font-poppins text-blue-600'
              )}>
                ${raised.toLocaleString()} / ${target.toLocaleString()}
              </div>

              <ThemedProgress value={progress} showLabel animated />

              <div className={cn(
                'text-xs opacity-70',
                theme === 'cyberpunk' ? 'font-rajdhani' : 'font-poppins'
              )}>
                达成每档将解锁 Early-bird / Referral 额外奖励
              </div>
            </div>
          </ThemedCard>
        </div>
      </Section>

      {/* Participation Steps */}
      <Section title="参与步骤" subtitle="四步完成 TGE 认购">
        <ThemedCard className="p-6">
          <div className="grid gap-4 md:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.label} className="text-center">
                  <div className="relative">
                    <div className={cn(
                      'mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3',
                      theme === 'cyberpunk'
                        ? 'bg-cyan-400/20 border-2 border-cyan-400/40'
                        : 'bg-blue-100 border-2 border-blue-300'
                    )}>
                      <Icon className={cn(
                        'w-8 h-8',
                        theme === 'cyberpunk' ? 'text-cyan-300' : 'text-blue-600'
                      )} />
                    </div>
                    
                    {/* Step connector line */}
                    {index < steps.length - 1 && (
                      <div className={cn(
                        'hidden md:block absolute top-8 left-1/2 w-full h-0.5',
                        theme === 'cyberpunk' ? 'bg-cyan-400/30' : 'bg-slate-200'
                      )} />
                    )}
                  </div>

                  <div className={cn(
                    'text-sm font-semibold mb-1',
                    theme === 'cyberpunk' ? 'font-rajdhani text-cyan-200' : 'font-poppins text-slate-900'
                  )}>
                    {index + 1}. {step.label}
                  </div>
                  <div className="text-xs opacity-70">{step.desc}</div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-center gap-3">
            <Link href="/early-bird">
              <ThemedButton emphasis size="lg">
                立即参与
                <ArrowRight className="w-4 h-4 ml-2" />
              </ThemedButton>
            </Link>
            <Link href="/token">
              <ThemedButton variant="outline" size="lg">
                了解更多
              </ThemedButton>
            </Link>
          </div>
        </ThemedCard>
      </Section>

      {/* Token Information */}
      <Section title="代币信息" subtitle="$POI 代币关键指标">
        <div className="grid gap-4 md:grid-cols-3">
          <ThemedCard className="p-5">
            <h4 className={cn(
              'text-sm font-semibold mb-2',
              theme === 'cyberpunk' ? 'font-rajdhani text-cyan-300' : 'font-poppins text-blue-600'
            )}>
              总供应量
            </h4>
            <div className="text-2xl font-bold mb-1">1,000,000,000</div>
            <div className="text-xs opacity-70">$POI Token</div>
          </ThemedCard>

          <ThemedCard className="p-5">
            <h4 className={cn(
              'text-sm font-semibold mb-2',
              theme === 'cyberpunk' ? 'font-rajdhani text-pink-300' : 'font-poppins text-green-600'
            )}>
              初始价格
            </h4>
            <div className="text-2xl font-bold mb-1">$0.05</div>
            <div className="text-xs opacity-70">USDC per POI</div>
          </ThemedCard>

          <ThemedCard className="p-5">
            <h4 className={cn(
              'text-sm font-semibold mb-2',
              theme === 'cyberpunk' ? 'font-rajdhani text-purple-300' : 'font-poppins text-purple-600'
            )}>
              硬顶
            </h4>
            <div className="text-2xl font-bold mb-1">$5,000,000</div>
            <div className="text-xs opacity-70">USDC raised</div>
          </ThemedCard>
        </div>
      </Section>

      {/* Risk Warning */}
      <Section>
        <ThemedCard className={cn(
          'p-6 border-2',
          theme === 'cyberpunk'
            ? 'border-red-400/40 bg-red-950/20'
            : 'border-red-200 bg-red-50'
        )}>
          <div className="flex items-start gap-3">
            <AlertCircle className={cn(
              'w-6 h-6 mt-0.5 flex-shrink-0',
              theme === 'cyberpunk' ? 'text-red-400' : 'text-red-600'
            )} />
            <div>
              <h4 className={cn(
                'font-bold mb-2',
                theme === 'cyberpunk' ? 'font-orbitron text-red-300' : 'font-fredoka text-red-700'
              )}>
                风险提示
              </h4>
              <p className="text-sm opacity-90">
                代币投资存在高风险。请仔细阅读白皮书和风险披露文件，确保您了解所有风险并具备相应的风险承受能力。请勿投资超过您能够承受损失的金额。
              </p>
            </div>
          </div>
        </ThemedCard>
      </Section>
    </PageLayout>
  );
}
