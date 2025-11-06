import { useEffect } from "react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface WalletConnectButtonProps {
  standalone?: boolean;
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}

export default function WalletConnectButton({ 
  standalone = false,
  onConnect,
  onDisconnect 
}: WalletConnectButtonProps = {}) {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();

  // Mutation for connecting wallet to backend (Web2 integration)
  const connectWalletMutation = useMutation({
    mutationFn: async (data: { walletAddress: string }) => {
      // For Web2 integration mode, call backend API
      const res = await apiRequest("POST", "/api/wallet/connect", {
        walletAddress: data.walletAddress,
        signature: "rainbow-kit-auto-signed" // RainbowKit handles signature internally
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "钱包已连接",
        description: "您的钱包已成功连接到账户",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "连接失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const disconnectWalletMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/wallet/disconnect", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "钱包已断开",
      });
    },
  });

  // Handle connection changes
  useEffect(() => {
    if (isConnected && address) {
      if (standalone) {
        // Standalone mode: just notify parent component
        localStorage.setItem("wallet_address", address);
        onConnect?.(address);
      } else {
        // Web2 integration mode: connect to backend
        const savedAddress = localStorage.getItem("last_connected_wallet");
        if (savedAddress !== address) {
          connectWalletMutation.mutate({ walletAddress: address });
          localStorage.setItem("last_connected_wallet", address);
        }
      }
    } else if (!isConnected) {
      if (standalone) {
        localStorage.removeItem("wallet_address");
        onDisconnect?.();
      } else {
        const savedAddress = localStorage.getItem("last_connected_wallet");
        if (savedAddress) {
          disconnectWalletMutation.mutate();
          localStorage.removeItem("last_connected_wallet");
        }
      }
    }
  }, [isConnected, address, standalone]);

  // Use RainbowKit's ConnectButton with custom styling
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    data-testid="button-connect-wallet"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2"
                  >
                    Wrong network
                  </button>
                );
              }

              return (
                <div className="flex gap-2">
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-3"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 16,
                          height: 16,
                          borderRadius: 999,
                          overflow: 'hidden',
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 16, height: 16 }}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </button>

                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-3 font-mono"
                    data-testid="button-wallet-menu"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {account.displayName}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
