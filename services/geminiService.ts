
import { GoogleGenAI, Type } from "@google/genai";
import { SleepTip } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSleepTips = async (): Promise<SleepTip[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Generate 3 gentle and practical sleep tips for parents using a 65 BPM metronome to soothe their baby. Keep the tone warm and supportive.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING },
            },
            required: ["title", "content"],
          },
        },
      },
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Failed to fetch tips:", error);
    return [
      { title: "心跳節奏", content: "65 BPM 模擬了母親休息時的心跳速度，能帶給寶寶安全感。" },
      { title: "燈光環境", content: "保持室內微暗，讓寶寶知道現在是睡眠時間。" },
      { title: "規律習慣", content: "每天在同一時間開啟節拍器，建立睡眠聯覺。" }
    ];
  }
};
