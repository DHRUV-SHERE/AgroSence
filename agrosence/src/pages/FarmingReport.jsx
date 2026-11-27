import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Button } from "react-bootstrap";
import Layout from "../components/dashboard/Layout";

const FarmingReport = () => {
  const [user, setUser] = useState(null); // Fetch user profile first
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch User Profile First
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const userId = localStorage.getItem("userId");

        if (!token || !userId) {
          console.error("No auth token or user ID found");
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/auth/users/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setUser(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  // ✅ Fetch Orders After User is Set
  useEffect(() => {
    if (!user) return; // Wait until user is fetched

    const fetchOrders = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        const response = await axios.get(`http://localhost:5000/api/orders`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        // ✅ Filter out Accepted and Rejected orders from frontend state
        setOrders(response.data.filter((order) => order.status === "Pending"));
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]); // Depend on user so it only runs after fetching the profile

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/orders/${orderId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      // ✅ Immediately update state to remove accepted/rejected orders
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order._id !== orderId)
      );
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  return (
    <Layout>
      <h2>Farming Report</h2>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders available.</p>
      ) : (
        orders.map((order) => {
          const isBuyer =
            user?._id?.toString() === order?.buyerId?._id?.toString();
          const isSeller =
            user?._id?.toString() === order?.sellerId?._id?.toString();

          return (
            <Card key={order._id} className="mb-3">
              <Card.Body>
                {/* ✅ Buyer View (Show full details if accepted) */}
                {isBuyer ? (
                  order?.status === "Accepted" ? (
                    <>
                      <Card.Title>
                        {order?.cropId?.cropName || "Unknown Crop"}
                      </Card.Title>
                      <p>
                        <strong>Seller:</strong>{" "}
                        {order?.sellerId?.name || "Unknown Seller"}
                      </p>
                      <p>
                        <strong>Quantity:</strong> {order?.cropQuantity}{" "}
                        {order?.cropId?.cropUnit || "Unit"}
                      </p>
                      <p>
                        <strong>Price:</strong> ₹
                        {order?.cropId?.cropSellingPrice || "0"}
                      </p>
                      <p>
                        <strong>Status:</strong> {order?.status || "Pending"}
                      </p>
                    </>
                  ) : (
                    <p>
                      <strong>Order Status:</strong> {order?.status}
                    </p>
                  )
                ) : (
                  <>
                    <Card.Title>
                      {order?.cropId?.cropName || "Unknown Crop"}
                    </Card.Title>
                    <p>
                      <strong>Seller:</strong>{" "}
                      {order?.sellerId?.name || "Unknown Seller"}
                    </p>
                    <p>
                      <strong>Buyer:</strong>{" "}
                      {order?.buyerId?.name || "No Buyer"}
                    </p>
                    <p>
                      <strong>Quantity:</strong> {order?.cropQuantity}{" "}
                      {order?.cropId?.cropUnit || "Unit"}
                    </p>
                    <p>
                      <strong>Price:</strong> ₹
                      {order?.cropId?.cropSellingPrice || "0"}
                    </p>
                    <p>
                      <strong>Status:</strong> {order?.status || "Pending"}
                    </p>

                    {/* ✅ Show Accept/Reject only for Seller & if Order is Pending */}
                    {isSeller && order?.status === "Pending" && (
                      <div>
                        <Button
                          variant="success"
                          onClick={() =>
                            updateOrderStatus(order._id, "Accepted")
                          }
                        >
                          Accept
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() =>
                            updateOrderStatus(order._id, "Rejected")
                          }
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </Card.Body>
            </Card>
          );
        })
      )}
    </Layout>
  );
};

export default FarmingReport;
