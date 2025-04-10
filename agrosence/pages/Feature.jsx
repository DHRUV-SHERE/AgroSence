// FeaturesPage.js
import Header from "../components/Header";
import Footer from "../components/Footer";
import FeatureCard from "../components/feature/FeatureCard";
import { resource } from "../resource";

const Features = () => {
  const features = [
    {
      title: "Market access",
      description:
        "Farmers can use this platform to showcase their crops to a wider audience by listing them with detailed descriptions, images, and pricing. This feature simplifies the process of connecting with potential buyers, helping farmers reach local and national markets and increase their sales potential.",
      image: `${resource.MarketAccess2.src}`,
    },
    {
      title: "Crop detection report",
      description:
        "The Crop Detection tool uses advanced machine learning algorithms to identify diseases, pests, and nutrient deficiencies in crops by analyzing images. Farmers can easily upload pictures of their crops, and the system will provide detailed feedback on any issues, along with practical solutions and preventative measures.",
      image: `${resource.CropDetection2.src}`,
    },
    {
      title: "Resources",
      description:
        "This feature offers a comprehensive library of farming resources, including step-by-step guides, video tutorials, and expert tips. Farmers can access valuable content on various topics like sustainable farming practices, irrigation techniques, soil health, and pest management to improve crop yield and farm productivity.",
      image: `${resource.FarmingResource2.src}`,
    },
    {
      title: "Government schemes",
      description:
        "Stay up-to-date with the latest government schemes and benefits specifically tailored for farmers. This feature helps farmers access detailed information about subsidies, financial support, and agricultural schemes, ensuring they don't miss out on opportunities that could enhance their farming activities.",
      image: `${resource.GovScheme2.src}`,
      isReversed: true,
    },
    {
      title: "Expert Advice",
      description:
        "Farmers can use the Expert Advice feature to seek assistance on a variety of topics, such as crop selection, pest management, soil health improvement, irrigation techniques, and post-harvest handling. By leveraging this feature, farmers can make informed decisions to enhance crop yields and reduce losses.",
      image: `${resource.ExpertAdvice2.src}`,
      isReversed: true,
    },
  ];

  return (
    <div className="min-vh-100 d-flex flex-column overflow-x-hidden ">
      <Header />
      <main>
        <div
          className="d-flex align-items-center justify-content-center hero-section position-relative text-white text-center py-5"
          style={{
            backgroundImage: `url(${resource.FeatureBG.src})`,
            backgroundPosition: "bottom", // Default: image aligned at the bottom
            backgroundSize: "cover", // Image scales to cover the section
            backgroundRepeat: "no-repeat", // Prevents background tiling
            height: "450px", // Default height for larger screens
          }}
        >
        {/* <div
           className="position-absolute top-0 start-0 w-100 h-100"
           style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
         ></div> */}
          <h1 className="text-white position-relative display-2 fw-bold">
            Features
          </h1>
        </div>
        <div className="container-fluid px-md-5">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Features;
