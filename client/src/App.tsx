import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WagmiProvider } from 'wagmi';
import { config } from './lib/wagmi';
import { ThemeProvider } from './contexts/ThemeContext';
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import PublicProfile from "@/pages/PublicProfile";
import PaymentSuccess from "@/pages/PaymentSuccess";
import Recharge from "@/pages/Recharge";
import Profile from "@/pages/Profile";
import UseCases from "@/pages/UseCases";
import Market from "@/pages/Market";
import TGE from "@/pages/TGE";
import EarlyBird from "@/pages/EarlyBird";
import Referral from "@/pages/Referral";
import Airdrop from "@/pages/Airdrop";
import Solutions from "@/pages/Solutions";
import Token from "@/pages/Token";
import Immortality from "@/pages/Immortality";
import About from "@/pages/About";
import NotFound from "@/pages/not-found";

function Router() {
  // Note: We don't block page rendering while checking auth status
  // All public pages (Landing, Products, etc.) are immediately accessible
  // Auth state is only used by components that need it (Header, Dashboard, etc.)
  
  return (
    <Switch>
      {/* Home */}
      <Route path="/" component={Landing} />
      
      {/* Auth */}
      <Route path="/login" component={Login} />
      
      {/* TGE & Campaign Routes */}
      <Route path="/tge" component={TGE} />
      <Route path="/early-bird" component={EarlyBird} />
      <Route path="/referral" component={Referral} />
      <Route path="/airdrop" component={Airdrop} />
      
      {/* New Consolidated Routes */}
      <Route path="/solutions" component={Solutions} />
      <Route path="/token" component={Token} />
      <Route path="/about" component={About} />
      <Route path="/use-cases" component={UseCases} />
      
      {/* Redirects - Old Routes to New Consolidated Pages */}
      <Route path="/products">{() => { window.location.href = "/solutions"; return null; }}</Route>
      <Route path="/for-creators">{() => { window.location.href = "/solutions"; return null; }}</Route>
      <Route path="/for-brands">{() => { window.location.href = "/solutions"; return null; }}</Route>
      <Route path="/token-docs">{() => { window.location.href = "/token"; return null; }}</Route>
      <Route path="/whitepaper">{() => { window.location.href = "/token"; return null; }}</Route>
      <Route path="/tokenomics">{() => { window.location.href = "/token"; return null; }}</Route>
      <Route path="/services">{() => { window.location.href = "/token"; return null; }}</Route>
      <Route path="/roadmap">{() => { window.location.href = "/token"; return null; }}</Route>
      <Route path="/company">{() => { window.location.href = "/about"; return null; }}</Route>
      <Route path="/compliance">{() => { window.location.href = "/about"; return null; }}</Route>
      <Route path="/changelog">{() => { window.location.href = "/about"; return null; }}</Route>
      
      {/* App & Dashboard - New Structure */}
      <Route path="/app" component={Dashboard} />
      <Route path="/app/settings" component={Profile} />
      <Route path="/app/recharge" component={Recharge} />
      <Route path="/app/market" component={Market} />
      <Route path="/app/immortality" component={Immortality} />
      <Route path="/immortality" component={Immortality} />
      <Route path="/payment-success" component={PaymentSuccess} />
      
      {/* Legacy App Routes (redirect for backwards compatibility) */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/recharge" component={Recharge} />
      <Route path="/projectx" component={Immortality} />
      <Route path="/trading" component={Market} />
      
      {/* Dynamic User Profiles */}
      <Route path="/:username" component={PublicProfile} />
      
      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}

export default App;
