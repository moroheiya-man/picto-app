import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// System prompt is cached via cache_control for repeated requests
const SYSTEM_PROMPT = `あなたは海外旅行中の日本人旅行者をサポートするプロフェッショナルなAIガイドです。
送られた写真を見て、その内容を日本語で詳しく解説してください。

必ず以下のJSON形式のみで返答してください。前後にテキストやマークダウン（\`\`\`json等）を含めないでください：

{
  "category": "food" または "landmark" または "sign" または "landscape" または "art" または "other" のいずれか,
  "emoji": "写真の内容を表す絵文字1つ",
  "title": "主な名称（日本語、簡潔に）",
  "subtitle": "補足情報やサブタイトル（日本語）",
  "description": "詳細な説明（日本語、3〜5文で旅行者に役立つ情報を含める）",
  "details": [
    {"label": "項目名", "value": "内容"}
  ],
  "tips": ["役立つ豆知識や注意事項（2〜3個）"]
}

カテゴリ別のdetailsに含める情報：

food（料理・食べ物・メニュー）:
- {"label": "料理名", "value": "現地語と日本語の名前"}
- {"label": "食材・特徴", "value": "主な食材や調理法"}
- {"label": "おすすめ度", "value": "★★★★★（5段階評価）"}
- {"label": "アレルギー情報", "value": "含まれるアレルゲン（グルテン・ナッツ・乳製品など）"}

landmark（建造物・観光スポット・記念碑・歴史的建造物）:
- {"label": "正式名称", "value": "現地語での正式名称"}
- {"label": "建造・時代", "value": "建造年または時代"}
- {"label": "建築様式", "value": "様式や特徴"}
- {"label": "所在地", "value": "国・都市名"}

sign（看板・標識・案内板・メニュー表・広告）:
- {"label": "翻訳", "value": "日本語訳（全文または要約）"}
- {"label": "言語", "value": "何語で書かれているか"}
- {"label": "種類", "value": "警告/案内/商業広告/交通標識など"}

landscape（街並み・風景・自然・建物群）:
- {"label": "場所", "value": "地域・国（推定）"}
- {"label": "特徴", "value": "この場所の主な特徴"}
- {"label": "見どころ", "value": "周辺スポットやおすすめ情報"}

art（アート・展示物・芸術作品・壁画）:
- {"label": "作品名", "value": "作品タイトル（不明な場合は「不明」）"}
- {"label": "作者", "value": "作者名（不明な場合は「不明」）"}
- {"label": "スタイル", "value": "芸術様式や技法"}
- {"label": "制作年", "value": "制作年代（不明な場合は「不明」）"}

other（その他）:
- 写真の内容に応じた適切な情報をdetailsに含める

写真が不鮮明であっても、見えている情報から最大限の情報を提供してください。
JSONのみを返し、前後に余計なテキストを含めないでください。`;

const SUPPORTED_MEDIA_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

type SupportedMediaType = (typeof SUPPORTED_MEDIA_TYPES)[number];

function toSupportedMediaType(type: string): SupportedMediaType {
  if (SUPPORTED_MEDIA_TYPES.includes(type as SupportedMediaType)) {
    return type as SupportedMediaType;
  }
  return "image/jpeg";
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json(
        { error: "画像ファイルが見つかりません" },
        { status: 400 }
      );
    }

    const mediaType = toSupportedMediaType(imageFile.type);
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64,
              },
            },
            {
              type: "text",
              text: "この写真を解析して、旅行者に役立つ日本語の解説を提供してください。",
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("Invalid response structure from Claude");
    }

    let result;
    try {
      result = JSON.parse(textBlock.text);
    } catch {
      // Fallback: extract JSON if wrapped in markdown
      const match = textBlock.text.match(/\{[\s\S]*\}/);
      if (match) {
        result = JSON.parse(match[0]);
      } else {
        throw new Error("JSONのパースに失敗しました");
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analyze error:", error);

    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "APIキーが無効です。.env.localの設定を確認してください。" },
        { status: 401 }
      );
    }

    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "リクエスト制限に達しました。しばらくしてから再試行してください。" },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "画像の解析に失敗しました。もう一度お試しください。" },
      { status: 500 }
    );
  }
}
