import { useState } from "react";
import LinkEditor, { type LinkEditorData } from "../LinkEditor";

export default function LinkEditorExample() {
  const [link, setLink] = useState<LinkEditorData>({
    id: "1",
    title: "My Website",
    url: "https://example.com",
    visible: true,
    clicks: 1234,
  });

  const handleUpdate = (id: string, updates: Partial<LinkEditorData>) => {
    setLink((prev) => ({ ...prev, ...updates }));
    console.log("Link updated:", updates);
  };

  const handleDelete = (id: string) => {
    console.log("Link deleted:", id);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <LinkEditor link={link} onUpdate={handleUpdate} onDelete={handleDelete} />
    </div>
  );
}
