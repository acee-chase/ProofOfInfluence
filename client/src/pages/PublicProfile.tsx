import ProfileAvatar from "@/components/ProfileAvatar";
import LinkButton from "@/components/LinkButton";
import ThemeToggle from "@/components/ThemeToggle";
import { Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export interface Link {
  id: string;
  title: string;
  url: string;
  clicks: number;
  visible: boolean;
}

export interface Profile {
  name: string;
  bio: string;
  avatarUrl?: string;
  walletAddress?: string;
  links: Link[];
  totalViews: number;
}

interface PublicProfileProps {
  profile: Profile;
  username: string;
}

export default function PublicProfile({ profile, username }: PublicProfileProps) {
  const { toast } = useToast();

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = () => {
    if (profile.walletAddress) {
      navigator.clipboard.writeText(profile.walletAddress);
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const visibleLinks = profile.links.filter((link) => link.visible);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="max-w-md mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col items-center text-center space-y-3 mb-8">
          <ProfileAvatar
            src={profile.avatarUrl}
            alt={profile.name}
            fallback={profile.name.slice(0, 2).toUpperCase()}
            size="large"
          />

          <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-profile-name">
            {profile.name}
          </h1>

          {profile.bio && (
            <p className="text-base text-muted-foreground max-w-xs" data-testid="text-profile-bio">
              {profile.bio}
            </p>
          )}

          {profile.walletAddress && (
            <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-xl">
              <span className="text-sm font-mono" data-testid="text-wallet-address">
                {truncateAddress(profile.walletAddress)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={copyAddress}
                data-testid="button-copy-wallet"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                asChild
                data-testid="link-etherscan-wallet"
              >
                <a
                  href={`https://etherscan.io/address/${profile.walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground" data-testid="text-profile-views">
            {profile.totalViews.toLocaleString()} profile views
          </p>
        </div>

        <div className="space-y-3">
          {visibleLinks.map((link) => (
            <LinkButton
              key={link.id}
              title={link.title}
              url={link.url}
              clicks={link.clicks}
            />
          ))}
        </div>

        {visibleLinks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No links added yet</p>
          </div>
        )}

        <footer className="mt-12 text-center">
          <p className="text-xs text-muted-foreground">
            Powered by LinkTree Web3
          </p>
        </footer>
      </div>
    </div>
  );
}
