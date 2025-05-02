import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaSearch } from "react-icons/fa";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState("");
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        const productsList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsList);
        setFilteredProducts(productsList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    addToCart(product);
    setNotification(`✅ "${product.name}" added to cart!`);
    setTimeout(() => setNotification(""), 3000);
  };

  const handleBuyNow = (e, product) => {
    e.preventDefault();
    localStorage.setItem("selectedCartItems", JSON.stringify([{ ...product, quantity: 1 }]));
    navigate("/payment");
  };

  if (loading) {
    return <div className="text-center text-lg text-gray-500 py-10">Loading products…</div>;
  }

  return (
    <div className="min-h-screen bg-[#fffdf7]">
      <Header />

      {notification && (
        <div className="fixed top-20 right-6 bg-green-500 text-white px-6 py-3 rounded-md shadow-lg">
          {notification}
        </div>
      )}

      <div className="px-6 py-10 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-[#FF9500]">🛒 Our Pet Shop</h1>
          <p className="text-gray-600 mt-2">Browse our selection of pet essentials!</p>
        </div>

        <div className="mb-6 flex justify-start">
          <div className="relative w-full max-w-lg">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search all products..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#000] focus:outline-none focus:ring-2 focus:ring-[#000]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition overflow-hidden flex flex-col no-underline"
            >
              <img
                src={product.images?.[0] || "https://via.placeholder.com/200"}
                alt={product.name}
                className="w-full h-48 object-cover rounded-t-2xl"
              />
              <div className="p-6 flex flex-col flex-grow">
                <h2 className="text-lg font-semibold text-gray-800 line-clamp-2">{product.name}</h2>
                <p className="text-sm text-gray-500 mt-1">₱{product.price}</p>
                <p className="text-sm text-gray-400 mt-1">Stock: {product.quantity}</p>
                <div className="mt-auto flex gap-2">
                  <button
                    onClick={e => handleAddToCart(e, product)}
                    className={`flex-1 px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition ${
                      product.quantity <= 0 ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={product.quantity <= 0}
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={e => handleBuyNow(e, product)}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Shop;
