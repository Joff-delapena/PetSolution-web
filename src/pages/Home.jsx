import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";

export default function NewArrivals() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [newArrivalsList, setNewArrivalsList] = useState([]);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const oneWeekAgo = Timestamp.fromDate(
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        );
        const q = query(
          collection(db, "products"),
          where("createdAt", ">", oneWeekAgo)
        );
        const snap2 = await getDocs(q);
        const newProds = snap2.docs.map(d => ({ id: d.id, ...d.data() }));
        setNewArrivalsList(newProds);
      } catch (err) {
        console.error("Error fetching new arrivals:", err);
      }
    };
    fetchNewArrivals();
  }, []);

  const handleAddToCart = product => {
    addToCart(product);
    setNotification(`✅ "${product.name}" added to cart!`);
    setTimeout(() => setNotification(""), 3000);
  };

  const handleBuyNow = product => {
    localStorage.setItem(
      "selectedCartItems",
      JSON.stringify([{ ...product, quantity: 1 }])
    );
    navigate("/payment");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f9fafb]">
      <Header />

      {notification && (
        <div className="fixed top-6 right-6 bg-green-500 text-white px-6 py-3 rounded-md shadow-lg z-50">
          {notification}
        </div>
      )}

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <section className="bg-[#FF9500] text-white rounded-3xl px-6 py-10 text-center shadow-lg mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Pet Solution 🐾</h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto">
            Check back soon for the latest treats, toys, and essentials for your furry friends!
          </p>
        </section>

        <section>
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">🆕 New Arrivals</h2>
            <p className="text-gray-500">
              Here are the latest additions ({newArrivalsList.length})
            </p>
          </div>

          {newArrivalsList.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center mt-10">
              <img
                src="/images/no-new-arrivals.png"
                alt="No items"
                className="w-64 h-64 mb-6"
              />
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">No items found</h3>
              <button
                onClick={() => navigate("/shop")}
                className="px-6 py-2 bg-[#FF9500] text-white rounded-lg hover:bg-orange-600 transition"
              >
                Go to Shop
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {newArrivalsList.map(product => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-5 flex flex-col justify-between"
                >
                  <Link to={`/product/${product.id}`}>
                    <img
                      src={product.images?.[0] || "https://via.placeholder.com/150"}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-xl mb-4"
                    />
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{product.name}</h3>
                  </Link>
                  <p className="text-[#FF9500] font-bold text-lg mt-2">
                    ₱{(parseFloat(product.price) || 0).toFixed(2)}
                  </p>
                  <p className="text-gray-500 text-sm">Stock: {product.quantity}</p>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className={`flex-1 px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition ${
                        product.quantity <= 0 ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={product.quantity <= 0}
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleBuyNow(product)}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
