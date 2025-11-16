import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ThemedCard, ThemedButton } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageSquare } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatResponse {
  reply: string;
  profileUsed: boolean;
  memoryCount: number;
  suggestedActions?: Array<{
    type: string;
    title: string;
    description?: string;
  }>;
}

export function ImmortalityChat() {
  const { theme } = useTheme();
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const chatMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });
      if (!response.ok) {
        throw new Error("Failed to get reply");
      }
      return (await response.json()) as ChatResponse;
    },
    onSuccess: (data, variables) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: variables,
          timestamp: new Date().toISOString(),
        },
        {
          role: "assistant",
          content:
            data.reply +
            (data.suggestedActions?.length
              ? `\n\n可能的下一步：${data.suggestedActions
                  .map((action) => `${action.title}`)
                  .join(" / ")}` 
              : ""),
          timestamp: new Date().toISOString(),
        },
      ]);
      toast({
        title: "分身回复完成",
        description: data.profileUsed
          ? `已参考人格档案与 ${data.memoryCount} 条记忆`
          : "尚未录入人格或记忆，回复为通用建议",
      });
    },
    onError: () => {
      toast({
        title: "回复失败",
        description: "暂时无法连接分身，请稍后再试",
        variant: "destructive",
      });
    },
  });

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || chatMutation.status === "pending") return;
    setInput("");
    chatMutation.mutate(trimmed);
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: trimmed,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <ThemedCard className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        <span className="font-semibold">赛博分身对话</span>
      </div>
      <div
        className={cn(
          "rounded-2xl border p-4 space-y-4 max-h-[320px] overflow-y-auto",
          theme === "cyberpunk" ? "border-cyan-400/30 bg-cyan-400/5" : "border-slate-200 bg-white",
        )}
      >
        {messages.length === 0 && (
          <p className="text-sm opacity-70">
            告诉你的分身最近的感受，它会结合人格档案与记忆给出建议。
          </p>
        )}
        {messages.map((msg, idx) => (
          <div key={`${msg.timestamp}-${idx}`} className={cn("text-sm", msg.role === "assistant" && "italic")}>
            <div className="text-xs opacity-60">
              {msg.role === "user" ? "你" : "Cyber Immortality"}
            </div>
            <p>{msg.content}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-3 flex-wrap">
        <textarea
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={cn(
            "flex-1 min-w-[240px] rounded-xl border bg-transparent p-3 text-sm outline-none focus:ring-2",
            theme === "cyberpunk" ? "border-cyan-500/40 focus:ring-cyan-400/40" : "border-slate-200 focus:ring-blue-200",
          )}
          placeholder="输入想对分身说的话..."
        />
        <ThemedButton emphasis disabled={!input.trim() || chatMutation.status === "pending"} onClick={handleSend}>
          {chatMutation.status === "pending" ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              等待回复...
            </>
          ) : (
            "发送"
          )}
        </ThemedButton>
      </div>
    </ThemedCard>
  );
}

