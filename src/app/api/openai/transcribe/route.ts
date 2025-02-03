import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI();

export async function POST(req: Request) {
  const body = await req.json();
  const base64Audio = body.audio;
  const audioBuffer = Buffer.from(base64Audio, "base64");

  try {
    const data = await openai.audio.transcriptions.create({
      file: {
        name: "input.wav",
        data: audioBuffer,
      },
      model: "whisper-1",
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error processing audio:", error);
    return NextResponse.error();
  }
}
