import React, { useEffect, useState } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useCart } from "../Context/cartContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Shop = () => {
  const LOW_STOCK_THRESHOLD = 5;

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortOption, setSortOption] = useState("none");
  const [notification, setNotification] = useState("");
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      console.log("Shop: fetching products...");
      try {
        const snap = await getDocs(collection(db, "products"));
        if (snap.empty) {
          console.log("Shop: no products found");
        }
        const productsList = snap.docs.map((doc) => {
          const data = doc.data();
          const feedbacks = data.feedbacks || [];
          const averageRating =
            feedbacks.length > 0
              ? feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length
              : 0;
          return {
            id: doc.id,
            ...data,
            averageRating,
            reviewCount: feedbacks.length,
          };
        });
        console.log("Shop: fetched products count:", productsList.length);
        setProducts(productsList);
        setFilteredProducts(productsList);
      } catch (err) {
        console.error("Shop: fetch error", err);
        alert("Failed to fetch products from Firestore.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((p) => p.category === categoryFilter);
    }

    if (priceFilter === "low") {
      filtered = filtered.filter((p) => p.price <= 500);
    } else if (priceFilter === "mid") {
      filtered = filtered.filter((p) => p.price > 500 && p.price <= 1000);
    } else if (priceFilter === "high") {
      filtered = filtered.filter((p) => p.price > 1000);
    }

    if (sortOption === "price-asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortOption === "name-asc") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === "name-desc") {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    }

    setFilteredProducts(filtered);
  }, [searchQuery, products, categoryFilter, priceFilter, sortOption]);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    addToCart(product);
    setNotification(`✅ "${product.name}" added to cart!`);
    setTimeout(() => setNotification(""), 3000);
  };

  const handleBuyNow = async (e, product) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      alert("Please log in to place an order.");
      return;
    }

    try {
      const ordersRef = collection(db, "orders");

      const newOrder = {
        userId: user.uid,
        userEmail: user.email,
        items: [
          {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.images?.[0] || "",
          },
        ],
        totalPrice: product.price,
        createdAt: new Date(),
        status: "Pending",
      };

      await addDoc(ordersRef, newOrder);

      const existingHistory = JSON.parse(localStorage.getItem("purchaseHistory")) || [];
      const newEntry = {
        ...product,
        quantity: 1,
        image: product.images?.[0] || "",
        purchasedAt: new Date().toISOString(),
      };
      localStorage.setItem("purchaseHistory", JSON.stringify([...existingHistory, newEntry]));

      localStorage.setItem(
        "selectedCartItems",
        JSON.stringify([{ ...product, quantity: 1, image: product.images?.[0] || "" }])
      );

      navigate("/payment");
    } catch (error) {
      console.error("Failed to place order:", error);
      alert("Failed to process your purchase. Please try again.");
    }
  };

  const uniqueCategories = [...new Set(products.map((p) => p.category))];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-gray-500 animate-pulse">Loading products…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {notification && (
        <div className="fixed top-20 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {notification}
        </div>
      )}

      <main className="flex-grow max-w-7xl mx-auto px-6 py-10">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-orange-500 mb-2 tracking-wide">
            🛒 Our Pet Shop
          </h1>
          <p className="text-gray-600 text-lg">
            Browse our selection of high-quality pet essentials.
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="all">All Prices</option>
            <option value="low">₱0 - ₱500</option>
            <option value="mid">₱501 - ₱1000</option>
            <option value="high">₱1000+</option>
          </select>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="none">Sort By</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-xl transition-shadow"
            >
              <div className="aspect-w-4 aspect-h-3">
                <img
                  src={product.images?.[0] || "https://via.placeholder.com/300"}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 mb-2">
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${
                        product.averageRating >= star ? "text-yellow-400" : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.196 3.674a1 1 0 00.95.69h3.862c.969 0 1.371 1.24.588 1.81l-3.124 2.27a1 1 0 00-.364 1.118l1.196 3.674c.3.921-.755 1.688-1.54 1.118L10 13.347l-3.124 2.27c-.785.57-1.84-.197-1.54-1.118l1.196-3.674a1 1 0 00-.364-1.118L3.044 9.1c-.783-.57-.38-1.81.588-1.81h3.862a1 1 0 00.95-.69l1.196-3.674z" />
                    </svg>
                  ))}
                  <span className="text-sm text-gray-500 ml-1">({product.reviewCount})</span>
                </div>

                <p className="text-xl font-bold text-orange-500 mb-1">₱{product.price}</p>
                <p className="text-sm text-gray-600 mb-4">
                  Stock:{" "}
                  <span
                    className={
                      product.quantity === 0
                        ? "text-red-600 font-bold"
                        : product.quantity <= LOW_STOCK_THRESHOLD
                        ? "text-yellow-600 font-semibold"
                        : "text-gray-500"
                    }
                  >
                    {product.quantity === 0
                      ? "Out of stock"
                      : product.quantity <= LOW_STOCK_THRESHOLD
                      ? `⚠️ Low stock (${product.quantity})`
                      : product.quantity}
                  </span>
                </p>

                <div className="mt-auto flex gap-3">
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    disabled={product.quantity === 0}
                    className="flex-grow py-2 px-3 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition disabled:bg-gray-400"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={(e) => handleBuyNow(e, product)}
                    disabled={product.quantity === 0}
                    className="py-2 px-3 rounded-md bg-green-600 text-white hover:bg-green-700 transition disabled:bg-gray-400"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <p className="col-span-full text-center text-gray-500 text-lg">
              No products found matching your criteria.
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
