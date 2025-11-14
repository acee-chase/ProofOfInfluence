import React, { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { ThemedCard, ThemedButton, ThemedInput } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Wallet,
  CreditCard,
  Building2,
  ArrowRight,
  CheckCircle2,
  Info,
  Shield,
} from "lucide-react";

type PaymentMethod = "onchain" | "card" | "thirdparty";

export default function Recharge() {
  const { theme } = useTheme();
  const { toast } = useToast();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("onchain");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const paymentMethods = [
    {
      id: "onchain" as const,
      icon: Wallet,
      title: "链上支付",
      desc: "使用加密钱包直接支付",
      fee: "0.5%",
    },
    {
      id: "card" as const,
      icon: CreditCard,
      title: "信用卡",
      desc: "Visa / Mastercard / Amex",
      fee: "2.9%",
    },
    {
      id: "thirdparty" as const,
      icon: Building2,
      title: "第三方支付",
      desc: "支付宝 / 微信支付",
      fee: "1.5%",
    },
  ];

  const calculateFee = (amt: string) => {
    const numAmount = parseFloat(amt) || 0;
    const feeRate = selectedMethod === "onchain" ? 0.005 
      : selectedMethod === "card" ? 0.029 
      : 0.015;
    return (numAmount * feeRate).toFixed(2);
  };

  const calculateReceived = (amt: string) => {
    const numAmount = parseFloat(amt) || 0;
    const fee = parseFloat(calculateFee(amt));
    // Mock POI price: $1 = 0.958 POI (considering fee)
    return ((numAmount - fee) * 0.958).toFixed(2);
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "错误",
        description: "请输入有效金额",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Simulate payment processing
    setTimeout(() => {
      toast({
        title: "处理中",
        description: "正在处理您的充值请求...",
      });
      
      setTimeout(() => {
        setLoading(false);
        toast({
          title: "充值成功！",
          description: `已充值 ${calculateReceived(amount)} POI 到您的账户`,
        });
        setAmount("");
      }, 2000);
    }, 1000);
  };

  return (
    <PageLayout>
      {/* Header */}
      <Section>
        <div className="max-w-4xl mx-auto">
          <h1 className={cn(
            'text-2xl font-bold text-center mb-2',
            theme === 'cyberpunk' ? 'font-orbitron text-cyan-100' : 'font-fredoka text-slate-900'
          )}>
            Recharge
          </h1>
          <p className="text-center text-sm opacity-70 mb-8">
            添加资金到您的 ProofOfInfluence 账户
          </p>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {["选择方式", "输入金额", "确认"].map((step, index) => (
              <React.Fragment key={step}>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                    theme === 'cyberpunk'
                      ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40'
                      : 'bg-blue-100 text-blue-600 border border-blue-300'
                  )}>
                    {index + 1}
                  </div>
                  <span className="text-sm hidden md:inline">{step}</span>
                </div>
                {index < 2 && (
                  <div className={cn(
                    'w-8 h-0.5',
                    theme === 'cyberpunk' ? 'bg-cyan-400/30' : 'bg-slate-200'
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Payment Methods */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedMethod === method.id;

              return (
                <ThemedCard
                  key={method.id}
                  hover
                  className={cn(
                    'p-5 cursor-pointer transition-all',
                    isSelected &&
                    (theme === 'cyberpunk'
                      ? 'border-2 border-cyan-400/50 bg-cyan-400/10'
                      : 'border-2 border-blue-500 bg-blue-50')
                  )}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <Icon className={cn(
                      'w-8 h-8',
                      isSelected
                        ? theme === 'cyberpunk'
                          ? 'text-cyan-300'
                          : 'text-blue-600'
                        : 'opacity-50'
                    )} />
                    {isSelected && (
                      <CheckCircle2 className={cn(
                        'w-5 h-5',
                        theme === 'cyberpunk' ? 'text-cyan-400' : 'text-blue-600'
                      )} />
                    )}
                  </div>

                  <h4 className="font-bold mb-1">{method.title}</h4>
                  <p className="text-xs opacity-70 mb-2">{method.desc}</p>
                  <div className="text-xs">
                    <span className="opacity-70">手续费: </span>
                    <span className={cn(
                      'font-semibold',
                      theme === 'cyberpunk' ? 'text-pink-300' : 'text-green-600'
                    )}>
                      {method.fee}
                    </span>
                  </div>
                </ThemedCard>
              );
            })}
          </div>

          {/* Amount Input */}
          <ThemedCard className="p-6 mb-6">
            <h3 className={cn(
              'text-lg font-bold mb-4',
              theme === 'cyberpunk' ? 'font-rajdhani text-cyan-200' : 'font-poppins text-slate-900'
            )}>
              输入金额
            </h3>

            <ThemedInput
              type="number"
              placeholder="100.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              label="USD"
              helperText="最小充值金额: $10"
            />

            {/* Calculation Summary */}
            {amount && parseFloat(amount) > 0 && (
              <div className={cn(
                'mt-4 p-4 rounded-lg space-y-2',
                theme === 'cyberpunk'
                  ? 'bg-slate-900/60 border border-cyan-400/20'
                  : 'bg-slate-50 border border-slate-200'
              )}>
                <div className="flex justify-between text-sm">
                  <span className="opacity-70">充值金额</span>
                  <span className="font-medium">${amount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-70">手续费</span>
                  <span className={cn(
                    'font-medium',
                    theme === 'cyberpunk' ? 'text-pink-300' : 'text-orange-600'
                  )}>
                    -${calculateFee(amount)}
                  </span>
                </div>
                <div className={cn(
                  'pt-2 border-t flex justify-between',
                  theme === 'cyberpunk' ? 'border-cyan-400/20' : 'border-slate-200'
                )}>
                  <span className="font-semibold">预计到账</span>
                  <span className={cn(
                    'text-lg font-bold',
                    theme === 'cyberpunk' ? 'text-green-400' : 'text-green-600'
                  )}>
                    {calculateReceived(amount)} POI
                  </span>
                </div>
              </div>
            )}
          </ThemedCard>

          {/* Security Note */}
          <ThemedCard className={cn(
            'p-4 mb-6',
            theme === 'cyberpunk'
              ? 'bg-cyan-400/10 border border-cyan-400/30'
              : 'bg-blue-50 border border-blue-200'
          )}>
            <div className="flex items-start gap-3">
              <Shield className={cn(
                'w-5 h-5 mt-0.5 flex-shrink-0',
                theme === 'cyberpunk' ? 'text-cyan-400' : 'text-blue-600'
              )} />
              <div className="text-sm">
                <div className="font-semibold mb-1">安全保障</div>
                <p className="opacity-80 text-xs">
                  我们使用行业领先的加密技术保护您的交易。所有支付信息均经过 SSL 加密传输。
                </p>
              </div>
            </div>
          </ThemedCard>

          {/* Submit Button */}
          <ThemedButton
            emphasis
            size="lg"
            className="w-full"
            onClick={handleSubmit}
            disabled={loading || !amount || parseFloat(amount) <= 0}
          >
            {loading ? "处理中..." : "确认充值"}
            {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
          </ThemedButton>

          {/* Additional Info */}
          <div className={cn(
            'mt-6 text-center text-xs opacity-70',
            theme === 'cyberpunk' ? 'font-rajdhani' : 'font-poppins'
          )}>
            <Info className="w-4 h-4 inline-block mr-1" />
            充值通常在 5-10 分钟内到账。如有问题请联系客服。
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section title="常见问题" subtitle="关于充值的常见问题">
        <div className="grid gap-4 md:grid-cols-2 max-w-4xl mx-auto">
          <ThemedCard className="p-5">
            <h4 className="font-bold mb-2">最小充值金额是多少？</h4>
            <p className="text-sm opacity-80">
              最小充值金额为 $10。建议首次充值不少于 $50 以获得更好的体验。
            </p>
          </ThemedCard>

          <ThemedCard className="p-5">
            <h4 className="font-bold mb-2">充值需要多长时间？</h4>
            <p className="text-sm opacity-80">
              链上支付通常在 5-10 分钟内到账。信用卡和第三方支付通常即时到账。
            </p>
          </ThemedCard>

          <ThemedCard className="p-5">
            <h4 className="font-bold mb-2">支持哪些支付方式？</h4>
            <p className="text-sm opacity-80">
              我们支持加密钱包、信用卡（Visa/Mastercard/Amex）以及支付宝/微信支付。
            </p>
          </ThemedCard>

          <ThemedCard className="p-5">
            <h4 className="font-bold mb-2">手续费如何计算？</h4>
            <p className="text-sm opacity-80">
              链上支付 0.5%，信用卡 2.9%，第三方支付 1.5%。所有费用在充值前明确显示。
            </p>
          </ThemedCard>
        </div>
      </Section>
    </PageLayout>
  );
}
