import React, { useState } from "react";
import Navbar from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";
import { resource } from "../resource";

function CropDetection() {
  const [imageCrop, setImageCrop] = useState(null);
  const [imageHealth, setImageHealth] = useState(null);
  const [resultCrop, setResultCrop] = useState(null);
  const [resultHealth, setResultHealth] = useState(null);
  const [loadingCrop, setLoadingCrop] = useState(false);
  const [loadingHealth, setLoadingHealth] = useState(false);

  const handleCropImageChange = (e) => {
    setImageCrop(e.target.files[0]);
    setResultCrop(null);
  };

  const handleHealthImageChange = (e) => {
    setImageHealth(e.target.files[0]);
    setResultHealth(null);
  };

  const handleCropUpload = async () => {
    if (!imageCrop) return alert("Please select a crop image.");
    const formData = new FormData();
    formData.append("image", imageCrop);

    setLoadingCrop(true);
    try {
      const response = await axios.post(
        "https://agrosence-1.onrender.com/api/crop-detect",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setResultCrop(response.data);
    } catch (error) {
      console.error("Crop detection failed:", error);
      alert("Crop detection failed.");
    } finally {
      setLoadingCrop(false);
    }
  };

  const handleHealthUpload = async () => {
    if (!imageHealth) return alert("Please select a leaf image.");
    const formData = new FormData();
    formData.append("image", imageHealth);

    setLoadingHealth(true);
    try {
      const response = await axios.post(
        "https://agrosence-1.onrender.com/api/crop-health",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setResultHealth(response.data);
    } catch (error) {
      console.error("Health detection failed:", error);
      alert("Crop health detection failed.");
    } finally {
      setLoadingHealth(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container flex flex-col lg:flex-row justify-center items-start gap-10 p-6 lg:p-16 bg-gradient-to-br from-green-50 to-green-100 min-h-screen">
        {/* Crop Detection Section */}
        <div className="w-full lg:w-1/2 bg-white p-8 rounded-2xl shadow-xl">
          <h2 className="text-3xl font-bold text-green-700 mb-4">
            🌿 Crop Detection
          </h2>
          <p className="text-gray-600 mb-4">
            Upload an image of a plant to detect its scientific and local names
            along with a description.
          </p>

          <input
            type="file"
            accept="image/*"
            onChange={handleCropImageChange}
            className="mb-4 w-full border border-gray-300 p-2 rounded-lg"
          />
          <button
            onClick={handleCropUpload}
            disabled={loadingCrop}
            className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {loadingCrop ? "Detecting..." : "🔍 Detect Crop"}
          </button>

          {resultCrop && (
            <div className="mt-6 border-t pt-4">
              <img
                src={resultCrop.image}
                alt="Detected Crop"
                className="w-full h-52 object-cover rounded-xl mb-4"
              />
              <h4 className="text-lg text-green-800 font-semibold">
                🌱 Scientific Name:
              </h4>
              <p className="italic">{resultCrop.scientificName}</p>
              <h4 className="text-lg mt-2 text-blue-700 font-medium">
                Local Names:
              </h4>
              <p>{resultCrop.commonNames?.join(", ")}</p>
              <h4 className="text-lg mt-2 text-blue-700 font-medium">
                Description:
              </h4>
              <p className="text-gray-700">{resultCrop.description}</p>
            </div>
          )}
        </div>

        {/* Crop Health Detection Section */}
        <div className="w-full lg:w-1/2 bg-white p-8 rounded-2xl shadow-xl">
          <h2 className="text-3xl font-bold text-red-700 mb-4">
            🩺 Crop Health Detection
          </h2>
          <p className="text-gray-600 mb-4">
            Upload an image of a leaf to check if it’s healthy or has disease
            symptoms.
          </p>

          <input
            type="file"
            accept="image/*"
            onChange={handleHealthImageChange}
            className="mb-4 w-full border border-gray-300 p-2 rounded-lg"
          />
          <button
            onClick={handleHealthUpload}
            disabled={loadingHealth}
            className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            {loadingHealth ? "Analyzing..." : "🧪 Check Health"}
          </button>

          {resultHealth && (
            <div className="mt-6 border-t pt-4">
              <img
                src={resultHealth.image}
                alt="Health Result"
                className="w-full h-52 object-cover rounded-xl mb-4"
              />
              <h4 className="text-lg font-semibold text-red-700">
                🌿 Health Status:
              </h4>
              <p>{resultHealth.status}</p>
              <h4 className="text-lg mt-2 text-blue-700 font-medium">
                Notes:
              </h4>
              <p className="text-gray-700">{resultHealth.notes}</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default CropDetection;
