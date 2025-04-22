const { OpenAI } = require("openai");

export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  console.log("📩 HIT /api/generate-image");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", async () => {
      const buffer = Buffer.concat(chunks);

      const imageBase64 = buffer.toString("base64");
      const imageDataUrl = `data:image/jpeg;base64,${imageBase64}`;

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
              { type: "text", text: "Create a stylized action figure of this person." },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ],
          },
        ],
      });

      const prompt = visionResponse.choices[0].message.content;

      const dalleResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
      });

      const imageUrl = dalleResponse.data[0].url;
      return res.status(200).json({ imageUrl, prompt });
    });
  } catch (e) {
    console.error("🔥 ERROR:", e);
    return res.status(500).json({ error: "Failed to generate image." });
  }
}
