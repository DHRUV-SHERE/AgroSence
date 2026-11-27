import React, { useState } from "react";
import Navbar from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";
import { resource } from "../resource";

function CropDetection() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!image) return alert("Please select an image.");

    const formData = new FormData();
    formData.append("image", image);

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/crop-detect",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setResult(response.data);
    } catch (error) {
      console.error("Detection failed:", error);
      alert("Crop detection failed. Please try another image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="container flex mt-2 flex-col lg:flex-row justify-center items-start gap-10 p-6 lg:p-16 bg-gradient-to-br from-green-50 to-green-100 min-h-screen">
        {/* LEFT: Upload and Result */}
        <div className="w-full lg:w-1/2 bg-white p-8 rounded-2xl shadow-xl">
          <h2 className="text-3xl font-bold text-green-700 mb-4">
            🌿 Crop Detection
          </h2>
          <p className="text-gray-600 mb-6">
            Upload an image of a crop or plant to detect its scientific and
            local name along with a description.
          </p>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mb-4 block w-full border border-gray-300 p-2 rounded-lg"
          />

          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full py-2 bg-green-600 rounded-lg hover:bg-green-700 transition"
          >
            {loading ? "Detecting..." : "🔍 Detect Crop"}
          </button>

          {result && (
            <div className="mt-8">
              <img
                src={result.image}
                alt="Detected"
                className="w-full h-60 object-cover rounded-xl border mb-4"
              />
              <h3 className="text-xl fw-bold font-semibold text-green-700">
                🌱 Scientific Name:
              </h3>
              <h4 className="italic text-gray-800 mb-3">
                {result.scientificName}
              </h4>

              {result.commonNames?.length > 0 && (
                <>
                  <h4 className="text-lg fw-bold font-medium text-blue-600">
                    Local/Common Names:
                  </h4>
                  <h6 className="text-gray-700 mb-3">
                    {result.commonNames.join(", ")}
                  </h6>
                </>
              )}

              <h4 className="text-lg fw-bold font-medium text-blue-600">
                Description:
              </h4>
              <h6 className="text-gray-700">{result.description}</h6>
            </div>
          )}
        </div>

        {/* RIGHT: How It Works */}
        <div className="w-full lg:w-1/2 p-6 bg-white rounded-2xl shadow-lg">
          <img
            src={resource.Aichatbot.src} // Replace with your image or illustration
            alt="How it works"
            className="mt-6 mb-6 srounded-xl w-25 h-25 p-5 shadow-md w-full"
          />
          <h3 className="text-2xl font-bold text-green-700 mb-4">
            📘 How It Works
          </h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Choose or capture a clear image of a plant or crop.</li>
            <li>Click the "Detect Crop" button to start identification.</li>
            <li>Wait a few seconds while our AI analyzes your image.</li>
            <li>
              Get the plant’s scientific name, local names, and description
              instantly!
            </li>
          </ul>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default CropDetection;
