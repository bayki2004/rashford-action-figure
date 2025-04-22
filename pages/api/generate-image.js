import { OpenAI } from "openai";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = new formidable.IncomingForm({ maxFileSize: 20 * 1024 * 1024 }); // 20MB

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form error:", err);
      return res.status(500).json({ error: "Form parsing error" });
    }

    try {
      const file = Object.values(files)[0][0];
      const fileData = await fsReadStreamToBuffer(file.filepath);

      const imageBase64 = fileData.toString("base64");
      const imageDataUrl = `data:image/jpeg;base64,${imageBase64}`;

      console.log("Calling GPT-4 Vision...");
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
              { type: "text", text: "Create a stylized action figure based on this person." },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ],
          },
        ],
      });

      const refinedPrompt = visionResponse.choices[0].message.content.slice(0, 1000);

      console.log("Calling DALL·E with prompt:", refinedPrompt);

      const dalleResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: refinedPrompt,
        n: 1,
        size: "1024x1024",
      });

      const imageUrl = dalleResponse.data[0].url;
      res.status(200).json({ imageUrl, prompt: refinedPrompt });
    } catch (e) {
      console.error("Error in GPT-4 Vision + DALL·E flow:", e);
      res.status(500).json({ error: "Generation failed" });
    }
  });
}

// Helper: convert stream to buffer
import fs from "fs";
function fsReadStreamToBuffer(path) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const stream = fs.createReadStream(path);
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", (err) => reject(err));
  });
}
