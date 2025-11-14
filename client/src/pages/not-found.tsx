import React from "react";
import { Link } from "wouter";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { ThemedCard, ThemedButton } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import {
  Home,
  Search,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

export default function NotFound() {
  const { theme } = useTheme();

  const quickLinks = [
    { label: "首页", href: "/" },
    { label: "TGE 启动", href: "/tge" },
    { label: "早鸟计划", href: "/early-bird" },
    { label: "Dashboard", href: "/app" },
  ];

  return (
    <PageLayout>
      <Section>
        <div className="max-w-2xl mx-auto text-center py-12">
          {/* 404 Icon */}
          <div className={cn(
            'mx-auto w-32 h-32 rounded-lg mb-6 flex items-center justify-center',
            theme === 'cyberpunk'
              ? 'bg-gradient-to-br from-cyan-400/20 to-pink-500/20 border border-cyan-400/40 animate-pulse'
              : 'bg-gradient-to-br from-blue-100 to-purple-100 border border-blue-200'
          )}>
            <AlertCircle className={cn(
              'w-16 h-16',
              theme === 'cyberpunk' ? 'text-cyan-400' : 'text-blue-600'
            )} />
          </div>

          {/* Error Code */}
          <div className={cn(
            'text-6xl md:text-8xl font-extrabold mb-4',
            theme === 'cyberpunk'
              ? 'font-orbitron text-cyan-300 [text-shadow:_0_0_30px_rgba(34,211,238,0.5)]'
              : 'font-fredoka text-blue-600'
          )}>
            404
          </div>

          {/* Error Message */}
          <h1 className={cn(
            'text-2xl md:text-3xl font-bold mb-3',
            theme === 'cyberpunk' ? 'font-orbitron' : 'font-fredoka'
          )}>
            {theme === 'cyberpunk' ? 'Signal Lost' : 'Page Not Found'}
          </h1>

          <p className={cn(
            'text-sm md:text-base opacity-80 mb-8',
            theme === 'cyberpunk' ? 'text-slate-300' : 'text-slate-600'
          )}>
            {theme === 'cyberpunk'
              ? '无法连接到指定端点。请检查 URL 或返回主界面。'
              : '抱歉，我们找不到您要访问的页面。'}
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 mb-12">
            <Link href="/">
              <ThemedButton emphasis size="lg">
                <Home className="w-5 h-5 mr-2" />
                返回首页
              </ThemedButton>
            </Link>

            <ThemedButton variant="outline" size="lg" onClick={() => window.history.back()}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              返回上一页
            </ThemedButton>
          </div>

          {/* Quick Links */}
          <ThemedCard className="p-6">
            <h3 className={cn(
              'text-lg font-bold mb-4 flex items-center justify-center gap-2',
              theme === 'cyberpunk' ? 'font-rajdhani text-cyan-200' : 'font-poppins text-slate-900'
            )}>
              <Search className="w-5 h-5" />
              或者访问这些页面
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <ThemedCard hover className="p-4 cursor-pointer text-center">
                    <div className="text-sm font-semibold">{link.label}</div>
                  </ThemedCard>
                </Link>
              ))}
            </div>
          </ThemedCard>

          {/* Error Code */}
          <div className={cn(
            'mt-8 text-xs opacity-50 font-mono',
            theme === 'cyberpunk' ? 'font-rajdhani' : 'font-poppins'
          )}>
            ERROR_CODE: 404_PAGE_NOT_FOUND
          </div>
        </div>
      </Section>
    </PageLayout>
  );
}
