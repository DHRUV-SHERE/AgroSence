import {
  FaCheckCircle,
  FaFileAlt,
  FaGift,
  FaExternalLinkAlt,
} from "react-icons/fa";

export const SchemeCard = ({ data, type }) => {
  return (
    <div className="card mb-4 scheme-card h-100 shadow-sm">
      <div className="card-body">
        <h3 className="card-title h4 text-primary mb-3">
          {type === "state" ? (
            <FaMapMarkerAlt className="me-2" />
          ) : (
            <FaFileAlt className="me-2" />
          )}
          {type === "state" ? data.state : data.name}
        </h3>
        {type === "state" ? (
          <img src={data.mapUrl} alt={data.state} className="card-img-top" />
        ) : (
          <>
            <div className="mb-3">
              <h4 className="h6 text-muted">Eligibility</h4>
              <p className="card-text">{data.eligibility}</p>
            </div>
            <div className="mb-3">
              <h4 className="h6 text-muted">Description</h4>
              <p className="card-text">{data.description}</p>
            </div>
            <div className="mb-3">
              <h4 className="h6 text-muted">Benefits</h4>
              <p className="card-text">{data.benefit}</p>
            </div>
            <a
              href={data.applyLink}
              className="btn btn-primary mt-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Apply Now <FaExternalLinkAlt className="ms-1" />
            </a>
          </>
        )}
      </div>
    </div>
  );
};
