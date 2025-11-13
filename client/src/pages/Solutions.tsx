import { useState } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import {
  Coins,
  TrendingUp,
  Image,
  Vote,
  Wallet,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
  Users,
  Target,
  Globe,
  Building2,
  Sparkles,
  Gift,
  MessageCircle,
  CheckCircle2,
  Rocket,
} from "lucide-react";

export default function Solutions() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("products");

  // Products data
  const products = [
    {
      icon: Coins,
      title: "代币发行",
      description: "轻松创建和发行 ERC-20 代币，无需编写智能合约代码。支持自定义代币经济模型、分配规则和销毁机制。",
      features: [
        "一键发行 ERC-20 代币",
        "自定义代币经济模型",
        "自动流动性管理",
        "多链支持（Ethereum, Base, Arbitrum）",
      ],
    },
    {
      icon: TrendingUp,
      title: "质押挖矿",
      description: "为您的代币设置质押池，让社区成员通过质押获得奖励。支持灵活的质押期限和收益率配置。",
      features: [
        "灵活的质押周期设置",
        "动态收益率调整",
        "自动复利功能",
        "实时收益追踪",
      ],
    },
    {
      icon: Image,
      title: "NFT 服务",
      description: "创建和管理 NFT 集合，支持白名单铸造、盲盒机制和版税设置。适用于艺术品、会员卡和数字藏品。",
      features: [
        "ERC-721 / ERC-1155 支持",
        "白名单和空投功能",
        "版税自动分配",
        "元数据托管服务",
      ],
    },
    {
      icon: Vote,
      title: "治理平台",
      description: "构建去中心化治理系统，让代币持有者参与项目决策。支持提案创建、投票和自动执行。",
      features: [
        "链上治理提案",
        "多签钱包集成",
        "投票权重计算",
        "提案自动执行",
      ],
    },
  ];

  // Creator features
  const creatorFeatures = [
    {
      icon: Coins,
      title: "轻松发币",
      description: "无需技术背景，几分钟内创建您的专属代币。设置代币名称、符号和总量，开始您的 Web3 之旅。",
    },
    {
      icon: Users,
      title: "社区激励",
      description: "通过代币空投、质押奖励和持币福利激励您的粉丝，建立更紧密的社区联系。",
    },
    {
      icon: Gift,
      title: "专属福利",
      description: "为代币持有者提供独家内容、早期访问权和特殊福利，增强粉丝忠诚度。",
    },
    {
      icon: TrendingUp,
      title: "收益变现",
      description: "通过代币销售、会员订阅和创作者经济模式实现内容变现，获得持续收益。",
    },
  ];

  // Brand features
  const brandFeatures = [
    {
      icon: Rocket,
      title: "快速发行",
      description: "从品牌代币创建到上线交易，全流程只需几天。我们的团队提供一对一技术支持。",
    },
    {
      icon: Users,
      title: "用户激励",
      description: "通过代币奖励激励用户参与、消费和推广，构建品牌忠诚度计划2.0。",
    },
    {
      icon: Target,
      title: "精准营销",
      description: "基于链上数据分析用户行为，实现精准的营销投放和用户触达。",
    },
    {
      icon: TrendingUp,
      title: "品牌增值",
      description: "通过代币化运营提升品牌价值，为用户提供资产增值预期，增强品牌吸引力。",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Header lang="zh" />

      {/* Hero Section - Cyberpunk Style */}
      <section className="relative overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 bg-[length:40px_40px] opacity-20"
          style={{
            backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)'
          }}
        />
        
        {/* Scan line effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-neon-cyan/5 via-transparent to-transparent h-32 animate-scan-line" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-32">
          <div className="text-center space-y-8">
            {/* Glowing badge */}
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-neon-cyan/10 border border-neon-cyan/30 rounded-sm text-neon-cyan text-sm font-rajdhani font-bold tracking-wider backdrop-blur-sm">
              <Zap className="w-4 h-4" />
              <span>ACEE SOLUTIONS</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-orbitron font-bold leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink animate-neon-pulse">
                Web3 解决方案
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-light">
              为创作者、品牌和企业提供完整的区块链技术服务
            </p>

            {/* Glowing divider */}
            <div className="h-px max-w-md mx-auto bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent" />
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Custom Tab List - Cyberpunk Style */}
          <TabsList className="w-full bg-black/40 border border-neon-cyan/20 p-1 rounded-sm backdrop-blur-md mb-12">
            <TabsTrigger 
              value="products"
              className="flex-1 data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan data-[state=active]:border data-[state=active]:border-neon-cyan/50 rounded-sm font-rajdhani font-bold tracking-wider transition-all"
            >
              <Coins className="w-4 h-4 mr-2" />
              产品服务
            </TabsTrigger>
            <TabsTrigger 
              value="creators"
              className="flex-1 data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple data-[state=active]:border data-[state=active]:border-neon-purple/50 rounded-sm font-rajdhani font-bold tracking-wider transition-all"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              创作者专区
            </TabsTrigger>
            <TabsTrigger 
              value="brands"
              className="flex-1 data-[state=active]:bg-neon-pink/20 data-[state=active]:text-neon-pink data-[state=active]:border data-[state=active]:border-neon-pink/50 rounded-sm font-rajdhani font-bold tracking-wider transition-all"
            >
              <Building2 className="w-4 h-4 mr-2" />
              品牌专区
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-12">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, index) => {
                const Icon = product.icon;
                return (
                  <Card
                    key={index}
                    className="group relative p-6 bg-[#1a1a24]/80 border border-neon-cyan/20 rounded-sm hover:border-neon-cyan/50 transition-all backdrop-blur-sm"
                  >
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 bg-neon-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm" />
                    
                    <div className="relative space-y-4">
                      <div className="w-14 h-14 bg-neon-cyan/10 border border-neon-cyan/30 rounded-sm flex items-center justify-center">
                        <Icon className="w-7 h-7 text-neon-cyan" />
                      </div>
                      
                      <h3 className="text-2xl font-orbitron font-bold text-white">
                        {product.title}
                      </h3>
                      
                      <p className="text-gray-400 leading-relaxed">
                        {product.description}
                      </p>
                      
                      <ul className="space-y-2">
                        {product.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-500">
                            <div className="w-1 h-1 bg-neon-cyan rounded-full mt-2 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Creators Tab */}
          <TabsContent value="creators" className="space-y-12">
            {/* Hero for creators */}
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-4xl font-orbitron font-bold mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-pink">
                  创作者经济新时代
                </span>
              </h2>
              <p className="text-xl text-gray-400">
                让你的影响力变成真实价值，建立可持续的创作者经济模式
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {creatorFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={index}
                    className="p-8 bg-[#1a1a24]/80 border border-neon-purple/20 rounded-sm hover:border-neon-purple/50 transition-all backdrop-blur-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-neon-purple/10 border border-neon-purple/30 rounded-sm flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-neon-purple" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-orbitron font-bold text-white mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-400 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Brands Tab */}
          <TabsContent value="brands" className="space-y-12">
            {/* Hero for brands */}
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-4xl font-orbitron font-bold mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-yellow">
                  品牌 Web3 升级
                </span>
              </h2>
              <p className="text-xl text-gray-400">
                将传统品牌营销升级到 Web3，开启用户参与和价值共创的新模式
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {brandFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={index}
                    className="p-8 bg-[#1a1a24]/80 border border-neon-pink/20 rounded-sm hover:border-neon-pink/50 transition-all backdrop-blur-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-neon-pink/10 border border-neon-pink/30 rounded-sm flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-neon-pink" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-orbitron font-bold text-white mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-400 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* CTA Section - Cyberpunk Style */}
      <section className="relative max-w-7xl mx-auto px-4 py-16">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[length:20px_20px] opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.2) 1px, transparent 1px)'
          }}
        />
        
        <Card className="relative p-12 bg-gradient-to-br from-[#1a1a24] to-[#0f1015] border-2 border-neon-cyan/30 rounded-sm text-center overflow-hidden">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-neon-cyan" />
          <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-neon-cyan" />
          <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-neon-cyan" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-neon-cyan" />
          
          <div className="relative space-y-6">
            <Rocket className="w-16 h-16 mx-auto text-neon-cyan animate-float" />
            
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">
                准备开始了吗？
              </span>
            </h2>
            
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              立即连接钱包，访问您的专属 ProjectX 控制台
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link href={isAuthenticated ? "/app" : "/login"}>
                <Button 
                  size="lg"
                  className="bg-neon-cyan text-black hover:bg-neon-cyan/90 font-rajdhani font-bold text-lg px-8 py-6 rounded-sm shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all"
                >
                  进入 ProjectX
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              
              <Link href="/use-cases">
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10 font-rajdhani font-bold text-lg px-8 py-6 rounded-sm"
                >
                  查看案例
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>

      <Footer lang="zh" />
    </div>
  );
}

