import React, { useState, useRef } from "react";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";

export default function ActionFigureGenerator() {
  const [images, setImages] = useState([]);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith("image/"));
    setImages(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).filter(file => file.type.startsWith("image/"));
    setImages(files);
  };

  const generateActionFigure = async () => {
    setLoading(true);
    setMessage("");
    const formData = new FormData();
    images.forEach((image, index) => {
      formData.append(`image_${index}`, image);
    });

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      setGeneratedImage(result.imageUrl);
      setMessage(result.prompt);
    } catch (err) {
      console.error("API call failed:", err);
      setMessage("Error generating image.");
    }
    setLoading(false);
  };

  const orderActionFigure = async () => {
    setLoading(true);
    const response = await fetch("/api/generate-3d-file", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: generatedImage }),
    });

    if (response.ok) {
      setMessage("Action figure ordered!");
    } else {
      setMessage("Failed to order the action figure.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-orange-100 to-yellow-50 p-8 space-y-8 font-sans text-gray-800">
      <h1 className="text-5xl font-extrabold text-orange-600 drop-shadow-md text-center">Generate your own action figure!</h1>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="w-[26rem] h-60 border-4 border-dashed border-orange-400 rounded-2xl flex flex-col justify-center items-center text-orange-700 bg-white shadow-md hover:border-orange-500 cursor-pointer transition duration-200"
        onClick={() => fileInputRef.current.click()}
      >
        <p className="text-lg font-medium">Drag & drop images here</p>
        <p className="text-sm text-orange-500">or click to upload</p>
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>

      <div className="flex flex-wrap justify-center gap-4 mt-2">
        <Button onClick={generateActionFigure} disabled={loading || images.length === 0}>
          Generate
        </Button>
        <Button onClick={generateActionFigure} disabled={loading || !generatedImage}>
          Regenerate
        </Button>
        <Button onClick={orderActionFigure} disabled={loading || !generatedImage}>
          Order
        </Button>
      </div>

      {loading && <p className="text-orange-600 text-lg font-medium animate-pulse">Loading your action figure...</p>}

      {generatedImage && (
        <Card className="bg-white shadow-xl rounded-xl border border-orange-200">
          <CardContent className="flex justify-center p-4">
            <img src={generatedImage} alt="Generated Action Figure" className="w-full max-w-md rounded-lg" />
          </CardContent>
        </Card>
      )}

      {message && (
        <div className="max-w-2xl mt-4 p-4 bg-white border shadow rounded text-sm whitespace-pre-line text-gray-800">
          <h3 className="font-bold mb-2 text-orange-700">Prompt used:</h3>
          {message}
        </div>
      )}
    </div>
  );
}