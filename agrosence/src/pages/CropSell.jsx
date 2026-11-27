import Layout from "../components/dashboard/Layout";
import CropListingForm from "../components/marketaccess/CropListing";
import { useState } from "react";

const CropSell = () => {
  return (
    <Layout>
        <CropListingForm />
    </Layout>
  );
};

export default CropSell;
