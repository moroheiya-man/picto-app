import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY;

  if (!key) {
    return NextResponse.json({ status: "error", reason: "API key not set" }, { status: 500 });
  }

  try {
    const client = new Anthropic({ apiKey: key });
    const res = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 10,
      messages: [{ role: "user", content: "hi" }],
    });
    return NextResponse.json({
      status: "ok",
      keyPrefix: key.slice(0, 16) + "...",
      model: res.model,
    });
  } catch (e: unknown) {
    return NextResponse.json({
      status: "error",
      keyPrefix: key.slice(0, 16) + "...",
      error: e instanceof Error ? e.message : String(e),
    }, { status: 500 });
  }
}
