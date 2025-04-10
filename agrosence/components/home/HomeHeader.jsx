import { resource } from "../../resource";
import { Carousel } from "react-bootstrap";

const HomeHero = () => {
  return (
    <Carousel className="hero-carousel" interval={2000} pause={false}> 
      <Carousel.Item>
        <div
          className="d-flex align-items-center justify-content-center hero-section position-relative text-white text-center py-5"
          style={{
            backgroundImage: `url(${resource.s3.src})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            height: "550px",
          }}
        >
          <h1 className="text-white position-relative m-auto px-3 display-5 fw-bold" style={{ zIndex: 2 }}>
            Welcome to the World of Agriculture
          </h1>
        </div>
      </Carousel.Item>

      <Carousel.Item>
        <div
          className="d-flex align-items-center justify-content-center hero-section position-relative text-white text-center py-5"
          style={{
            backgroundImage: `url(${resource.s2.src})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            height: "550px",
          }}
        >
          <h1 className="text-white position-relative m-auto px-3 display-5 fw-bold" style={{ zIndex: 2 }}>
            Modern Farming Techniques
          </h1>
        </div>
      </Carousel.Item>

      <Carousel.Item>
        <div
          className="d-flex align-items-center justify-content-center hero-section position-relative text-white text-center py-5"
          style={{
            backgroundImage: `url(${resource.s3.src})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            height: "550px",
          }}
        >
          <h1 className="text-white position-relative m-auto px-3 display-5 fw-bold" style={{ zIndex: 2 }}>
            Smart Agriculture Solutions
          </h1>
        </div>
      </Carousel.Item>

      <Carousel.Item>
        <div
          className="d-flex align-items-center justify-content-center hero-section position-relative text-white text-center py-5"
          style={{
            backgroundImage: `url(${resource.s4.src})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            height: "550px",
          }}
        >
          <h1 className="text-white position-relative m-auto px-3 display-5 fw-bold" style={{ zIndex: 2 }}>
            Sustainable Farming Practices
          </h1>
        </div>
      </Carousel.Item>

      <Carousel.Item>
        <div
          className="d-flex align-items-center justify-content-center hero-section position-relative text-white text-center py-5"
          style={{
            backgroundImage: `url(${resource.s2.src})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            height: "550px",
          }}
        >
          <h1 className="text-white position-relative m-auto px-3 display-5 fw-bold" style={{ zIndex: 2 }}>
            Empowering Farmers with Technology
          </h1>
        </div>
      </Carousel.Item>
    </Carousel>
  );
};

export default HomeHero;
