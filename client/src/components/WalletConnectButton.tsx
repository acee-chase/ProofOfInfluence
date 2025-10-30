import { Wallet, Copy, ExternalLink, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface WalletConnectButtonProps {
  walletAddress?: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function WalletConnectButton({
  walletAddress,
  onConnect,
  onDisconnect,
}: WalletConnectButtonProps) {
  const { toast } = useToast();

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  if (!walletAddress) {
    return (
      <Button onClick={onConnect} variant="default" data-testid="button-connect-wallet">
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="font-mono" data-testid="button-wallet-menu">
          <Wallet className="mr-2 h-4 w-4" />
          {truncateAddress(walletAddress)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={copyAddress} data-testid="button-copy-address">
          <Copy className="mr-2 h-4 w-4" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={`https://etherscan.io/address/${walletAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="link-etherscan"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View on Etherscan
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDisconnect} data-testid="button-disconnect-wallet">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
