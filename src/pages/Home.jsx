import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../Context/cartContext";

export default function NewArrivals() {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [newArrivalsList, setNewArrivalsList] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
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

  useEffect(() => {
    const filtered = newArrivalsList.filter(product => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesCategory =
        !selectedCategory || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    setFilteredProducts(filtered);
  }, [newArrivalsList, searchTerm, selectedCategory]);

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

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fadeInDown">
          {notification}
        </div>
      )}

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <section className="bg-[#FF9500] text-white rounded-3xl px-8 py-12 text-center shadow-lg mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-wide drop-shadow-lg">
            Welcome to Pet Solution 🐾
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed drop-shadow-sm">
            Check back soon for the latest treats, toys, and essentials for your furry friends!
          </p>
        </section>

        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">🆕 New Arrivals</h2>
            <p className="text-gray-500 font-semibold">
              Here are the latest additions ({filteredProducts.length})
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full sm:w-1/2 px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full sm:w-1/3 px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            >
              <option value="">All Categories</option>
              <option value="Food">Food</option>
              <option value="Toys">Toys</option>
              <option value="Accessories">Accessories</option>
              {/* Add more categories as needed */}
            </select>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center mt-20 space-y-6">
              <img
                src="/images/no-new-arrivals.png"
                alt="No items"
                className="w-64 h-64 object-contain"
              />
              <h3 className="text-2xl font-semibold text-gray-700">No items found</h3>
              <button
                onClick={() => navigate("/shop")}
                className="px-8 py-3 bg-[#FF9500] text-white rounded-2xl font-semibold shadow-md hover:bg-orange-600 transition"
              >
                Go to Shop
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6 flex flex-col justify-between transform hover:scale-[1.03]"
                >
                  <Link to={`/product/${product.id}`} className="block mb-4">
                    <img
                      src={product.images?.[0] || "https://via.placeholder.com/300"}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-2xl shadow-inner"
                    />
                    <h3 className="mt-3 text-lg font-semibold text-gray-900 line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-[#FF9500] font-extrabold text-xl mt-2">
                    ₱{(parseFloat(product.price) || 0).toFixed(2)}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">Stock: {product.quantity}</p>

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.quantity <= 0}
                      className={`flex-1 py-3 rounded-2xl font-semibold text-white shadow-md transition 
                        ${product.quantity > 0
                          ? "bg-yellow-400 hover:bg-yellow-500"
                          : "bg-yellow-400 opacity-50 cursor-not-allowed"
                        }`}
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleBuyNow(product)}
                      className="flex-1 py-3 rounded-2xl bg-green-600 text-white font-semibold shadow-md hover:bg-green-700 transition"
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
