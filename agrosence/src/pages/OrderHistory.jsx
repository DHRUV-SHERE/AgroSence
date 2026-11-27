import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/dashboard/Layout";

const MarketAccessHistory = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");

        if (!token || !userId) {
          console.error("No auth token or user ID found");
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/auth/users/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUser(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchUserProfile();
  }, [userId]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `http://localhost:5000/api/orders/${user._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching order history:", error);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (!user) return <p>Loading user data...</p>;

  return (
    <Layout>
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body">
          <h5 className="card-title fs-3">Market Access History</h5>
          <p className="text-muted small">Your transaction history</p>

          {orders.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Crop</th>
                    <th>Quantity</th>
                    <th>Price (₹)</th>
                    <th>Buyer/Seller</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => (
                    <tr key={index}>
                      <td>{order._id}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>{order.status}</td>
                      <td>{order.cropId?.cropName}</td>
                      <td>
                        {order.cropId?.cropQuantity} {order.cropId?.cropUnit}
                      </td>
                      <td>{order.cropId?.cropSellingPrice}</td>
                      <td>
                        {userId === order.sellerId?._id
                          ? `Buyer: ${order.buyerId?.name}`
                          : `Seller: ${order.sellerId?.name}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted">
              No market access history available.
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MarketAccessHistory;
