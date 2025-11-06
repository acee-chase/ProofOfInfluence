import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Chrome, Apple, MessageCircle } from "lucide-react";
import { SiXiaohongshu } from "react-icons/si";

export default function Login() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  // Redirect to app if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/app");
    }
  }, [isAuthenticated, setLocation]);

  const handleReplitLogin = () => {
    window.location.href = "/api/login";
  };

  // Placeholder handlers for future OAuth integrations
  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
    console.log("Google login coming soon");
  };

  const handleAppleLogin = () => {
    // TODO: Implement Apple ID OAuth
    console.log("Apple ID login coming soon");
  };

  const handleWeChatLogin = () => {
    // TODO: Implement WeChat OAuth
    console.log("WeChat login coming soon");
  };

  const handleXiaohongshuLogin = () => {
    // TODO: Implement Xiaohongshu OAuth
    console.log("Xiaohongshu login coming soon");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-block">
              <h1 className="text-3xl font-bold text-white">欢迎使用 projectX</h1>
            </div>
            <p className="text-slate-400 text-lg">
              登录以访问您的影响力变现平台
            </p>
          </div>

          {/* Login Options */}
          <div className="space-y-4">
            {/* Current: Replit Auth */}
            <Button
              onClick={handleReplitLogin}
              className="w-full bg-white text-slate-900 hover:bg-slate-100 py-6 text-lg font-semibold"
              size="lg"
            >
              使用 Replit 登录
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-800/50 text-slate-500">
                  更多登录方式即将推出
                </span>
              </div>
            </div>

            {/* Future OAuth Options (disabled for now) */}
            <div className="space-y-3 opacity-50">
              <Button
                onClick={handleGoogleLogin}
                disabled
                variant="outline"
                className="w-full border-slate-700 py-6 text-slate-400"
                size="lg"
              >
                <Chrome className="mr-3 h-5 w-5" />
                使用 Google 登录
              </Button>

              <Button
                onClick={handleAppleLogin}
                disabled
                variant="outline"
                className="w-full border-slate-700 py-6 text-slate-400"
                size="lg"
              >
                <Apple className="mr-3 h-5 w-5" />
                使用 Apple ID 登录
              </Button>

              <Button
                onClick={handleWeChatLogin}
                disabled
                variant="outline"
                className="w-full border-slate-700 py-6 text-slate-400"
                size="lg"
              >
                <MessageCircle className="mr-3 h-5 w-5" />
                使用微信登录
              </Button>

              <Button
                onClick={handleXiaohongshuLogin}
                disabled
                variant="outline"
                className="w-full border-slate-700 py-6 text-slate-400"
                size="lg"
              >
                <SiXiaohongshu className="mr-3 h-5 w-5" />
                使用小红书登录
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-slate-500">
            <p>
              登录即表示您同意我们的{" "}
              <a href="/compliance" className="text-slate-400 hover:text-white transition-colors">
                服务条款
              </a>{" "}
              和{" "}
              <a href="/compliance" className="text-slate-400 hover:text-white transition-colors">
                隐私政策
              </a>
            </p>
          </div>
        </div>
      </Card>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}

