import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import POITokenPrice from "@/components/POITokenPrice";
import {
  Coins,
  FileText,
  TrendingUp,
  Code,
  Download,
  ExternalLink,
  Shield,
  Users,
  Zap,
} from "lucide-react";

export default function Token() {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", label: "概述", icon: Coins },
    { id: "whitepaper", label: "白皮书", icon: FileText },
    { id: "tokenomics", label: "代币经济学", icon: TrendingUp },
    { id: "technical", label: "技术文档", icon: Code },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Header lang="zh" />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0f1015] to-[#0a0a0f]">
        <div className="absolute inset-0 bg-[length:40px_40px] opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)'
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <Badge className="bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30 font-rajdhani font-bold px-4 py-1">
              $POI TOKEN
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-orbitron font-bold">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">
                POI 代币文档
              </span>
            </h1>

            {/* Token Price Display */}
            <div className="py-6">
              <POITokenPrice />
            </div>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Proof of Influence 生态系统的核心价值载体
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <Card className="p-4 bg-[#1a1a24]/60 border-neon-cyan/20 rounded-sm backdrop-blur-sm lg:sticky lg:top-24">
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm font-rajdhani font-bold transition-all ${
                        isActive
                          ? 'bg-neon-cyan/20 text-neon-cyan border-l-2 border-neon-cyan'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{section.label}</span>
                    </button>
                  );
                })}
              </nav>
            </Card>
          </aside>

          {/* Content Area */}
          <div className="flex-1">
            {activeSection === "overview" && (
              <div className="prose prose-invert max-w-none">
                <Card className="p-8 bg-[#1a1a24]/60 border-neon-cyan/20 rounded-sm backdrop-blur-sm">
                  <h2 className="text-3xl font-orbitron font-bold text-white mb-6">
                    $POI 代币概述
                  </h2>
                  
                  <div className="space-y-6 text-gray-300 leading-relaxed">
                    <p>
                      POI (Proof of Influence) 是 ACEE Ventures 生态系统的原生功能型代币，
                      旨在将社交影响力转化为可量化、可交易的数字资产。
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 not-prose">
                      <div className="p-6 bg-black/30 border border-neon-cyan/20 rounded-sm">
                        <div className="text-neon-cyan font-rajdhani font-bold mb-2">代币标准</div>
                        <div className="text-white text-2xl font-bold">ERC-20</div>
                      </div>
                      <div className="p-6 bg-black/30 border border-neon-purple/20 rounded-sm">
                        <div className="text-neon-purple font-rajdhani font-bold mb-2">总供应量</div>
                        <div className="text-white text-2xl font-bold">1,000,000,000</div>
                      </div>
                      <div className="p-6 bg-black/30 border border-neon-pink/20 rounded-sm">
                        <div className="text-neon-pink font-rajdhani font-bold mb-2">区块链</div>
                        <div className="text-white text-2xl font-bold">Base</div>
                      </div>
                      <div className="p-6 bg-black/30 border border-neon-green/20 rounded-sm">
                        <div className="text-neon-green font-rajdhani font-bold mb-2">合约审计</div>
                        <div className="text-white text-2xl font-bold">已完成</div>
                      </div>
                    </div>

                    <h3 className="text-2xl font-orbitron font-bold text-white mt-8 mb-4">
                      核心功能
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-neon-cyan mt-1 flex-shrink-0" />
                        <span>平台治理：代币持有者参与平台决策和生态发展方向</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-neon-cyan mt-1 flex-shrink-0" />
                        <span>手续费折扣：持有 POI 可享受交易手续费优惠</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-neon-cyan mt-1 flex-shrink-0" />
                        <span>质押奖励：质押 POI 获得平台手续费分成</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-neon-cyan mt-1 flex-shrink-0" />
                        <span>创作者激励：用于奖励优质内容创作者和社区贡献者</span>
                      </li>
                    </ul>
                  </div>
                </Card>
              </div>
            )}

            {activeSection === "whitepaper" && (
              <Card className="p-8 bg-[#1a1a24]/60 border-neon-purple/20 rounded-sm backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-orbitron font-bold text-white">
                    POI 白皮书
                  </h2>
                  <Button className="bg-neon-purple/20 border border-neon-purple text-neon-purple hover:bg-neon-purple/30">
                    <Download className="w-4 h-4 mr-2" />
                    下载 PDF
                  </Button>
                </div>
                
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed">
                    完整的技术白皮书将详细介绍 POI 代币的经济模型、技术架构、
                    应用场景和生态规划。文档持续更新中...
                  </p>
                  <Button variant="outline" className="mt-4 border-neon-purple text-neon-purple">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    在线阅读完整版
                  </Button>
                </div>
              </Card>
            )}

            {activeSection === "tokenomics" && (
              <Card className="p-8 bg-[#1a1a24]/60 border-neon-pink/20 rounded-sm backdrop-blur-sm">
                <h2 className="text-3xl font-orbitron font-bold text-white mb-6">
                  代币经济学
                </h2>
                
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-orbitron font-bold text-neon-pink mb-4">
                      代币分配
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "社区奖励", percent: "40%", color: "neon-cyan" },
                        { label: "团队与顾问", percent: "20%", color: "neon-purple" },
                        { label: "生态发展", percent: "25%", color: "neon-pink" },
                        { label: "流动性", percent: "15%", color: "neon-green" },
                      ].map((item, idx) => (
                        <div key={idx} className={`p-4 bg-black/30 border border-${item.color}/20 rounded-sm text-center`}>
                          <div className={`text-${item.color} text-2xl font-bold mb-1`}>
                            {item.percent}
                          </div>
                          <div className="text-gray-400 text-sm">{item.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-orbitron font-bold text-neon-pink mb-4">
                      释放计划
                    </h3>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-neon-cyan mt-1" />
                        <span>TGE 时释放 10% 流通供应</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-neon-cyan mt-1" />
                        <span>团队代币锁定 12 个月，之后 24 个月线性释放</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-neon-cyan mt-1" />
                        <span>社区奖励根据生态发展需求动态释放</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            )}

            {activeSection === "technical" && (
              <Card className="p-8 bg-[#1a1a24]/60 border-neon-green/20 rounded-sm backdrop-blur-sm">
                <h2 className="text-3xl font-orbitron font-bold text-white mb-6">
                  技术文档
                </h2>
                
                <div className="space-y-6">
                  <div className="p-6 bg-black/30 border border-neon-green/20 rounded-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-orbitron font-bold text-neon-green">
                        智能合约
                      </h3>
                      <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
                        已部署
                      </Badge>
                    </div>
                    <div className="space-y-2 text-gray-400 font-mono text-sm">
                      <div>合约地址: 0x...</div>
                      <div>区块链: Base Mainnet</div>
                      <div>标准: ERC-20</div>
                    </div>
                    <Button variant="outline" className="mt-4 border-neon-green text-neon-green hover:bg-neon-green/10">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      在 Basescan 查看
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-black/20 border border-gray-700 rounded-sm">
                      <Shield className="w-8 h-8 text-neon-cyan mb-3" />
                      <h4 className="font-rajdhani font-bold text-white mb-2">安全审计</h4>
                      <p className="text-gray-400 text-sm">合约已通过第三方安全审计</p>
                    </div>
                    <div className="p-4 bg-black/20 border border-gray-700 rounded-sm">
                      <Users className="w-8 h-8 text-neon-purple mb-3" />
                      <h4 className="font-rajdhani font-bold text-white mb-2">开源代码</h4>
                      <p className="text-gray-400 text-sm">源代码已在 GitHub 公开</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </section>

      <Footer lang="zh" />
    </div>
  );
}

