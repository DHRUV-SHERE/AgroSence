import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HeroSection from "../components/about/AboutHeroSection";
import VisionSection from "../components/about/VisionSection";
import TeamSection from "../components/about/TeamSection";
import GuideSection from "../components/about/GuideSection";

const AboutPage = () => {
  return (
    <main>
      <Header />
      <HeroSection />
      <VisionSection />
      <TeamSection />
      <GuideSection />
      <Footer />
    </main>
  );
};

export default AboutPage;
