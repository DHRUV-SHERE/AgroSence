import React from "react";
import Header from "../components/Header"; // Ensure the path is correct
import AboutSection from "../components/home/AboutSection"; // Ensure the path is correct
import Features from "../components/home/Features"; // Ensure the path is correct
import Footer from "../components/Footer"; // Ensure the path is correct
import HomeHeader from "../components/home/HomeHeader"; // Ensure the path is correct

function Home() {
  return (
    <div className="w-100" style={{ backgroundColor: "#35a750" }}>
      {/* Header at the top */}
      <Header />

      {/* Main Content */}
      <div className="main-content">
        <HomeHeader />
        <AboutSection />
        <hr />
        <Features />
      </div>

      {/* Footer at the bottom */}
      <Footer />
    </div>
  );
}

export default Home;
