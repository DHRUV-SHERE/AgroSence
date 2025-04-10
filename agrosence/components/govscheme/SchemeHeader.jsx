import { FaChevronLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export const SchemeHeader = ({ stateName }) => {
  const navigate = useNavigate();

  return (
    <div className="scheme-header bg-primary text-white py-4 mb-4">
      <div className="container">
        <button className="btn btn-link text-white mb-2" onClick={() => navigate(-1)}>
          <FaChevronLeft /> Back to States
        </button>
        <h1 className="display-4">{stateName} Government Schemes</h1>
        <p className="lead">Explore the agricultural schemes available in {stateName}.</p>
      </div>
    </div>
  );
};
