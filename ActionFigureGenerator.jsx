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

  const handleDragOver = (e) => e.preventDefault();
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
    Object.entries(formInputs).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      const response = await fetch("https://rashford-backend-production.up.railway.app/generate-image", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (result.imagesBase64) setGeneratedImages(result.imagesBase64);
      else setMessage("No images returned.");
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
      if (data.url) window.location.href = data.url;
      else setMessage("Could not start checkout.");
    } catch (err) {
      setMessage("Error starting checkout: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-yellow-200 text-gray-800 p-6 font-sans">
      <header className="w-full flex justify-start items-center px-6 py-4">
  <img
    src="/aitoons-logo.png"
    alt="AIToons Logo"
    className="w-40 h-auto"
  />
</header>

      <header className="text-center space-y-4 mb-8">
      <h1 className="text-center font-extrabold text-purple-600 drop-shadow-lg leading-[1.1] text-[3.5rem] sm:text-[4.5rem] md:text-[5.5rem] tracking-tight max-w-5xl mx-auto">
  Imagine yourself<br />
  as an <span className="text-orange-500">Action Figure!</span>
</h1>

        <img
          src="/starter-pack-banner.png"
          alt="Starter Pack Hero"
          className="mx-auto w-full max-w-4xl rounded-lg shadow-lg"
        />
        <h3 className="text-center text-xl sm:text-2xl font-semibold text-purple-600 mt-4">
  Create your own personalized action figure toy with our AI-powered generator
</h3>
<p className="text-center text-lg sm:text-xl font-semibold text-orange-600 mt-4 max-w-3xl mx-auto">
  You will receive your very own custom action figure toy delivered to your doorstep! Once we receive your order we will deliver your custom action figure toy to your doorstep. Play around with the generator and see what you can create! 
</p>

<h3 className="text-center text-xl sm:text-2xl font-semibold text-purple-600 mt-4">
  Let's get started!
</h3>
<h4 className="text-center text-lg sm:text-xl font-semibold text-orange-600 mt-4">
  The process is simple: Strike a pose, pick three items to accompany you and you're good to go. Have Fun :-)
</h4>
    
        <ol className="list-decimal list-inside text-center max-w-xl mx-auto mt-4 text-sm text-gray-700 space-y-1">
          <li>Fill out the fields</li>
          <li>Upload or drag a photo</li>
          <li>Click <em>Generate</em></li>
          <li>Wait for the magic to happen or get a coffee</li>
          <li>Select the ones you like</li>
          <li>Press <strong>Order</strong> and check out!</li>

        </ol>
      </header>

      {/* Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-6">
        {["title", "item1", "name", "item2", "subtitle", "item3"].map((field) => (
          <input
            key={field}
            name={field}
            value={formInputs[field]}
            onChange={handleInputChange}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            className="p-3 rounded border border-purple-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          />
        ))}
      </div>

      {/* Drag and Drop */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="w-[26rem] mx-auto h-60 border-4 border-dashed border-orange-400 rounded-2xl flex flex-col justify-center items-center text-orange-700 bg-white shadow-lg hover:border-orange-500 cursor-pointer transition"
        onClick={() => fileInputRef.current.click()}
      >
        {images.length === 0 ? (
          <>
            <p className="text-lg font-semibold">Drag & drop images here</p>
            <p className="text-sm text-orange-500">or click to upload</p>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <p className="font-semibold text-orange-700">
              {images.length} image{images.length > 1 ? "s" : ""} selected
            </p>
            <div className="flex gap-2 mt-2 flex-wrap justify-center">
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
      <div className="flex justify-center mt-6">
        <Button onClick={generateActionFigures} disabled={loading || images.length === 0}>
          Generate
        </Button>
      </div>

      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <div className="flex flex-wrap justify-center gap-6 mt-8">
          {generatedImages.map((img, idx) => (
            <div
              key={idx}
              onClick={() =>
                setSelectedImage((prev) =>
                  prev.includes(img)
                    ? prev.filter((i) => i !== img)
                    : [...prev, img]
                )
              }
              className={`cursor-pointer border-4 rounded-xl transition shadow-md ${
                selectedImage.includes(img) ? "border-purple-500" : "border-transparent"
              } hover:border-purple-400`}
            >
              <img
                src={`data:image/png;base64,${img}`}
                alt={`generated-${idx}`}
                className="w-72 h-auto object-contain rounded-xl"
              />
            </div>
          ))}
        </div>
      )}

      {/* Order Button */}
      {selectedImage.length > 0 && (
        <div className="flex justify-center mt-8">
          <Button onClick={orderActionFigure} disabled={loading}>
            Order Selected
          </Button>
        </div>
      )}

      {loading && <p className="text-purple-600 text-lg font-semibold mt-6 animate-pulse">Working magic... ✨</p>}
      {message && (
        <div className="max-w-2xl mt-6 p-4 bg-white border shadow rounded text-sm text-gray-800 whitespace-pre-line">
          {message}
        </div>
      )}

<div className="w-full max-w-7xl px-6 mt-16 mx-auto">
  <h2 className="text-3xl font-extrabold text-center text-purple-700 mb-8">
    Gallery
  </h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
    {[
      {
        src: "/selina_1.png",
        caption: "Selina – The Creator",
      },
      {
        src: "/rashford.png",
        caption: "Rashad – The Photographer",
      },
      {
        src: "/selina_2.png",
        caption: "Selina – The Explorer",
      },
    ].map((item, idx) => (
      <div
        key={idx}
        className="text-center transition-transform duration-300 transform hover:scale-105 hover:shadow-2xl"
      >
        <img
          src={item.src}
          alt={`Example ${idx + 1}`}
          className="rounded-lg shadow-lg w-full max-w-sm mx-auto"
        />
        <p className="mt-3 text-md font-medium text-gray-800">{item.caption}</p>
      </div>
    ))}
  </div>
</div>


    </div>
  );
}
