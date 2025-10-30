import { useState } from "react";
import WalletConnectButton from "../WalletConnectButton";

export default function WalletConnectButtonExample() {
  const [walletAddress, setWalletAddress] = useState<string>();

  const handleConnect = () => {
    setWalletAddress("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb");
    console.log("Wallet connected");
  };

  const handleDisconnect = () => {
    setWalletAddress(undefined);
    console.log("Wallet disconnected");
  };

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <WalletConnectButton
        walletAddress={walletAddress}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />
    </div>
  );
}
