// src/pages/ProductDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState("");

  useEffect(() => {
    async function load() {
      const ref = doc(db, "products", id);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        navigate("/shop");
        return;
      }
      setProduct({ id: snap.id, ...snap.data() });
      setLoading(false);
    }
    load();
  }, [id, navigate]);

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
            </div>
          </div>
        </div>
      </main>


    </div>
  );
}
