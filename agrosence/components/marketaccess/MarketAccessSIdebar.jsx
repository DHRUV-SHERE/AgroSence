import { Nav } from "react-bootstrap";
import { FiShoppingCart, FiDollarSign, FiStar } from "react-icons/fi";
import { resource } from "../../resource";

const Sidebar = () => {
  return (
    <Nav className="flex-column p-2 p-sm-4 h-100 border h-auto">
      <div className="d-flex align-items-center">
        <img
          src={resource.Logo4.src}
          alt="AgroSense Logo"
          className="img-fluid"
          style={{ maxWidth: "100px"}}
        />
        <h3 className="text-dark fw-bold mt-auto mb-3" style={{ fontFamily: "Martel" }}>
          AgroSense
        </h3>
      </div>
      <hr />
      <Nav.Link className="d-flex align-items-center mb-3 text-dark">
        <FiShoppingCart className="me-2" size={18} />
        <span className="fs-6">Buy</span>
      </Nav.Link>

      <Nav.Link className="d-flex align-items-center mb-3 text-dark">
        <FiDollarSign className="me-2" size={18} />
        <span className="fs-6">Sell</span>
      </Nav.Link>

      <Nav.Link className="d-flex align-items-center mb-3 text-dark">
        <FiStar className="me-2" size={18} />
        <span className="fs-6">Review</span>
      </Nav.Link>
    </Nav>
  );
};

export default Sidebar;
