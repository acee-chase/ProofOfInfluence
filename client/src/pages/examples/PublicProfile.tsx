import PublicProfile, { type Profile } from "../PublicProfile";
import sampleAvatar from "@assets/generated_images/Sample_profile_avatar_7ce2fd78.png";

export default function PublicProfileExample() {
  const mockProfile: Profile = {
    name: "John Doe",
    bio: "Web3 enthusiast | Developer | Creator",
    avatarUrl: sampleAvatar,
    walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    totalViews: 8924,
    links: [
      { id: "1", title: "My Website", url: "https://example.com", clicks: 1234, visible: true },
      { id: "2", title: "GitHub Profile", url: "https://github.com", clicks: 856, visible: true },
      { id: "3", title: "Twitter", url: "https://twitter.com", clicks: 492, visible: true },
      { id: "4", title: "YouTube Channel", url: "https://youtube.com", clicks: 387, visible: true },
      { id: "5", title: "LinkedIn", url: "https://linkedin.com", clicks: 213, visible: false },
    ],
  };

  return <PublicProfile profile={mockProfile} username="johndoe" />;
}
