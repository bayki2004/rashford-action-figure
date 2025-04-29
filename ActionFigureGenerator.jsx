import React, { useState, useRef } from "react";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";

export default function ActionFigureGenerator() {
  const [formInputs, setFormInputs] = useState({
    title: "",
    name: "",
    subtitle: "",
    item1: "",
    item2: "",
    item3: "",
  });
  const [images, setImages] = useState([]);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState([]);

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

  const handleInputChange = (e) => {
    setFormInputs({ ...formInputs, [e.target.name]: e.target.value });
  };

  const generateActionFigures = async () => {
    if (images.length === 0) return;

    setLoading(true);
    setMessage("");
    setGeneratedImages([]);
    const formData = new FormData();
    images.forEach((image, index) => {
      formData.append(`image_${index}`, image);
    });

    // Attach text inputs
    Object.entries(formInputs).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      const response = await fetch("https://rashford-backend-production.up.railway.app/generate-image", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (result.imagesBase64) {
        setGeneratedImages(result.imagesBase64);
      } else {
        setMessage("No images returned.");
      }
    } catch (err) {
      setMessage("Error generating images: " + err.message);
    }
    setLoading(false);
  };

  const orderActionFigure = async () => {
    if (!selectedImage || selectedImage.length === 0) {
      alert("Please select at least one image to order.");
      return;
    }
  
    setLoading(true);
    try {
      const response = await fetch("https://rashford-backend-production.up.railway.app/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64s: selectedImage }),
      });
  
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage("Could not start checkout.");
      }
    } catch (err) {
      setMessage("Error starting checkout: " + err.message);
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
          <li>Fill out the fields below</li>
          <li>Drag your photo into the field below</li>
          <li>Press <em>Generate</em></li>
          <li>Get a coffee</li>
          <li>Choose your favorite!</li>
        </ol>
      </div>

      {/* Form Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        {["title", "name", "subtitle", "item1", "item2", "item3"].map((field) => (
          <input
            key={field}
            type="text"
            name={field}
            value={formInputs[field]}
            onChange={handleInputChange}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        ))}
      </div>

      {/* Drag and Drop Box */}
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

      {/* Generate Button */}
      <div className="flex flex-wrap justify-center gap-4 mt-2">
        <Button onClick={generateActionFigures} disabled={loading || images.length === 0}>
          Generate
        </Button>
      </div>

      {/* Generated Images */}
      {/* Generated Images */}
{generatedImages.length > 0 && (
  <div className="flex flex-wrap justify-center gap-6 mt-6">
    {generatedImages.map((img, idx) => (
      <div
        key={idx}
        onClick={() =>
          setSelectedImage((prev) =>
            prev && prev.includes(img)
              ? prev.filter((i) => i !== img)
              : [...(prev || []), img]
          )
        }
        className={`cursor-pointer rounded-lg border-4 ${
          selectedImage && selectedImage.includes(img)
            ? "border-orange-400"
            : "border-transparent"
        } hover:border-orange-300 p-1 transition`}
      >
        <img
          src={`data:image/png;base64,${img}`}
          alt={`generated-${idx}`}
          className="w-72 h-auto object-contain rounded-lg shadow-md"
        />
      </div>
    ))}
  </div>
)}


      {/* Order Button */}
      {selectedImage && (
        <div className="flex justify-center mt-6">
          <Button onClick={orderActionFigure} disabled={loading}>
            Order Selected
          </Button>
        </div>
      )}

      {loading && <p className="text-orange-600 text-lg font-medium animate-pulse mt-4">Loading your action figure...</p>}
      {message && (
        <div className="max-w-2xl mt-4 p-4 bg-white border shadow rounded text-sm whitespace-pre-line text-gray-800">
          {message}
        </div>
      )}
    </div>
  );
}
