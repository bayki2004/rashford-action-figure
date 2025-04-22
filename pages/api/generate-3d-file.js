// rashford/pages/api/generate-3d-file.js
import { OpenAI } from 'openai';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  const { imageUrl } = req.body;

  try {
    // Simulated 3D file generation
    const dummyData = "This would be a real STL file in production.";
    const filename = `action_figure_${Date.now()}.stl`;
    const filePath = path.join('/tmp', filename);
    fs.writeFileSync(filePath, dummyData);

    // Send the file to your email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: 'kaan.bayraktar04@gmail.com',
      subject: 'Your Action Figure 3D File',
      text: 'Attached is your 3D-printable file.',
      attachments: [
        {
          filename,
          path: filePath,
        },
      ],
    });

    return res.status(200).json({ message: 'Action figure ordered!' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to generate or send the 3D file' });
  }
}
