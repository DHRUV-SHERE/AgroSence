"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Button, Row, Col } from "react-bootstrap";
import Header from "../components/Header";
import MarketHero from "../components/marketaccess/MarketHero";
import ProductCards from "../components/marketaccess/CropBuyCard";
import "bootstrap/dist/css/bootstrap.min.css";

const MainLayout = () => {
  const navigate = useNavigate();
  return (
    <>
      <Header />
      <MarketHero />
      <Container fluid>
        <div className="backbtn w-auto d-flex justify-content-start align-items-center">
          <Button
            variant="primary"
            onClick={() => navigate(-1)}
            className="mt-4"
          >
            Back to Features
          </Button>
        </div>
        <ProductCards />
      </Container>
    </>
  );
};

export default MainLayout;
