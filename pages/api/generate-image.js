// app/api/generate-image/route.js
import { NextResponse } from 'next/server';
import fs from 'fs';
import formidable from 'formidable';
import { OpenAI } from 'openai';

export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function fsReadStreamToBuffer(path) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const stream = fs.createReadStream(path);
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", (err) => reject(err));
  });
}

export async function POST(req) {
  console.log("📩 API hit: /api/generate-image");
  
  // Parse form data
  const formData = await req.formData();
  const file = formData.get('image_0');
  
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  
  try {
    // Convert file to buffer and base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const imageBase64 = buffer.toString("base64");
    const imageDataUrl = `data:image/jpeg;base64,${imageBase64}`;
    
    console.log("🚀 Sending image to GPT-4 Vision...");
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "You are a creative assistant helping to design toy packaging based on uploaded photos.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Create a stylized plastic action figure of the person shown in the photo." },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ],
        },
      ],
    });
    
    const refinedPrompt = visionResponse.choices[0].message.content?.slice(0, 1000) || 
      "Stylized action figure of the person shown.";
    console.log("🎯 GPT-4 returned prompt:", refinedPrompt);
    
    const dalleResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: refinedPrompt,
      n: 1,
      size: "1024x1024",
    });
    
    const imageUrl = dalleResponse.data[0].url;
    console.log("✅ DALL·E generated image:", imageUrl);
    
    return NextResponse.json({ imageUrl, prompt: refinedPrompt });
  } catch (e) {
    console.error("🔥 Error during generation:", e);
    return NextResponse.json({ error: "Image generation failed" }, { status: 500 });
  }
}