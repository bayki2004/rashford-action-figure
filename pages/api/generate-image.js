/*const fs = require("fs");
const { OpenAI } = require("openai");

export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function bufferFile(filePath) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const stream = fs.createReadStream(filePath);
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

export default async function handler(req, res) {
  console.log("📩 HIT /api/generate-image");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const formidable = await import("formidable"); // ✅ use dynamic import to fix Vercel ESM bundling
  const form = formidable.default({ multiples: true }); // ⬅️ MUST use `.default`

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("🛑 Form parse error:", err);
      return res.status(500).json({ error: "Form parse failed" });
    }

    try {
      const firstKey = Object.keys(files)[0];
      const file = Array.isArray(files[firstKey]) ? files[firstKey][0] : files[firstKey];
      const buffer = await bufferFile(file.filepath);
      const base64 = buffer.toString("base64");
      const dataUrl = `data:image/jpeg;base64,${base64}`;

      console.log("🧠 Sending to GPT-4...");
        /*
      const vision = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: "Describe this image as a stylized action figure." },
          {
            role: "user",
            content: [
              { type: "text", text: "Create an 80s-style plastic action figure from this." },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
      });
      
      //const prompt = vision.choices[0].message.content;
      const prompt = "Create an 80s-style plastic action figure from this.";
      console.log("🎨 Prompt from GPT:", prompt);

      const imageGen = await openai.images.generate({
        model: "dall-e-3",
        ,
        n: 1,
        size: "1024x1024",
      });

      const imageUrl = imageGen.data[0].url;

      console.log("✅ Image generated:", imageUrl);
      res.status(200).json({ imageUrl, prompt });
    } catch (e) {
      console.error("🔥 Generation failed:", e);
      res.status(500).json({ error: "Generation failed" });
    }
  });
}
*/
/*
import { OpenAI } from "openai";

export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  console.log("⚡ API hit: /api/generate-image");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Skip image processing, just use a static DALL·E prompt
    const prompt = `
    Create a stylized 80s plastic action figure. The character is an adventurous young hero 
    in a blue polo and khaki shorts, posed heroically inside a collectible blister pack.
    Add 3 accessories to the right: a futuristic water bottle, a pair of binoculars, and a tiny map scroll.
    Use bold colors, plastic sheen, and nostalgic packaging design.
    `;

    console.log("🎯 Sending prompt to DALL·E...");

    const dalleResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
    });

    const imageUrl = dalleResponse.data[0].url;
    console.log("✅ DALL·E image URL:", imageUrl);

    res.status(200).json({ imageUrl, prompt });
  } catch (e) {
    console.error("❌ DALL·E generation error:", e);
    res.status(500).json({ error: "Image generation failed" });
  }
}
*/
const fs = require("fs");
const { OpenAI } = require("openai");

export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function bufferFile(filePath) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const stream = fs.createReadStream(filePath);
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

export default async function handler(req, res) {
  console.log("⚡ HIT /api/generate-image");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const formidable = await import("formidable");
  const form = formidable.default({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("🛑 Form parsing failed:", err);
      return res.status(500).json({ error: "Form parsing failed" });
    }

    try {
      const firstKey = Object.keys(files)[0];
      const file = Array.isArray(files[firstKey]) ? files[firstKey][0] : files[firstKey];
      const buffer = await bufferFile(file.filepath);
      const imageDataUrl = `data:image/jpeg;base64,${buffer.toString("base64")}`;

      console.log("📤 Sending image to GPT-4...");

      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "You are a creative assistant helping to design toy packaging based on uploaded photos.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Create an 80s-style plastic action figure from this image." },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ],
          },
        ],
      });

      const prompt = response.choices[0].message.content;
      console.log("🧠 Prompt from GPT:", prompt);

      res.status(200).json({ prompt });
    } catch (e) {
      console.error("🔥 Error during GPT-4 generation:", e);
      res.status(500).json({ error: "Prompt generation failed" });
    }
  });
}
