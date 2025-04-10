import React from "react";
import FeatureCard from "./FeatureCard";
import { resource } from "../../resource";

const Features = () => {
  const features = [
    {
      image: `${resource.MarketAccess.src}`,
      title: `${resource.MarketAccess.alt}`,
      description:
        "Farmers can use this platform to showcase their crops to a wider audience by listing them with detailed descriptions, images, and pricing.",
    },
    {
      image: `${resource.CropDetection.src}`,
      title: `${resource.CropDetection.alt}`,
      description:
        "The Crop Detection tool uses advanced machine learning algorithms to identify diseases, pests, and nutrient deficiencies in crops by analyzing images.",
    },
    {
      image: `${resource.Aichatbot.src}`,
      title: `${resource.Aichatbot.alt}`,
      description:
        "Our AI-powered chatbot offers round-the-clock assistance to farmers, providing real-time answers to their queries related to farming practices, pest control, crop management, and weather updates.",
    },
    {
      image: `${resource.FarmingResources.src}`,
      title: `${resource.FarmingResources.alt}`,
      description:
        "This feature offers a comprehensive library of farming resources, including step-by-step guides, video tutorials, and expert tips.",
    },
    {
      image: `${resource.GovScheme.src}`,
      title: `${resource.GovScheme.alt}`,
      description:
        "Stay up-to-date with the latest government schemes and benefits specifically tailored for farmers.",
    },
    {
      image: `${resource.ExpertAdvice.src}`,
      title: `${resource.ExpertAdvice.alt}`,
      description:
        "Farmers can use the Expert Advice feature to seek assistance on a variety of topics, such as crop selection, pest management, soil health improvement, irrigation techniques, and post-harvest handling.",
    },
  ];

  return (
    <section className="container mt-3 rounded mb-3 py-5 text-dark shadow-lg border">
      <h2 className="text-center mb-5">Features of our Project</h2>
      <div className="row g-4">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            image={feature.image}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </section>
  );
};

export default Features;
