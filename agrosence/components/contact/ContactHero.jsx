import { resource } from "../../resource";
const ContactHero = () => {
  return (
    <div
    className="d-flex align-items-center justify-content-center hero-section position-relative text-white text-center py-5"
    style={{
      backgroundImage: `url(${resource.ContactBg.src})`,
      backgroundPosition: "bottom", // Default: image aligned at the bottom
      backgroundSize: "cover", // Image scales to cover the section
      backgroundRepeat: "no-repeat", // Prevents background tiling
      height: "450px", // Default height for larger screens
    }}
  >
     {/* <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
      ></div> */}
    <h1 className="text-white position-relative display-2 fw-bold">
      Contact
    </h1>
  </div>
  );
};

export default ContactHero;
