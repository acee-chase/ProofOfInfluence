import LinkButton from "../LinkButton";
import { Github, Twitter, Youtube } from "lucide-react";

export default function LinkButtonExample() {
  return (
    <div className="flex flex-col gap-3 p-8 max-w-md mx-auto">
      <LinkButton
        title="My Website"
        url="https://example.com"
        clicks={1234}
        onClick={() => console.log("Website clicked")}
      />
      <LinkButton
        title="GitHub Profile"
        url="https://github.com"
        clicks={856}
        icon={<Github className="h-5 w-5" />}
        onClick={() => console.log("GitHub clicked")}
      />
      <LinkButton
        title="Twitter"
        url="https://twitter.com"
        clicks={492}
        icon={<Twitter className="h-5 w-5" />}
        onClick={() => console.log("Twitter clicked")}
      />
      <LinkButton
        title="YouTube Channel"
        url="https://youtube.com"
        icon={<Youtube className="h-5 w-5" />}
        onClick={() => console.log("YouTube clicked")}
      />
    </div>
  );
}
