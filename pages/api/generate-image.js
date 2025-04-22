const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const config = {
  api: {
    bodyParser: false,
  },
};

// Ensure the uploads directory exists



export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  
  const form = new formidable.IncomingForm({
    keepExtensions: true,
    maxFileSize: 20 * 1024 * 1024, // 20MB
    fileWriteStreamHandler: () => {
      const { Writable } = require('stream');
      const buffer = [];
      return new Writable({
        write(chunk, encoding, callback) {
          buffer.push(chunk);
          callback();
        },
        final(callback) {
          this.data = Buffer.concat(buffer);
          callback();
        }
      });
    }
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form error:", err);
      res.status(500).json({ error: 'Form parsing error' });
      return;
    }
  
    try {
      const file = Object.values(files)[0][0];
      const imageBuffer = await file.toBuffer(); // <-- important
      const imageBase64 = imageBuffer.toString('base64');
      const imageDataUrl = `data:image/jpeg;base64,${imageBase64}`;
      
      // ...continue with OpenAI Vision call

      console.log("Sending image to GPT-4 Vision...");

      const basePrompt = `
You are a creative assistant helping to generate hyper-specific prompts for DALL·E 3 based on photographs of people.

Analyze the attached image and use it to complete this prompt with visually rich and descriptive language. Fill in the missing details using creativity while staying faithful to the image:

---
Create a stylized plastic action figure of the person shown in the photo, preserving their exact facial features, hairstyle, and clothing. The figure is displayed centrally in a transparent blister pack, like a classic 1980s collectible toy.

The packaging background features a vivid scene of [BACKGROUND] that complements the theme. At the top center of the packaging is a bold, metallic logo in the style of “Masters of the Universe” — capital letters with a 3D perspective, a white-to-blue gradient, and glowing pink-orange outlines. The logo reads: “[TOP TERM]”.

Just below the logo is the character's name in bold yellow: “PIPED”, followed by a white subtitle such as “[DESCRIPTION, TITLE]”.

The action figure has a full-body design including head, torso, arms, and legs. It is dressed in [OUTFIT DETAILS] and posed heroically. To the right of the figure, floating in their own compartments, are three miniature accessories:
- [OBJECT 1]
- [OBJECT 2]
- [OBJECT 3]

The figure and packaging have a clean, hyper-realistic finish with a subtle plastic sheen, evoking a classic 80s toy aesthetic.
---
Make sure your final result is in fluent English and suitable as input to an image generation model like DALL·E 3.`;

      const visionResponse = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "You help generate vivid and creative image generation prompts based on user photos. You keep it concise and relevant.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: basePrompt },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ],
          },
        ],
        max_tokens: 500,
      });

      let refinedPrompt = visionResponse.choices[0].message.content;
      console.log("Raw GPT-4 prompt:", refinedPrompt);

      // Clean prompt for DALL·E
      refinedPrompt = refinedPrompt.replace(/[*_`#>\\-]/g, '');
      refinedPrompt = refinedPrompt.replace(/[^a-zA-Z0-9.,;:()'"\s\n]/g, '');
      refinedPrompt = refinedPrompt.slice(0, 800);

      console.log("Sanitized prompt:", refinedPrompt);
      console.log("Sending refined prompt to DALL·E 3...");

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
      res.status(500).json({ error: 'Generation failed' });
    }
  });
}
