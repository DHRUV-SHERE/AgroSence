import React from "react";
import { motion } from "framer-motion";

const FeatureCard = ({ image, title, description }) => {
  return (
    <motion.div
      className="col-12 col-sm-6 col-lg-4 d-flex flex-column align-items-center text-center mb-4"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      <motion.img
        src={image}
        alt={title}
        className="img-fluid mb-3 rounded shadow"
        style={{
          maxWidth: "100%",
          maxHeight: "250px",
          objectFit: "cover",
          borderRadius: "15px",
        }}
        whileHover={{ scale: 1.05 }}
      />
      <h5 className="mb-3 fw-bold text-success">{title}</h5>
      <p className="text-muted">{description}</p>
    </motion.div>
  );
};

export default FeatureCard;
