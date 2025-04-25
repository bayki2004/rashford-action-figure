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
      const response = await fetch("https://rashford-backend-production.up.railway.app/generate-image", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      setGeneratedImage(result.imageUrl);
      setMessage(result.prompt);
    } catch (err) {
      setMessage("Error generating image: " + err.message);
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8 space-y-8 font-sans text-gray-800">
      <h1 className="text-5xl font-extrabold text-orange-600 drop-shadow-md text-center">
        Generate your own action figure!
      </h1>
      <div className="max-w-2xl text-center text-gray-600 text-lg mt-2 space-y-4">
  <p>
    Hey there! Have you ever wanted your own little action figure, or are you just looking to toy around with magical AI? Use the drag-and-drop box below to test it out:
  </p>
  <ol className="list-decimal list-inside text-left mx-auto max-w-md">
    <li>Drag your photo into the field below</li>
    <li>Press <em>Generate</em></li>
    <li>You're already done – voila, your own action figure!</li>
  </ol>
</div>



      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="w-[26rem] h-60 border-4 border-dashed border-orange-400 rounded-2xl flex flex-col justify-center items-center text-orange-700 bg-white shadow-md hover:border-orange-500 cursor-pointer transition duration-200"
        onClick={() => fileInputRef.current.click()}
      >
        {images.length === 0 ? (
  <>
    <p className="text-lg font-medium">Drag & drop images here</p>
    <p className="text-sm text-orange-500">or click to upload</p>
  </>
) : (
  <div className="flex flex-col items-center space-y-2">
    <p className="text-lg font-semibold text-orange-700">
      {images.length} image{images.length > 1 ? "s" : ""} selected
    </p>
    <div className="flex gap-2 flex-wrap justify-center">
      {images.map((img, idx) => (
        <img
          key={idx}
          src={URL.createObjectURL(img)}
          alt={`preview-${idx}`}
          className="w-16 h-16 object-cover rounded shadow"
        />
      ))}
    </div>
  </div>
)}

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
            <img
              src={generatedImage}
              alt="Generated Action Figure"
              className="w-full max-w-md rounded-lg object-cover"
            />
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
