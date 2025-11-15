import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { UserMemory, UserPersonalityProfile } from "@shared/schema";

export interface SuggestedAction {
  type: string;
  title: string;
  description?: string;
}

interface GenerateReplyParams {
  message: string;
  profile?: UserPersonalityProfile | null;
  memories: UserMemory[];
  apiKey: string;
  modelName?: string;
}

const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const ACTION_KEYWORDS: Array<{
  keywords: string[];
  action: SuggestedAction;
}> = [
  {
    keywords: ["徽章", "badge", "纪念"],
    action: {
      type: "MINT_TEST_BADGE",
      title: "铸造 Test Immortality Badge",
      description: "通过 AgentKit 在 Base Sepolia 铸造一枚测试徽章以纪念这段经历。",
    },
  },
  {
    keywords: ["充值", "credits", "买币", "购买", "充值 credits"],
    action: {
      type: "RECHARGE_CREDITS",
      title: "前往 Recharge 页面",
      description: "使用 Stripe 购买 Immortality Credits，支持法币入场。",
    },
  },
  {
    keywords: ["市场", "交易", "买 poi", "sell"],
    action: {
      type: "OPEN_MARKET",
      title: "访问 Market 模块",
      description: "在内置市场查看 POI 流动性池并执行交易。",
    },
  },
];

function decideSuggestedActions(message: string): SuggestedAction[] {
  const normalized = message.toLowerCase();
  const actions: SuggestedAction[] = [];
  for (const entry of ACTION_KEYWORDS) {
    if (entry.keywords.some((kw) => normalized.includes(kw.toLowerCase()))) {
      actions.push(entry.action);
    }
  }
  return actions;
}

export async function generateImmortalityReply({
  message,
  profile,
  memories,
  apiKey,
  modelName = DEFAULT_MODEL,
}: GenerateReplyParams): Promise<{ reply: string; suggestedActions: SuggestedAction[] }> {
  const profileSnippet = profile
    ? `User MBTI: ${profile.mbtiType ?? "unknown"}\nValues: ${JSON.stringify(profile.values ?? {})}`
    : "User MBTI: unknown\nValues: {}";

  const memorySnippet =
    memories.length > 0
      ? memories
          .map(
            (memo) =>
              `- [${new Date(memo.createdAt).toISOString()}] (${memo.emotion ?? "neutral"}) ${memo.text}`,
          )
          .join("\n")
      : "No memories logged yet.";

  const systemPrompt = `You are the Cyber Immortality concierge. Always respond with empathy, concise insights, and concrete suggestions.\n${profileSnippet}\nRecent memories:\n${memorySnippet}\nWhen referencing memories, mention how they relate to the user's message.`;

  const chat = new ChatOpenAI({
    modelName,
    temperature: 0.4,
    openAIApiKey: apiKey,
  });

  const response = await chat.invoke([new SystemMessage(systemPrompt), new HumanMessage(message)]);

  let replyText: string;
  if (typeof response.content === "string") {
    replyText = response.content;
  } else if (Array.isArray(response.content)) {
    replyText = response.content
      .map((chunk: any) => {
        if (typeof chunk === "string") {
          return chunk;
        }
        if (chunk?.type === "text" && typeof chunk.text === "string") {
          return chunk.text;
        }
        return "";
      })
      .join("\n")
      .trim();
  } else {
    replyText = "暂时无法回复，请稍后再试。";
  }

  const suggestedActions = decideSuggestedActions(message + " " + replyText);

  return { reply: replyText, suggestedActions };
}

