import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/dashboard/Layout";

const LiveCropPrices = () => {
  const [cropData, setCropData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    state: "",
    commodity: "",
    priceOrder: "",
  });

  const [allStates, setAllStates] = useState([]);
  const [allCommodities, setAllCommodities] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 40;

  const fetchCropPrices = async () => {
    setLoading(true);
    const offset = (currentPage - 1) * pageSize;

    try {
      const response = await axios.get(
        "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070",
        {
          params: {
            "api-key":
              "579b464db66ec23bdd000001c249d71a1de243177596a5b0ab5305b4",
            format: "json",
            limit: pageSize,
            offset: offset,
            ...(filters.state && { "filters[state.keyword]": filters.state }),
            ...(filters.commodity && {
              "filters[commodity]": filters.commodity,
            }),
          },
        }
      );

      let records = response.data.records;

      // Apply price sorting
      if (filters.priceOrder === "asc") {
        records.sort(
          (a, b) => parseInt(a.modal_price) - parseInt(b.modal_price)
        );
      } else if (filters.priceOrder === "desc") {
        records.sort(
          (a, b) => parseInt(b.modal_price) - parseInt(a.modal_price)
        );
      }

      setCropData(records);
    } catch (error) {
      console.error("Error fetching crop data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const preloadFilters = async () => {
      let collectedStates = new Set();
      let collectedCommodities = new Set();

      for (let i = 0; i < 5; i++) {
        // 5 pages = ~200 records
        try {
          const response = await axios.get(
            "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070",
            {
              params: {
                "api-key":
                  "579b464db66ec23bdd000001c249d71a1de243177596a5b0ab5305b4",
                format: "json",
                limit: 40,
                offset: i * 40,
              },
            }
          );

          const records = response.data.records;

          records.forEach((r) => {
            if (r.state) collectedStates.add(r.state);
            if (r.commodity) collectedCommodities.add(r.commodity);
          });
        } catch (err) {
          console.error("Error preloading filters:", err);
          break; // stop if error
        }
      }

      setAllStates([...collectedStates].sort());
      setAllCommodities([...collectedCommodities].sort());
    };

    preloadFilters();
  }, []);
  useEffect(() => {
    fetchCropPrices();
    // Reset to page 1 when filter changes
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    fetchCropPrices();
  }, [currentPage]);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <Layout>
      <div className="container my-5">
        <h2 className="text-center mb-4">Live Crop Prices</h2>

        {/* Filters */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <label className="form-label fw-bold">Select State</label>
            <select
              className="form-select"
              name="state"
              onChange={handleChange}
              value={filters.state}
            >
              <option value="">All States</option>
              {allStates.map((state, idx) => (
                <option key={idx} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label fw-bold">Select Crop</label>
            <select
              className="form-select"
              name="commodity"
              onChange={handleChange}
              value={filters.commodity}
            >
              <option value="">All Crops</option>
              {allCommodities.map((crop, idx) => (
                <option key={idx} value={crop}>
                  {crop}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label fw-bold">Price Order</label>
            <select
              className="form-select"
              name="priceOrder"
              onChange={handleChange}
              value={filters.priceOrder}
            >
              <option value="">Default</option>
              <option value="asc">Price: Low to High</option>
              <option value="desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-center">Loading crop prices...</p>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-bordered table-striped">
                <thead className="table-dark">
                  <tr>
                    <th>State</th>
                    <th>District</th>
                    <th>Market</th>
                    <th>Commodity</th>
                    <th>Variety</th>
                    <th>Min Price (₹)</th>
                    <th>Max Price (₹)</th>
                    <th>Modal Price (₹)</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {cropData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.state}</td>
                      <td>{item.district}</td>
                      <td>{item.market}</td>
                      <td>{item.commodity}</td>
                      <td>{item.variety}</td>
                      <td>{item.min_price}</td>
                      <td>{item.max_price}</td>
                      <td>{item.modal_price}</td>
                      <td>{item.arrival_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="d-flex justify-content-between align-items-center mt-3">
              <button
                className="btn btn-primary"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>
              <span className="fw-bold">Page {currentPage}</span>
              <button
                className="btn btn-primary"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={cropData.length < pageSize}
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default LiveCropPrices;
