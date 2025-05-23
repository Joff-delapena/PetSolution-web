import React, { useEffect, useState, useMemo } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const statusOptions = useMemo(
    () => ["Pending", "Processing", "On Delivery", "Delivered", "Cancelled"],
    []
  );

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersSnapshot = await getDocs(
        query(collection(db, "orders"), orderBy("timestamp", "desc"))
      );
      const ordersData = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersData);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  const handleDeleteOrder = async (order) => {
    if (
      window.confirm(
        `Are you sure you want to delete order ID: ${order.id}? This action cannot be undone.`
      )
    ) {
      try {
        await deleteDoc(doc(db, "orders", order.id));
        setOrders((prevOrders) =>
          prevOrders.filter((o) => o.id !== order.id)
        );
      } catch (err) {
        console.error("Error deleting order:", err);
      }
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-800",
    Processing: "bg-purple-100 text-purple-800",
    "On Delivery": "bg-blue-100 text-blue-800",
    Delivered: "bg-green-100 text-green-800",
    Cancelled: "bg-red-100 text-red-800",
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-extrabold text-[#FF9500] mb-10 tracking-wide">
        Orders Management
      </h1>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <svg
            className="animate-spin h-12 w-12 text-[#FF9500]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        </div>
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-500 text-lg mt-20">No orders found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-300">
          <table className="min-w-full bg-white">
            <thead className="bg-[#FF9500] text-white uppercase text-sm font-semibold tracking-wider">
              <tr>
                <th className="py-4 px-6 text-left">Order ID</th>
                <th className="py-4 px-6 text-left">User Email</th>
                <th className="py-4 px-6 text-left max-w-xs">Items</th>
                <th className="py-4 px-6 text-left">Total</th>
                <th className="py-4 px-6 text-left">Date</th>
                <th className="py-4 px-6 text-left">Status</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const status = order.status || "Pending";
                return (
                  <tr
                    key={order.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-6 font-mono text-sm text-gray-700">
                      {order.id}
                    </td>
                    <td
                      className="py-3 px-6 truncate max-w-xs text-gray-600"
                      title={order.userEmail || "N/A"}
                    >
                      {order.userEmail || "N/A"}
                    </td>
                    <td className="py-3 px-6 max-w-xs text-gray-700">
                      {order.items?.length > 0 ? (
                        <ul className="list-disc list-inside max-h-24 overflow-auto text-sm">
                          {order.items.map((item, idx) => (
                            <li key={idx}>
                              {item.name} × {item.quantity}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-400 italic">No items</span>
                      )}
                    </td>
                    <td className="py-3 px-6 font-semibold text-gray-800">
                      ₱{order.total?.toFixed(2) || "0.00"}
                    </td>
                    <td className="py-3 px-6 text-gray-600">{formatDate(order.timestamp)}</td>
                    <td className="py-3 px-6 flex items-center space-x-2">
                      <select
                        value={status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value)
                        }
                        className="border border-gray-300 rounded px-2 py-1 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF9500] transition"
                      >
                        {statusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-semibold select-none ${
                          statusColors[status] || "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <button
                        onClick={() => handleDeleteOrder(order)}
                        title="Delete order"
                        className="text-red-600 hover:text-red-800 transition transform hover:scale-110"
                        aria-label={`Delete order ${order.id}`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1m-4 0h4"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
