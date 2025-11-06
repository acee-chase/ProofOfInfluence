import React, { useMemo, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import POITokenPrice from "@/components/POITokenPrice";
import { useAuth } from "@/hooks/useAuth";
import {
  Rocket,
  Layers,
  Users,
  Building2,
  FileText,
  Coins,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Zap,
  Globe,
  Lock,
} from "lucide-react";

// i18n/config (ZH only for now; extendable to EN)
const zh = {
  brand: "ACEE Ventures",
  hero: {
    title: "引领社交金融创新",
    subtitle: "打造影响力变现平台",
    description:
      "projectX 是我们的主力产品，$POI 作为流量价值载体，帮助创作者和品牌将影响力转化为真实价值。通过一体化平台实现代币发行、社区管理和价值流通。",
    primaryCTA: "开始使用",
    secondaryCTA: "了解更多",
  },
  features: {
    title: "平台优势",
    items: [
      {
        icon: Zap,
        title: "一站式服务",
        desc: "从代币发行到社区管理，所有功能集成在统一仪表盘",
      },
      {
        icon: Globe,
        title: "多角色支持",
        desc: "为品牌方、创作者和开发者提供定制化解决方案",
      },
      {
        icon: Lock,
        title: "安全合规",
        desc: "严格遵守 KYC/AML 要求，确保平台安全可靠",
      },
      {
        icon: TrendingUp,
        title: "生态增长",
        desc: "通过 $POI 代币激励和治理机制促进生态发展",
      },
    ],
  },
  quickLinks: {
    title: "快速导航",
    products: {
      title: "产品",
      desc: "探索我们的产品生态",
      icon: Layers,
      href: "/products",
    },
    creators: {
      title: "创作者专区",
      desc: "为创作者打造的工具",
      icon: Users,
      href: "/for-creators",
    },
    brands: {
      title: "品牌专区",
      desc: "助力品牌进入 Web3",
      icon: Building2,
      href: "/for-brands",
    },
    useCases: {
      title: "应用案例",
      desc: "查看真实应用场景",
      icon: FileText,
      href: "/use-cases",
    },
    token: {
      title: "Token & 文档",
      desc: "$POI 白皮书与文档",
      icon: Coins,
      href: "/token-docs",
    },
    compliance: {
      title: "合规",
      desc: "了解我们的合规政策",
      icon: ShieldCheck,
      href: "/compliance",
    },
  },
  cta: {
    title: "准备好开始了吗？",
    description: "立即连接钱包，访问您的专属 projectX",
    button: "进入 projectX",
  },
};

export default function Landing() {
  const [lang, setLang] = useState("zh");
  const t = useMemo(() => zh, [lang]);
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Header lang={lang} />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight text-white">
            {t.hero.title}
          </h1>
          <p className="text-2xl md:text-3xl text-slate-300 font-semibold">
            {t.hero.subtitle}
          </p>
          
          {/* POI Token Price Display */}
          <div className="py-6">
            <POITokenPrice />
          </div>
          
          <p className="text-lg text-slate-400 leading-relaxed max-w-3xl mx-auto">
            {t.hero.description}
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link href={isAuthenticated ? "/app" : "/login"}>
              <Button
                size="lg"
                className="bg-white text-slate-900 hover:bg-slate-100 px-8 text-xl py-6"
              >
                {t.hero.primaryCTA}
              </Button>
            </Link>
            <Link href="/products">
              <Button
                size="lg"
                variant="outline"
                className="border-slate-700 hover:bg-slate-800 px-8 text-xl py-6"
              >
                {t.hero.secondaryCTA}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-white mb-12">
          {t.features.title}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.features.items.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="p-6 bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-all"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-white mb-12">
          {t.quickLinks.title}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(t.quickLinks)
            .filter((item) => typeof item === "object" && "href" in item)
            .map((item: any) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Card className="p-6 bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-all cursor-pointer group h-full">
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-slate-300" />
                      </div>
                      <h3 className="text-xl font-semibold text-white">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {item.desc}
                      </p>
                      <div className="flex items-center text-sm text-slate-400 group-hover:text-white transition-colors pt-2">
                        了解更多 <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <Card className="p-12 bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600 text-center">
          <div className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              {t.cta.title}
            </h2>
            <p className="text-lg text-slate-300">
              {t.cta.description}
            </p>
            <Link href={isAuthenticated ? "/app" : "/login"}>
              <Button
                size="lg"
                className="bg-white text-slate-900 hover:bg-slate-100 px-8 text-xl py-6"
              >
                {t.cta.button}
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      <Footer lang={lang} />
    </div>
  );
}
