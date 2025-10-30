import { useState } from "react";
import ProfileEditor, { type ProfileData } from "../ProfileEditor";
import sampleAvatar from "@assets/generated_images/Sample_profile_avatar_7ce2fd78.png";

export default function ProfileEditorExample() {
  const [profile, setProfile] = useState<ProfileData>({
    name: "John Doe",
    bio: "Web3 enthusiast | Developer | Creator",
    avatarUrl: sampleAvatar,
  });

  const handleUpdate = (updates: Partial<ProfileData>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
    console.log("Profile updated:", updates);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <ProfileEditor profile={profile} onUpdate={handleUpdate} />
    </div>
  );
}
