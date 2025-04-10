import ProductCard from "./ProductCard";

const ProductGrid = ({ products }) => {
  return (
    <div className="row g-4">
      {products.map((product, index) => (
        <div key={index} className="col-12 col-sm-6 col-lg-3">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
