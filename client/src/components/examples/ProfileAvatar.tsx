import ProfileAvatar from "../ProfileAvatar";
import sampleAvatar from "@assets/generated_images/Sample_profile_avatar_7ce2fd78.png";

export default function ProfileAvatarExample() {
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <ProfileAvatar src={sampleAvatar} alt="John Doe" fallback="JD" size="large" />
      <ProfileAvatar src={sampleAvatar} alt="Jane Smith" fallback="JS" />
    </div>
  );
}
