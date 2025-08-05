import { motion } from "framer-motion";
import { resource } from "../../resource";

const combinedText = "Welcome to the world of modern, smart, and sustainable agriculture empowering farmers with technology.";

const words = combinedText.split(" ");

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const wordVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const HomeHero = () => {
  return (
    <div
      className="d-flex align-items-center justify-content-center text-white text-center position-relative"
      style={{
        backgroundImage: `url(${resource.s2.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        height: "90vh",
      }}
    > 
      <motion.div
        className="display-4 fw-bold px-4 position-relative"
        style={{ zIndex: 2 }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {words.map((word, index) => (
          <motion.span
            key={index}
            variants={wordVariants}
            className="d-inline-block mx-1"
          >
            {word}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
};

export default HomeHero;
