import { resource } from "../../resource"

const ResourceHeader = () => {
    return (
      <div className="hero-banner position-relative">
        <div
          className="banner-image w-100"
          style={{
            backgroundImage:`url(${resource.ResourceBG.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "400px",
            position: "relative",
          }}
        >
          <div
            className="banner-content position-absolute text-white text-center"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 2,
              width: "100%",
            }}
          >
            <h1 className="display-3 fw-bold">Resources</h1>
          </div>
        </div>
      </div>
    )
  }
  
  export default ResourceHeader
  
  