import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { resource } from "../../resource";

const FeatureCard = ({ title, description, image, index }) => {
  const isEven = index % 2 === 0;

  const linkPaths = {
    "Market access": "/features/MarketAccess",
    "Crop detection report": "/features/crop-detection",
    "AI chat bot": "/features/ai-chatbot",
    "Resources": "/features/resources",
    "Government schemes": "/features/government-schemes",
    "Expert Advice": "/features/expert",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: isEven ? -100 : 100 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.2 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      className={`container my-4 my-md-5 ${isEven ? "" : "offset-md-4"}`}
    >
      <div className="row align-items-center">
        {/* Image Section */}
        <motion.div
          className="col-md-4 position-relative mb-4 mb-md-0"
          whileHover={{ scale: 1.05 }}
        >
          <img
            src={resource.Leaf.src}
            alt="Decorative leaf"
            className="position-absolute d-none d-md-block"
            style={{
              width: "8.5rem",
              height: "auto",
              left: "-5.5rem",
              top: "50%",
              transform: "translateY(-50%)",
              opacity: 0.8,
              zIndex: -1,
            }}
          />
          <img
            src={image}
            alt={title}
            className="img-fluid rounded shadow w-auto"
            style={{ maxHeight: "300px", objectFit: "contain" }}
          />
        </motion.div>

        {/* Text Section */}
        <motion.div
          className="col-md-4"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.2 }}
          viewport={{ once: true }}
        >
          <div className="px-3 py-4 text-center text-md-start">
            <h2 className="mb-3 text-success fw-bold">{title}</h2>
            <div className="d-flex align-items-start mb-4">
              <div
                className="vr me-3"
                style={{
                  width: "5px",
                  height: "auto",
                  backgroundColor: "#34a853",
                }}
              ></div>
              <p className="text-muted mb-0">{description}</p>
            </div>
            <Link to={linkPaths[title]}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="btn px-4 py-3 text-white fw-medium"
                style={{
                  backgroundColor: "#34a853",
                  borderRadius: "0px 25px 25px 25px",
                }}
              >
                CLICK HERE
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FeatureCard;
