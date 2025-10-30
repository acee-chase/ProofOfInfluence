import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import ProfileAvatar from "./ProfileAvatar";

export interface ProfileData {
  name: string;
  bio: string;
  avatarUrl?: string;
}

interface ProfileEditorProps {
  profile: ProfileData;
  onUpdate: (updates: Partial<ProfileData>) => void;
}

export default function ProfileEditor({ profile, onUpdate }: ProfileEditorProps) {
  const handleAvatarUpload = () => {
    console.log("Avatar upload clicked");
  };

  const bioLength = profile.bio.length;
  const maxBioLength = 160;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-3">
          <ProfileAvatar
            src={profile.avatarUrl}
            alt={profile.name}
            fallback={profile.name.slice(0, 2).toUpperCase()}
          />
          <Button variant="outline" size="sm" onClick={handleAvatarUpload} data-testid="button-upload-avatar">
            <Upload className="mr-2 h-4 w-4" />
            Upload Avatar
          </Button>
        </div>

        <div>
          <Label htmlFor="profile-name" className="text-sm font-medium mb-1.5 block">
            Name
          </Label>
          <Input
            id="profile-name"
            value={profile.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="Your name"
            data-testid="input-profile-name"
          />
        </div>

        <div>
          <Label htmlFor="profile-bio" className="text-sm font-medium mb-1.5 block">
            Bio
          </Label>
          <Textarea
            id="profile-bio"
            value={profile.bio}
            onChange={(e) => onUpdate({ bio: e.target.value })}
            placeholder="Tell people about yourself"
            maxLength={maxBioLength}
            rows={3}
            data-testid="input-profile-bio"
          />
          <p className="text-xs text-muted-foreground mt-1" data-testid="text-bio-count">
            {bioLength}/{maxBioLength} characters
          </p>
        </div>
      </div>
    </Card>
  );
}
