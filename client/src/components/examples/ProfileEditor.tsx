import { useState } from "react";
import ProfileEditor, { type ProfileData } from "../ProfileEditor";
import sampleAvatar from "@assets/generated_images/Sample_profile_avatar_7ce2fd78.png";

export default function ProfileEditorExample() {
  const [profile, setProfile] = useState<ProfileData>({
    name: "John Doe",
    bio: "Web3 enthusiast | Developer | Creator",
    avatarUrl: sampleAvatar,
    googleUrl: null,
    twitterUrl: null,
    weiboUrl: null,
    tiktokUrl: null,
    isPublic: true,
  });
  const [username, setUsername] = useState("johndoe");
  const [isDirty, setIsDirty] = useState(false);

  const handleUpdate = (updates: Partial<ProfileData> & { username?: string }) => {
    const { username: nextUsername, ...profileUpdates } = updates;
    if (Object.keys(profileUpdates).length > 0) {
      setProfile((prev) => ({ ...prev, ...profileUpdates }));
      setIsDirty(true);
    }

    if (nextUsername !== undefined) {
      setUsername(nextUsername);
      setIsDirty(true);
    }

    console.log("Profile updated:", updates);
  };

  const handleSave = () => {
    console.log("Profile saved", { profile, username });
    setIsDirty(false);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <ProfileEditor
        profile={profile}
        username={username}
        onChange={handleUpdate}
        onSave={handleSave}
        canSave={isDirty}
        isSaving={false}
      />
    </div>
  );
}
