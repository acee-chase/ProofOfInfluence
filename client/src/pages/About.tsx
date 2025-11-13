import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Building2,
  Shield,
  FileText,
  CheckCircle2,
  Clock,
  Users,
  Mail,
  MapPin,
} from "lucide-react";

export default function About() {
  const [activeTab, setActiveTab] = useState("company");

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Header lang="zh" />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[length:40px_40px] opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)'
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="text-center space-y-6">
            <Badge className="bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30 font-rajdhani font-bold px-4 py-1">
              ABOUT ACEE
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-orbitron font-bold">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">
                关于我们
              </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              ACEE Ventures - 引领 Web3 影响力变现革命
            </p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-black/40 border border-neon-cyan/20 p-1 rounded-sm backdrop-blur-md mb-12">
            <TabsTrigger 
              value="company"
              className="flex-1 data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan data-[state=active]:border data-[state=active]:border-neon-cyan/50 rounded-sm font-rajdhani font-bold"
            >
              <Building2 className="w-4 h-4 mr-2" />
              公司介绍
            </TabsTrigger>
            <TabsTrigger 
              value="compliance"
              className="flex-1 data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple data-[state=active]:border data-[state=active]:border-neon-purple/50 rounded-sm font-rajdhani font-bold"
            >
              <Shield className="w-4 h-4 mr-2" />
              合规政策
            </TabsTrigger>
            <TabsTrigger 
              value="changelog"
              className="flex-1 data-[state=active]:bg-neon-pink/20 data-[state=active]:text-neon-pink data-[state=active]:border data-[state=active]:border-neon-pink/50 rounded-sm font-rajdhani font-bold"
            >
              <FileText className="w-4 h-4 mr-2" />
              更新日志
            </TabsTrigger>
          </TabsList>

          {/* Company Tab */}
          <TabsContent value="company">
            <div className="space-y-8">
              <Card className="p-8 bg-[#1a1a24]/60 border-neon-cyan/20 rounded-sm backdrop-blur-sm">
                <h2 className="text-3xl font-orbitron font-bold text-white mb-6">
                  ACEE Ventures
                </h2>
                <p className="text-gray-300 leading-relaxed mb-6">
                  ACEE Ventures 是一家专注于 Web3 技术创新的科技公司，致力于通过区块链技术
                  重塑社交影响力的价值流通方式。我们的使命是让每个人的影响力都能被公正地量化和变现。
                </p>

                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  <div className="p-6 bg-black/30 border border-neon-cyan/20 rounded-sm">
                    <Users className="w-8 h-8 text-neon-cyan mb-3" />
                    <h3 className="font-rajdhani font-bold text-white mb-2">团队</h3>
                    <p className="text-gray-400 text-sm">
                      由资深区块链开发者和金融专家组成
                    </p>
                  </div>
                  <div className="p-6 bg-black/30 border border-neon-cyan/20 rounded-sm">
                    <MapPin className="w-8 h-8 text-neon-cyan mb-3" />
                    <h3 className="font-rajdhani font-bold text-white mb-2">总部</h3>
                    <p className="text-gray-400 text-sm">
                      全球分布式团队
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance">
            <Card className="p-8 bg-[#1a1a24]/60 border-neon-purple/20 rounded-sm backdrop-blur-sm">
              <h2 className="text-3xl font-orbitron font-bold text-white mb-6">
                合规与安全
              </h2>
              
              <div className="space-y-6 text-gray-300">
                <div className="p-6 bg-black/30 border border-neon-purple/20 rounded-sm">
                  <h3 className="text-xl font-rajdhani font-bold text-white mb-4">
                    KYC/AML 政策
                  </h3>
                  <p className="leading-relaxed">
                    我们严格遵守全球反洗钱（AML）和了解你的客户（KYC）法规。
                    所有用户需通过身份验证才能访问核心交易功能。
                  </p>
                </div>

                <div className="p-6 bg-black/30 border border-neon-purple/20 rounded-sm">
                  <h3 className="text-xl font-rajdhani font-bold text-white mb-4">
                    数据隐私
                  </h3>
                  <p className="leading-relaxed">
                    我们承诺保护用户隐私，遵守 GDPR 和其他数据保护法规。
                    用户数据使用加密存储，不会未经授权分享给第三方。
                  </p>
                </div>

                <div className="p-6 bg-black/30 border border-neon-purple/20 rounded-sm">
                  <h3 className="text-xl font-rajdhani font-bold text-white mb-4">
                    风险声明
                  </h3>
                  <p className="leading-relaxed">
                    加密货币投资存在风险，代币价格可能大幅波动。
                    请只投资您能承受损失的金额，并进行充分的研究和风险评估。
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Changelog Tab */}
          <TabsContent value="changelog">
            <Card className="p-8 bg-[#1a1a24]/60 border-neon-pink/20 rounded-sm backdrop-blur-sm">
              <h2 className="text-3xl font-orbitron font-bold text-white mb-6">
                更新日志
              </h2>
              
              <div className="space-y-6">
                {[
                  {
                    version: "v2.1.0",
                    date: "2025-11-13",
                    changes: [
                      "新增 TGE 冷启动活动页面",
                      "实现早鸟空投和推荐计划",
                      "优化 Landing Page 和 Dashboard",
                      "添加空投领取功能",
                    ],
                  },
                  {
                    version: "v2.0.0",
                    date: "2025-11-01",
                    changes: [
                      "重构信息架构",
                      "新增 Market 交易模块",
                      "实现 Reserve Pool 资金池",
                      "添加商家后台功能",
                    ],
                  },
                  {
                    version: "v1.5.0",
                    date: "2025-10-15",
                    changes: [
                      "集成 Stripe 支付",
                      "优化钱包连接体验",
                      "新增访问控制系统",
                      "改进移动端适配",
                    ],
                  },
                ].map((release, idx) => (
                  <div
                    key={idx}
                    className="border-l-2 border-neon-pink/50 pl-6 relative"
                  >
                    {/* Timeline dot */}
                    <div className="absolute -left-[5px] top-0 w-2 h-2 bg-neon-pink rounded-full shadow-[0_0_10px_rgba(255,0,110,0.8)]" />
                    
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className="bg-neon-pink/20 text-neon-pink border-neon-pink/30 font-rajdhani font-bold">
                        {release.version}
                      </Badge>
                      <span className="text-gray-500 text-sm font-mono">
                        {release.date}
                      </span>
                    </div>
                    
                    <ul className="space-y-2">
                      {release.changes.map((change, changeIdx) => (
                        <li key={changeIdx} className="flex items-start gap-2 text-gray-400">
                          <CheckCircle2 className="w-4 h-4 text-neon-cyan mt-1 flex-shrink-0" />
                          <span>{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      <Footer lang="zh" />
    </div>
  );
}

