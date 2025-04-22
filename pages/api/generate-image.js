const fs = require("fs");
const formidable = require("formidable");
const { OpenAI } = require("openai");

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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({
    maxFileSize: 20 * 1024 * 1024,
    multiples: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form error:", err);
      return res.status(500).json({ error: "Form parsing error" });
    }

    try {
      const file = Object.values(files)[0][0];
      const imageBuffer = await fsReadStreamToBuffer(file.filepath);
      const imageBase64 = imageBuffer.toString("base64");
      const imageDataUrl = `data:image/jpeg;base64,${imageBase64}`;

      console.log("Sending to GPT-4 Vision...");
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

      const refinedPrompt = visionResponse.choices[0].message.content?.slice(0, 1000) || "Stylized action figure of this person.";

      console.log("Prompt:", refinedPrompt);

      const dalleResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: refinedPrompt,
        n: 1,
        size: "1024x1024",
      });

      const imageUrl = dalleResponse.data[0].url;

      res.status(200).json({ imageUrl, prompt: refinedPrompt });
    } catch (e) {
      console.error("Error during generation:", e);
      res.status(500).json({ error: "Image generation failed" });
    }
  });
}
