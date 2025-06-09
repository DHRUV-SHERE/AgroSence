import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Home from "../pages/Home";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Feature from "../pages/Feature";
import Setting from "../pages/Setting";
import Dashboard from "../pages/Dashboard";
import LoginPage from "../pages/Login";
import SignupPage from "../pages/Signup";
import Chatbot from "../components/Chatbot";
import Products from "../pages/Product";
import OrderHistory from "../pages/OrderHistory";
import GovSchemes from "../pages/GovScheme";
import MarketAccess from "../pages/MarketAccess";
import StateSchemes from "../pages/StateWiseScheme";
import ResourcesPage from "../pages/Resource1";
import ResourceDetail from "../pages/ResourceDetail";
import AgroExpert from "../pages/AgroExpert"
import CropSell from "../pages/CropSell"
import CropDetail from "../pages/CropDetailCard"
import Reports from "../pages/FarmingReport"
import QuickSupport from "../pages/QuickSupport"
import FarmingRoutine from "../pages/FarmingRoutine"
import LiveCropPricing from "../pages/LiveCropPricing";
import CropDetection from "../pages/CropDetection";
import ForgotPasswordPage from "../pages/ForgotPassword";
// Function to check if user is authenticated
const isAuthenticated = () => {
  return localStorage.getItem("authToken") !== null; // Check if auth token exists
};

// ProtectedRoute Component
const ProtectedRoute = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

const AppContent = () => {
  const location = useLocation();
  const hideChatbotRoutes = ["/Login", "/Signup"]; // Hide chatbot on auth pages

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/About" element={<About />} />
        <Route path="/ContactUs" element={<Contact />} />
        <Route path="/Feature" element={<Feature />} />
        <Route path="/Login" element={<LoginPage />} />
        <Route path="/Signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/Setting" element={<ProtectedRoute element={<Setting />} />} />
        <Route path="/features/government-schemes" element={<ProtectedRoute element={<GovSchemes />} />} />
        <Route path="/features/MarketAccess" element={<ProtectedRoute element={<MarketAccess />} />} />
        <Route path="/features/MarketAccess/product/:id" element={<ProtectedRoute element={<CropDetail />} />} />
        <Route path="/features/expert" element={<ProtectedRoute element={<AgroExpert />} />} />
        <Route path="/features/crop-detection" element={<ProtectedRoute element={<CropDetection />} />} />
        <Route path="/features/resources" element={<ProtectedRoute element={<ResourcesPage />} />} />
        <Route path="/features/resources/:_id" element={<ProtectedRoute element={<ResourceDetail />} />} />
        <Route path="/state-schemes/:stateName" element={<ProtectedRoute element={<StateSchemes />} />} />
        <Route path="/QuickSupport" element={<ProtectedRoute element={<QuickSupport />} />} />
        <Route path="/Reports" element={<ProtectedRoute element={<Reports />} />} />
        <Route path="/LiveCropPricing" element={<ProtectedRoute element={<LiveCropPricing />} />} />
        <Route path="/Routine" element={<ProtectedRoute element={<FarmingRoutine />} />} />
        <Route path="/CropSell" element={<ProtectedRoute element={<CropSell />} />} />
        <Route path="/product" element={<ProtectedRoute element={<Products />} />} />
        <Route path="/OrderHistory" element={<ProtectedRoute element={<OrderHistory />} />} />
      </Routes>

      {!hideChatbotRoutes.includes(location.pathname) && <Chatbot />}
    </>
  );
};

export default App;
