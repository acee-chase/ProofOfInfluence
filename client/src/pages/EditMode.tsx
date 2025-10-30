import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Save, Eye } from "lucide-react";
import WalletConnectButton from "@/components/WalletConnectButton";
import ThemeToggle from "@/components/ThemeToggle";
import ProfileEditor, { type ProfileData } from "@/components/ProfileEditor";
import LinkEditor, { type LinkEditorData } from "@/components/LinkEditor";
import AddLinkButton from "@/components/AddLinkButton";
import AnalyticsView from "@/components/AnalyticsView";
import PublicProfile, { type Profile } from "./PublicProfile";
import { useToast } from "@/hooks/use-toast";

export default function EditMode() {
  const { toast } = useToast();
  const [walletAddress, setWalletAddress] = useState<string>();
  const [showPreview, setShowPreview] = useState(false);

  const [profile, setProfile] = useState<ProfileData>({
    name: "John Doe",
    bio: "Web3 enthusiast | Developer | Creator",
    avatarUrl: undefined,
  });

  const [links, setLinks] = useState<LinkEditorData[]>([
    { id: "1", title: "My Website", url: "https://example.com", clicks: 1234, visible: true },
    { id: "2", title: "GitHub Profile", url: "https://github.com", clicks: 856, visible: true },
    { id: "3", title: "Twitter", url: "https://twitter.com", clicks: 492, visible: true },
  ]);

  const handleConnect = () => {
    setWalletAddress("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb");
    toast({
      title: "Wallet connected",
      description: "Successfully connected to MetaMask",
    });
  };

  const handleDisconnect = () => {
    setWalletAddress(undefined);
    toast({
      title: "Wallet disconnected",
    });
  };

  const handleUpdateProfile = (updates: Partial<ProfileData>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const handleUpdateLink = (id: string, updates: Partial<LinkEditorData>) => {
    setLinks((prev) => prev.map((link) => (link.id === id ? { ...link, ...updates } : link)));
  };

  const handleDeleteLink = (id: string) => {
    setLinks((prev) => prev.filter((link) => link.id !== id));
    toast({
      title: "Link deleted",
    });
  };

  const handleAddLink = () => {
    const newLink: LinkEditorData = {
      id: Date.now().toString(),
      title: "New Link",
      url: "https://",
      clicks: 0,
      visible: true,
    };
    setLinks((prev) => [...prev, newLink]);
  };

  const handleSave = () => {
    toast({
      title: "Changes saved",
      description: "Your profile has been updated successfully",
    });
  };

  const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);
  const topLinks = [...links].sort((a, b) => b.clicks - a.clicks).slice(0, 5);

  const previewProfile: Profile = {
    ...profile,
    walletAddress,
    links: links,
    totalViews: 8924,
  };

  if (showPreview) {
    return (
      <div className="relative">
        <div className="absolute top-4 left-4 z-10">
          <Button onClick={() => setShowPreview(false)} variant="outline" data-testid="button-close-preview">
            Close Preview
          </Button>
        </div>
        <PublicProfile profile={previewProfile} username="johndoe" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold">LinkTree Web3</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPreview(true)}
              data-testid="button-preview"
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button onClick={handleSave} data-testid="button-save">
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <WalletConnectButton
              walletAddress={walletAddress}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="links" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="links" data-testid="tab-links">
              Links
            </TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">
              Profile
            </TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="links" className="space-y-4">
            <div className="max-w-2xl mx-auto space-y-4">
              {links.map((link) => (
                <LinkEditor
                  key={link.id}
                  link={link}
                  onUpdate={handleUpdateLink}
                  onDelete={handleDeleteLink}
                />
              ))}
              <AddLinkButton onClick={handleAddLink} />
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <div className="max-w-2xl mx-auto">
              <ProfileEditor profile={profile} onUpdate={handleUpdateProfile} />
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="max-w-2xl mx-auto">
              <AnalyticsView
                totalClicks={totalClicks}
                totalViews={8924}
                topLinks={topLinks}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
