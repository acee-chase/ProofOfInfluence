import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia, mainnet, arbitrum, polygon } from 'wagmi/chains';

// WalletConnect Project ID - 需要在 Replit Secrets 中配置 VITE_WALLETCONNECT_PROJECT_ID
// 获取地址: https://cloud.walletconnect.com/
export const config = getDefaultConfig({
  appName: 'ProofOfInfluence',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
  chains: [base, baseSepolia, mainnet, arbitrum, polygon],
  ssr: false,
});

