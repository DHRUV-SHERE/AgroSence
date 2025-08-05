import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { resource } from "../../resource";

const textArray = [
  "Welcome to the World of Agriculture",
  "Modern Farming Techniques",
  "Smart Agriculture Solutions",
  "Sustainable Farming Practices",
  "Empowering Farmers with Technology",
];

const HomeHero = () => {
  const controls = useAnimation();

  useEffect(() => {
    const sequence = async () => {
      while (true) {
        for (const text of textArray) {
          await controls.start({
            opacity: [0, 1, 1, 0],
            transition: { duration: 4, times: [0, 0.2, 0.8, 1] },
          });
        }
      }
    };
    sequence();
  }, [controls]);

  return (
    <div
      className="d-flex align-items-center justify-content-center text-white text-center position-relative"
      style={{
        backgroundImage: `url(${resource.s2.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        height: "80vh",
      }}
    >
      <motion.h1
        key="hero-text"
        animate={controls}
        className="display-4 fw-bold px-3 position-relative"
        style={{ zIndex: 2 }}
      >
        {textArray[0]} {/* Initial text (won’t matter due to animation loop) */}
      </motion.h1>
      <div
        className="overlay position-absolute top-0 start-0 w-100 h-100"
        style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1 }}
      />
    </div>
  );
};

export default HomeHero;
