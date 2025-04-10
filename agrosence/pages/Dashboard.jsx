import React, { useEffect, useState } from "react";
import { BsBox, BsGraphUp, BsClock, BsCloudSun } from "react-icons/bs";
import Layout from "../components/dashboard/Layout";

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [weather, setWeather] = useState(null);

  const API_URL = "http://localhost:5000/api";
  const API_KEY = "5686d2e419a6f283b8269848f55722f4";

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const userId = localStorage.getItem("userId"); // Get user ID from local storage
      const response = await fetch(`${API_URL}/orders/${userId}`);
      const orders = await response.json();
      
      setOrders(orders);
  
      // Calculate total orders count
      setTotalOrders(orders.length);
  
      // Calculate pending orders count
      const pendingCount = orders.filter(order => order.status === "pending").length;
      setPendingOrders(pendingCount);
  
      // Calculate total sales (CropQuantity * CropSellingPrice)
      const sales = orders.reduce((acc, order) => {
        return acc + (order.cropId.cropQuantity * order.cropId.cropSellingPrice);
      }, 0);
  
      setTotalSales(sales);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };
  
  const fetchWeather = (lat, lon) => {
    if (!lat || !lon) {
      console.error("Latitude or Longitude is undefined.");
      return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    console.log("Fetching weather from:", url);

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Weather Data:", data);
        setWeather(data);
      })
      .catch((error) => console.error("Error fetching weather:", error));
  };

  useEffect(() => {
    const fetchWeatherOnce = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            console.log("User Coordinates:", lat, lon);
            fetchWeather(lat, lon);
          },
          (error) => {
            console.error("Error getting location:", error);
            fetchWeather(23.0225, 72.5714); // Default to Ahmedabad
          }
        );
      } else {
        console.error("Geolocation is not supported.");
        fetchWeather(23.0225, 72.5714);
      }
    };

    fetchWeatherOnce(); // Initial Fetch

    // Fetch again every 1 hour
    const interval = setInterval(fetchWeatherOnce, 3600000);

    return () => clearInterval(interval); // Cleanup
  }, []);

  return (
    <Layout>
      <div className="p-3 p-lg-4">
        <h4 className="mb-4">User Dashboard</h4>

        {/* Metrics Section */}
        <div className="row g-3 g-xl-4 mb-4">
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card">
              <div className="card-body">
                <BsBox size={24} className="text-primary" />
                <h5>Total Orders</h5>
                <p>{totalOrders}</p>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card">
              <div className="card-body">
                <BsClock size={24} className="text-danger" />
                <h5>Pending Orders</h5>
                <p>{pendingOrders}</p>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card">
              <div className="card-body">
                <BsGraphUp size={24} className="text-success" />
                <h5>Total Sales</h5>
                <p>INR.{totalSales}/-</p>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card">
              <div className="card-body">
                <BsCloudSun size={24} className="text-info" />
                <h5>Weather</h5>
                <p>
                  {weather
                    ? `${weather.main.temp}°C, ${weather.weather[0].description}`
                    : "Loading..."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders Section */}
        <h5>Recent Orders</h5>
        <ul className="list-group">
          {orders.slice(0, 5).map((order) => (
            <li key={order._id} className="list-group-item">
              {order.cropId.cropName} - {order.status} (Seller:{" "}
              {order.sellerId.name}, Buyer: {order.buyerId.name})
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
};

export default Dashboard;
