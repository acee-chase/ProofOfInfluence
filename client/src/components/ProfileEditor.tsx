import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { SiGoogle, SiX, SiSinaweibo, SiTiktok } from "react-icons/si";
import ProfileAvatar from "./ProfileAvatar";
import type { Profile } from "@shared/schema";

interface ProfileEditorProps {
  profile: Profile;
  username?: string | null;
  onUpdate: (updates: Partial<Profile> & { username?: string }) => void;
  isPending?: boolean;
}

export default function ProfileEditor({ profile, username, onUpdate, isPending }: ProfileEditorProps) {
  const [localProfile, setLocalProfile] = useState(profile);
  const [localUsername, setLocalUsername] = useState(username || "");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with prop changes (when data is refreshed from server)
  useEffect(() => {
    setLocalProfile(profile);
  }, [profile]);

  useEffect(() => {
    setLocalUsername(username || "");
  }, [username]);

  // Debounced update function
  const debouncedUpdate = (updates: Partial<Profile> & { username?: string }) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      onUpdate(updates);
    }, 800); // Wait 800ms after user stops typing
  };

  const handleAvatarUpload = () => {
    console.log("Avatar upload clicked");
  };

  const bioLength = localProfile.bio?.length || 0;
  const maxBioLength = 200;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-3">
          <ProfileAvatar
            src={localProfile.avatarUrl || undefined}
            alt={localProfile.name}
            fallback={localProfile.name.slice(0, 2).toUpperCase()}
          />
          <Button variant="outline" size="sm" onClick={handleAvatarUpload} data-testid="button-upload-avatar">
            <Upload className="mr-2 h-4 w-4" />
            Upload Avatar
          </Button>
        </div>

        <div>
          <Label htmlFor="profile-name" className="text-sm font-medium mb-1.5 block">
            Display Name
          </Label>
          <Input
            id="profile-name"
            value={localProfile.name}
            onChange={(e) => {
              const newValue = e.target.value;
              setLocalProfile(prev => ({ ...prev, name: newValue }));
              debouncedUpdate({ name: newValue });
            }}
            placeholder="Your name"
            data-testid="input-profile-name"
            disabled={isPending}
          />
        </div>

        <div>
          <Label className="text-sm font-medium mb-1.5 block">
            Profile URL
          </Label>
          <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-md border text-sm">
            <span className="text-muted-foreground font-mono">
              {typeof window !== 'undefined' ? window.location.origin : ''}/
            </span>
            <span className="font-mono font-medium" data-testid="username-display">
              {username || "loading..."}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            This is your permanent profile URL. Share it to showcase your links.
          </p>
        </div>

        <div>
          <Label htmlFor="profile-bio" className="text-sm font-medium mb-1.5 block">
            Bio
          </Label>
          <Textarea
            id="profile-bio"
            value={localProfile.bio || ""}
            onChange={(e) => {
              const newValue = e.target.value;
              setLocalProfile(prev => ({ ...prev, bio: newValue }));
              debouncedUpdate({ bio: newValue });
            }}
            placeholder="Tell people about yourself"
            maxLength={maxBioLength}
            rows={3}
            data-testid="input-profile-bio"
            disabled={isPending}
          />
          <p className="text-xs text-muted-foreground mt-1" data-testid="text-bio-count">
            {bioLength}/{maxBioLength} characters
          </p>
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold mb-3">Social Media Links</h4>
          <div className="space-y-3">
            <div>
              <Label htmlFor="google-url" className="text-sm font-medium mb-1.5 flex items-center gap-2">
                <SiGoogle className="h-4 w-4" />
                Google Profile
              </Label>
              <Input
                id="google-url"
                value={localProfile.googleUrl || ""}
                onChange={(e) => {
                  const newValue = e.target.value || null;
                  setLocalProfile(prev => ({ ...prev, googleUrl: newValue }));
                  debouncedUpdate({ googleUrl: newValue });
                }}
                placeholder="https://..."
                data-testid="input-google-url"
                disabled={isPending}
              />
            </div>

            <div>
              <Label htmlFor="twitter-url" className="text-sm font-medium mb-1.5 flex items-center gap-2">
                <SiX className="h-4 w-4" />
                X (Twitter)
              </Label>
              <Input
                id="twitter-url"
                value={localProfile.twitterUrl || ""}
                onChange={(e) => {
                  const newValue = e.target.value || null;
                  setLocalProfile(prev => ({ ...prev, twitterUrl: newValue }));
                  debouncedUpdate({ twitterUrl: newValue });
                }}
                placeholder="https://x.com/..."
                data-testid="input-twitter-url"
                disabled={isPending}
              />
            </div>

            <div>
              <Label htmlFor="weibo-url" className="text-sm font-medium mb-1.5 flex items-center gap-2">
                <SiSinaweibo className="h-4 w-4" />
                Weibo
              </Label>
              <Input
                id="weibo-url"
                value={localProfile.weiboUrl || ""}
                onChange={(e) => {
                  const newValue = e.target.value || null;
                  setLocalProfile(prev => ({ ...prev, weiboUrl: newValue }));
                  debouncedUpdate({ weiboUrl: newValue });
                }}
                placeholder="https://weibo.com/..."
                data-testid="input-weibo-url"
                disabled={isPending}
              />
            </div>

            <div>
              <Label htmlFor="tiktok-url" className="text-sm font-medium mb-1.5 flex items-center gap-2">
                <SiTiktok className="h-4 w-4" />
                TikTok
              </Label>
              <Input
                id="tiktok-url"
                value={localProfile.tiktokUrl || ""}
                onChange={(e) => {
                  const newValue = e.target.value || null;
                  setLocalProfile(prev => ({ ...prev, tiktokUrl: newValue }));
                  debouncedUpdate({ tiktokUrl: newValue });
                }}
                placeholder="https://tiktok.com/@..."
                data-testid="input-tiktok-url"
                disabled={isPending}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
