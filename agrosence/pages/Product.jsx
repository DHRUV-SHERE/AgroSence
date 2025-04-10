import ProductGrid from "../components/product/ProductGrid";
import { resource } from '../resource'
import Layout from "../components/dashboard/Layout";
const Products = () => {
  const products = [
    {
      name: "Rice",
      price: "20",
      location: "Mehsana",
      image: `${resource.CropDetection.src}`,
    },
    {
      name: "Potato",
      price: "20",
      location: "Mehsana",
      image: `${resource.CropDetection2.src}`,
    },
    {
      name: "Corn",
      price: "50",
      location: "Ahmedabad",
      image: `${resource.CropDetection.src}`,
    },
    {
      name: "Strawberry",
      price: "40",
      location: "Rajkot",
      image: `${resource.CropDetection2.src}`,
    },
    {
      name: "Wheat",
      price: "50",
      location: "Patan",
      image: `${resource.CropDetection.src}`,
    },
    {
      name: "Cotton",
      price: "60",
      location: "Vadodara",
      image: `${resource.CropDetection2.src}`,
    },
  ];

  return (
    <Layout>
      <div className="container-fluid p-4" style={{backgroundColor:"#eaeaea"}}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0">Products</h4>
        </div>
        <ProductGrid products={products} />
      </div>
    </Layout>
  );
};

export default Products;
