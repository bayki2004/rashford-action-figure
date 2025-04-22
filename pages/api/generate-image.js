//This is a working version
/*
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
        prompt,
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

//This is a working version
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
        prompt,
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
