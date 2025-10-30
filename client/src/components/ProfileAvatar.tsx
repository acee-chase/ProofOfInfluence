import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileAvatarProps {
  src?: string;
  alt: string;
  fallback: string;
  size?: "default" | "large";
}

export default function ProfileAvatar({ src, alt, fallback, size = "default" }: ProfileAvatarProps) {
  const sizeClasses = size === "large" ? "w-28 h-28 md:w-32 md:h-32" : "w-24 h-24";

  return (
    <Avatar className={`${sizeClasses} border-2 border-border`} data-testid="avatar-profile">
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback className="text-2xl font-semibold">{fallback}</AvatarFallback>
    </Avatar>
  );
}
