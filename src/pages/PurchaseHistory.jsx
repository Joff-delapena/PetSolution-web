  import React, { useEffect, useState } from "react";
  import { useNavigate } from "react-router-dom";
  import Header from "../components/Header";
  import Footer from "../components/Footer";
  import { db } from "../firebase";
  import {
    collection,
    getDocs,
    updateDoc,
    doc,
    query,
    orderBy,
    addDoc,
  } from "firebase/firestore";
  import { useAuth } from "../Context/AuthContext";
  import { useCart } from "../Context/cartContext";

  const cancelReasons = [
    "Changed my mind",
    "Found a better price",
    "Ordered by mistake",
    "Shipping takes too long",
    "Other",
  ];

  const PurchaseHistory = () => {
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState("Pending");
    const [loading, setLoading] = useState(true);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelOrderId, setCancelOrderId] = useState(null);
    const [selectedReason, setSelectedReason] = useState(cancelReasons[0]);
    const [confirmModal, setConfirmModal] = useState({
      show: false,
      orderId: null,
      status: "",
      message: "",
    });
    const [reviewModal, setReviewModal] = useState({
      show: false,
      item: null,
      orderId: null,
      rating: 5,
      feedback: "",
    });

    const { currentUser } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
      const fetchOrders = async () => {
        try {
          setLoading(true);
          const ordersQuery = query(
            collection(db, "orders"),
            orderBy("timestamp", "desc")
          );
          const querySnapshot = await getDocs(ordersQuery);
          const ordersList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setOrders(ordersList);
        } catch (error) {
          console.error("Error fetching orders:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchOrders();
    }, []);

    const updateOrderStatusWithReason = async (orderId, status, reason = "") => {
      try {
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, { status, cancelReason: reason });

        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status, cancelReason: reason } : order
          )
        );
      } catch (error) {
        console.error("Failed to update order status:", error);
      }
    };

    const handleBuyAgain = (items) => {
      if (!items || items.length === 0) return;

      items.forEach((item) => {
        addToCart({
          id: item.id,
          name: item.name,
          price: item.price,
          images: item.images,
          quantity: item.quantity,
        });
      });

      navigate("/shop");
    };

    const openCancelModal = (orderId) => {
      setCancelOrderId(orderId);
      setSelectedReason(cancelReasons[0]);
      setShowCancelModal(true);
    };

    const handleCancelConfirm = async () => {
      if (!selectedReason) return;
      await updateOrderStatusWithReason(cancelOrderId, "Cancelled", selectedReason);
      setShowCancelModal(false);
      setCancelOrderId(null);
    };

    const openConfirmModal = (orderId, status, message) => {
      setConfirmModal({ show: true, orderId, status, message });
    };

    const handleConfirmStatusChange = async () => {
      const { orderId, status } = confirmModal;
      await updateOrderStatusWithReason(orderId, status);
      setConfirmModal({ show: false, orderId: null, status: "", message: "" });
    };

    const openReviewModal = (item, orderId) => {
      const order = orders.find((o) => o.id === orderId);
      if (order?.status !== "Delivered") return;
      setReviewModal({ show: true, item, orderId, rating: 5, feedback: "" });
    };

    const submitReview = async () => {
      const { item, orderId, rating, feedback } = reviewModal;
      if (!feedback.trim() || !currentUser) return;

      try {
        await addDoc(collection(db, "feedback"), {
          productId: item.id,
          userId: currentUser.uid,
          orderId,
          rating,
          feedback,
          createdAt: new Date(),
        });

        setReviewModal({ show: false, item: null, orderId: null, rating: 5, feedback: "" });
        alert("Feedback submitted successfully!");
      } catch (err) {
        console.error("Error submitting feedback:", err);
      }
    };

    const statuses = ["All", "Pending", "Processing", "On Delivery", "Delivered", "Cancelled"];

    const statusCounts = statuses.reduce((acc, status) => {
      if (status === "All") acc[status] = orders.length;
      else if (status === "Pending")
        acc[status] = orders.filter((o) => o.status === "Pending" || !o.status).length;
      else acc[status] = orders.filter((o) => o.status === status).length;
      return acc;
    }, {});

    const filteredOrders = orders.filter((order) => {
      if (filter === "All") return true;
      if (filter === "Pending") return order.status === "Pending" || !order.status;
      return order.status === filter;
    });

    const formatDate = (timestamp) => {
      if (!timestamp) return "N/A";
      const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
      return date.toLocaleString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-white-50 via-white to-white-50">
        <Header />
        <main className="px-6 py-12 max-w-7xl mx-auto">
          <h2 className="text-4xl font-extrabold mb-10 text-orange-600 text-center tracking-wide drop-shadow-md">
            Your Orders
          </h2>

          {/* Status Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-7 py-3 text-sm font-semibold rounded-full border-2 transition-colors duration-300 shadow-md select-none
                  ${
                    filter === status
                      ? "bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-300"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-orange-100"
                  }`}
                aria-pressed={filter === status}
              >
                {status} ({statusCounts[status] || 0})
              </button>
            ))}
          </div>

          {/* Orders List */}
          {loading ? (
            <p className="text-center text-gray-500 text-lg font-semibold">Loading your orders...</p>
          ) : filteredOrders.length === 0 ? (
            <p className="text-center text-gray-400 text-lg font-semibold">
              No orders found under "{filter}".
            </p>
          ) : (
            <div className="space-y-10">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-lg border border-orange-200 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Order Header */}
                  <div className="bg-orange-50 px-6 py-4 flex justify-between items-center border-b border-orange-200 select-text">
                    <p className="text-xs font-semibold  text-black-500 font-mono tracking-wide">
                      Order ID: <span className="text-orange-black">{order.id}</span>
                    </p>
                    <span
                      className={`text-sm font-semibold px-4 py-1 rounded-full tracking-wide select-none
                        ${
                          order.status === "Cancelled"
                            ? "bg-red-100 text-red-700"
                            : order.status === "Pending" || !order.status
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "Delivered"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                    >
                      {order.status || "Pending"}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div className="px-6 py-6 space-y-6">
                    {order.items?.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-6 border-b border-orange-100 pb-5 last:border-b-0"
                      >
                        <img
                          src={item.images?.[0] || "https://via.placeholder.com/112"}
                          alt={item.name}
                          className="w-28 h-28 object-cover rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300 ease-in-out"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-orange-700 text-xl">{item.name}</p>
                          <p className="text-orange-500 mt-1 font-medium tracking-wide">
                            Quantity: {item.quantity}
                          </p>
                        </div>

                        {/* Leave Feedback button only for Delivered orders */}
                        {order.status === "Delivered" && (
                          <button
                            onClick={() => openReviewModal(item, order.id)}
                            className="px-5 py-2 text-sm bg-orange-600 text-white rounded-full shadow-md hover:bg-orange-700 transition-colors duration-300"
                            aria-label={`Leave feedback for ${item.name}`}
                          >
                            Leave Feedback
                          </button>
                        )}
                      </div>
                    ))}

                    {/* Order Footer */}
                    <div className="flex justify-between items-center mt-8 border-t border-orange-200 pt-5">
                      <p className="text-gray-400 text-sm select-text italic tracking-wide">
                        Ordered on: {formatDate(order.timestamp)}
                      </p>
                      <p className="text-2xl font-extrabold text-black-700 tracking-tight">
                        Total: ₱{order.total?.toLocaleString() || "0.00"}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex flex-wrap justify-end gap-4">
                      {(order.status === "Pending" || !order.status) && order.status !== "Cancelled" && (
                        <button
                          onClick={() => openCancelModal(order.id)}
                          className="px-6 py-2 text-orange-700 bg-orange-100 rounded-full hover:bg-orange-200 transition-colors duration-300 shadow-sm"
                          aria-label={`Cancel order ${order.id}`}
                        >
                          Cancel
                        </button>
                      )}

                      {order.status === "Delivered" && (
                        <button
                          onClick={() => handleBuyAgain(order.items)}
                          className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors duration-300 shadow-md"
                          aria-label={`Buy again items from order ${order.id}`}
                        >
                          Buy Again
                        </button>
                      )}

                      {order.status === "On Delivery" && (
                        <button
                          onClick={() =>
                            openConfirmModal(order.id, "Delivered", "Mark this order as Delivered?")
                          }
                          className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300 shadow-md"
                          aria-label={`Mark order ${order.id} as Delivered`}
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>  
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Cancel Order Modal */}
          {showCancelModal && (
            <div
              className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
              aria-modal="true"
              role="dialog"
            >
              <div className="bg-white rounded-3xl p-8 w-96 max-w-full mx-4 shadow-xl">
                <h3 className="text-xl font-bold text-orange-600 mb-4">Cancel Order</h3>
                <p className="mb-6 text-gray-600">Please select a reason for cancellation:</p>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full border border-orange-300 rounded-xl p-3 mb-6 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                  aria-label="Select cancellation reason"
                >
                  {cancelReasons.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="px-6 py-2 rounded-xl bg-gray-300 text-gray-700 hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCancelConfirm}
                    className="px-6 py-2 rounded-xl bg-orange-600 text-white hover:bg-orange-700 transition"
                    disabled={!selectedReason}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Status Change Modal */}
          {confirmModal.show && (
            <div
              className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
              aria-modal="true"
              role="dialog"
            >
              <div className="bg-white rounded-3xl p-8 w-96 max-w-full mx-4 shadow-xl">
                <h3 className="text-xl font-bold text-orange-600 mb-4">Confirm Status Change</h3>
                <p className="mb-6 text-gray-700">{confirmModal.message}</p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setConfirmModal({ show: false, orderId: null, status: "", message: "" })}
                    className="px-6 py-2 rounded-xl bg-gray-300 text-gray-700 hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmStatusChange}
                    className="px-6 py-2 rounded-xl bg-orange-600 text-white hover:bg-orange-700 transition"
                  >
                    Yes
                  </button>
                </div>
              </div>
            </div>
          )}

          {reviewModal.show && (
  <div
    className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
    aria-modal="true"
    role="dialog"
  >     
    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-xl">
      <h3 className="text-xl font-bold text-orange-600 mb-4">Leave Feedback</h3>
      <p className="font-semibold text-orange-700 mb-4">{reviewModal.item?.name}</p>

      {/* Star Rating */}
      <div className="mb-6">
        <label className="block mb-2 text-gray-700 font-medium">Rating:</label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() =>
                setReviewModal((prev) => ({ ...prev, rating: star }))
              }
              role="button"
              aria-label={`${star} star`}
              tabIndex={0}
              className={`text-3xl cursor-pointer ${
                reviewModal.rating >= star ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      {/* Feedback Textarea */}
      <label className="block mb-6">
        <span className="text-gray-700 font-medium">Feedback:</span>
        <textarea
          rows={4}
          value={reviewModal.feedback}
          onChange={(e) =>
            setReviewModal((prev) => ({ ...prev, feedback: e.target.value }))
          }
          className="mt-1 block w-full rounded-xl border border-orange-300 p-3 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
          placeholder="Write your feedback here..."
          aria-label="Feedback text area"
        />
      </label>

      {/* Buttons */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() =>
            setReviewModal({ show: false, item: null, orderId: null, rating: 5, feedback: "" })
          }
          className="px-6 py-2 rounded-xl bg-gray-300 text-gray-700 hover:bg-gray-400 transition"
        >
          Cancel
        </button>
        <button
          onClick={submitReview}
          disabled={!reviewModal.feedback.trim()}
          className="px-6 py-2 rounded-xl bg-orange-600 text-white hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
)}
        </main>
        <Footer />
      </div>
    );
  };

  export default PurchaseHistory;
