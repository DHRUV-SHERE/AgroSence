import React from "react";
import { motion } from "framer-motion";

const VisionSection = () => {
  return (
    <section
      className="vision-section py-5"
      style={{
        background: "linear-gradient(to right, #f8f9fa, #e9ecef)",
      }}
    >
      <div className="container">
        {/* Heading */}
        <motion.h2
          className="text-center mb-5 fw-bold"
          style={{ fontSize: "40px", color: "#333" }}
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          Our Vision
        </motion.h2>

        {/* Vision Content */}
        <motion.div
          className="row justify-content-center"
          style={{ fontSize: "18px", color: "#555" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="col-lg-10">
            <p className="mb-4 text-justify">
              Welcome to <strong>AgroSense</strong>: Empowering Farmers, Transforming Agriculture.
              AgroSense is a cutting-edge platform designed to revolutionize the way farmers sell their crops.
              By connecting farmers directly to buyers, we eliminate the need for middlemen, empowering farmers
              to set their own prices and maximize their profits. Our goal is to create a fair, efficient, and
              farmer-friendly ecosystem.
            </p>
            <p className="mb-4 text-justify">
              Our mission is to empower the agricultural community with knowledge, tools, and market access.
              By bridging the gap between farmers and buyers, we're fostering transparency, efficiency, and
              economic growth in rural areas.
            </p>
            <p className="mb-4 text-justify">
              This platform not only addresses critical challenges like market connectivity and education gaps
              but also encourages sustainable practices by promoting eco-friendly farming methods.
            </p>
            <p className="text-justify">
              Whether you're a farmer, buyer, or agriculture enthusiast, <strong>AgroSense</strong> invites you
              to be a part of this transformative journey. Together, let's build a sustainable and profitable
              future for agriculture.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default VisionSection;
