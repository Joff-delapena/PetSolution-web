import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  getDocs,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { useCart } from "../Context/cartContext";
import Feedback from "../components/Feedback";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notif, setNotif] = useState("");
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    async function load() {
      if (!id) {
        setError("Invalid product ID.");
        setLoading(false);
        return;
      }

      try {
        const ref = doc(db, "products", id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setError("Product not found.");
          setLoading(false);
          return;
        }

        const productData = { id: snap.id, ...snap.data() };
        setProduct(productData);

        // ✅ Load only feedbacks for this product
        const feedbackRef = collection(db, "feedback");
        const feedbackQuery = query(
          feedbackRef,
          where("productId", "==", id),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(feedbackQuery);

        const feedbackList = [];
        querySnapshot.forEach((doc) => {
          feedbackList.push({ id: doc.id, ...doc.data() });
        });

        setFeedbacks(feedbackList);
      } catch (err) {
        console.error("Error loading product or feedback:", err);
        if (err.code === "permission-denied") {
          setError(
            "Access denied. Please check your Firestore rules and authentication."
          );
        } else {
          setError("Failed to load product. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product);
    setNotif(`✅ "${product.name}" added to cart!`);
    setTimeout(() => setNotif(""), 3000);
  };

  const handleBuyNow = () => {
    localStorage.setItem(
      "selectedCartItems",
      JSON.stringify([{ ...product, quantity: 1 }])
    );
    navigate("/payment");
  };

  if (loading) {
    return <div className="p-10 text-center">Loading…</div>;
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-600">
        {error}
        <br />
        <button
          className="mt-4 text-[#FF9500] hover:underline"
          onClick={() => navigate("/shop")}
        >
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb]">
      {notif && (
        <div className="fixed top-20 right-6 bg-green-500 text-white px-6 py-3 rounded-md shadow-lg z-50">
          {notif}
        </div>
      )}

      <main className="flex-1 max-w-4xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-[#FF9500] mb-6 hover:underline"
        >
          ← Back to Shop
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-2xl shadow-lg">
          <img
            src={product.images?.[0] || "https://via.placeholder.com/400"}
            alt={product.name}
            className="w-full h-auto rounded-lg object-cover"
          />

          <div className="flex flex-col">
            <h1 className="text-4xl font-extrabold mb-4">{product.name}</h1>
            <p className="text-[#FF9500] font-bold text-3xl mb-6">
              ₱{parseFloat(product.price).toFixed(2)}
            </p>
            <p className="text-gray-700 mb-8">
              {product.description || "No description available."}
            </p>

            <div className="mt-auto grid grid-cols-1 gap-4">
              <button
                onClick={handleAddToCart}
                className="w-full py-3 bg-yellow-400 text-white rounded-lg font-semibold hover:bg-yellow-500 transition"
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="w-full py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition"
              >
                Buy Now
              </button>
              <button
                onClick={() => setIsFeedbackOpen(true)}
                className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
              >
                Leave Feedback
              </button>
            </div>
          </div>
        </div>

        {/* Show feedbacks */}
        <section className="mt-10 max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-2xl font-semibold mb-4 text-[#FF9500]">
            User Feedback
          </h3>
          {feedbacks.length === 0 ? (
            <p className="text-gray-500">No feedback yet. Be the first to leave one!</p>
          ) : (
            feedbacks.map((fb) => (
              <div key={fb.id} className="border-b border-gray-200 py-3">
                <p className="text-gray-800 italic">"{fb.message}"</p>
                <p className="text-sm text-gray-500 mt-1">
                  — {fb.userEmail || "Anonymous"} |{" "}
                  {fb.createdAt?.toDate
                    ? fb.createdAt.toDate().toLocaleString()
                    : "Unknown date"}
                </p>
              </div>
            ))
          )}
        </section>
      </main>

      {/* Feedback Modal */}
      <Feedback
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        productId={product.id}
        onFeedbackSubmitted={(newFeedback) => {
          setFeedbacks((prev) => [newFeedback, ...prev]);
        }}
      />
    </div>
  );
}
