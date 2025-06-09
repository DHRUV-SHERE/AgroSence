import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { IoIosPricetags } from "react-icons/io";
import {
  BsGrid1X2Fill,
  BsBox,
  BsBarChart,
  BsFileText,
  BsClock,
  BsLifePreserver,
  BsHouseFill,
  BsGearFill,
  BsPhoneFill,
  BsTools,
  BsSearch,
  BsBoxArrowRight,
  BsX,
  BsList,
} from "react-icons/bs";

const Sidebar = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkClass = (path) =>
    `d-flex align-items-center text-decoration-none p-2 rounded ${
      location.pathname === path
        ? "text-success bg-success bg-opacity-10"
        : "text-secondary"
    }`;

  const toggleSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    window.location.href = "/"; // OR use useNavigate if preferred
  };

  const menuItems = [
    { to: "/Dashboard", icon: <BsGrid1X2Fill />, label: "Dashboard" },
    { to: "/CropSell", icon: <BsBarChart />, label: "Crop Sell" },
    { to: "/OrderHistory", icon: <BsClock />, label: "User History" },
    {
      to: "/LiveCropPricing",
      icon: <IoIosPricetags />,
      label: "Live Crop Pricing",
    },
    {
      to: "/Reports",
      icon: <BsFileText />,
      label: "Farming Report / Requests",
    },
    { to: "/Routine", icon: <BsBox />, label: "Farming Routine" },
    {
      to: "/QuickSupport",
      icon: <BsLifePreserver />,
      label: "Quick Support / Feedback",
    },
  ];

  const extraLinks = [
    { to: "/", icon: <BsHouseFill />, label: "Home" },
    { to: "/Feature", icon: <BsTools />, label: "Features" },
    { to: "/ContactUs", icon: <BsPhoneFill />, label: "Contact" },
    { to: "/Setting", icon: <BsGearFill />, label: "Settings" },
    { to: "/", icon: <BsBoxArrowRight />, label: "Logout", isLogout: true },
  ];

  return (
    <>
      {/* Toggle Button for Mobile */}
      <button
        className="btn btn-light d-lg-none position-fixed top-0 start-0 m-4 z-3"
        onClick={toggleSidebar}
      >
        <BsList size={24} />
      </button>

      {/* Desktop Sidebar */}
      <div
        className="sidebar bg-white border-end h-100 position-fixed d-none d-lg-block"
        style={{ width: "250px", zIndex: 1045 }}
      >
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <h3 className="m-0" style={{ fontFamily: "martel" }}>
            AgroSence
          </h3>
        </div>

        <div
          className="p-3 sidebar-content overflow-auto"
          style={{ height: "calc(100vh - 71px)" }}
        >
          {menuItems.map((item, idx) => (
            <div className="mb-2" key={idx}>
              <Link to={item.to} className={linkClass(item.to)}>
                {item.icon}
                <span className="ms-3">{item.label}</span>
              </Link>
            </div>
          ))}

          <div className="border-top pt-4">
            <small className="text-muted px-2 fw-bold">
              Access Other Features
            </small>
            {extraLinks.map((item, idx) => (
              <div className="mt-2" key={idx}>
                {item.isLogout ? (
                  <button
                    onClick={handleLogout}
                    className="d-flex align-items-center text-secondary p-2 rounded border-0 bg-transparent w-100"
                    style={{ textAlign: "left" }}
                  >
                    {item.icon}
                    <span className="ms-3">{item.label}</span>
                  </button>
                ) : (
                  <Link to={item.to} className={linkClass(item.to)}>
                    {item.icon}
                    <span className="ms-3">{item.label}</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`sidebar bg-white border-end position-fixed start-0 top-0 h-100 d-lg-none ${
          mobileOpen ? "" : "d-none"
        }`}
        style={{ width: "250px", zIndex: 1050 }}
      >
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <h3 className="m-0">AgroSence</h3>
          <button
            className="btn btn-link p-0 text-dark"
            onClick={toggleSidebar}
          >
            <BsX size={24} />
          </button>
        </div>

        <div className="p-3">
          <div className="input-group">
            <span
              className="input-group-text text-muted fs-5"
              style={{
                backgroundColor: "#F2F4F8",
                borderTopLeftRadius: "25px",
                borderBottomLeftRadius: "25px",
                border: "1px solid #ccc",
                borderRight: "none",
              }}
            >
              <BsSearch />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                backgroundColor: "#F2F4F8",
                borderTopRightRadius: "25px",
                borderBottomRightRadius: "25px",
                border: "1px solid #ccc",
                borderLeft: "none",
              }}
            />
          </div>
        </div>

        <div
          className="p-3 sidebar-content overflow-auto"
          style={{ height: "calc(100vh - 71px)" }}
        >
          {menuItems.map((item, idx) => (
            <div className="mb-2" key={idx}>
              <Link
                to={item.to}
                className={linkClass(item.to)}
                onClick={toggleSidebar}
              >
                {item.icon}
                <span className="ms-3">{item.label}</span>
              </Link>
            </div>
          ))}

          <div className="border-top pt-4">
            <small className="text-muted px-2 fw-bold">
              Access Other Features
            </small>
            {extraLinks.map((item, idx) => (
              <div className="mt-2" key={idx}>
                {item.isLogout ? (
                  <button
                    onClick={() => {
                      toggleSidebar();
                      handleLogout();
                    }}
                    className="d-flex align-items-center text-secondary p-2 rounded border-0 bg-transparent w-100"
                    style={{ textAlign: "left" }}
                  >
                    {item.icon}
                    <span className="ms-3">{item.label}</span>
                  </button>
                ) : (
                  <Link
                    to={item.to}
                    className={linkClass(item.to)}
                    onClick={toggleSidebar}
                  >
                    {item.icon}
                    <span className="ms-3">{item.label}</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
