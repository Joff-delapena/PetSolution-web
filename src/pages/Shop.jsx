import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext"; // Corrected path for CartContext
import Header from "../components/Header"; // Importing Header
import Footer from "../components/Footer"; // Import Footer

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState("");
  const navigate = useNavigate();
  const { addToCart } = useCart(); // Access addToCart function from CartContext

  // Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productList);
        setLoading(false); // Set loading to false once data is fetched
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setLoading(false); // Set loading to false even if there's an error
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product); // Add product using CartContext

    setNotification(`Added "${product.name}" to cart!`);
    setTimeout(() => {
      setNotification(""); // Clear notification after 3 seconds
    }, 3000);
  };

  const handleBuyNow = (product) => {
    localStorage.setItem("checkoutProduct", JSON.stringify(product));
    navigate("/checkout");
  };

  if (loading) {
    return <div className="text-center text-lg text-gray-500 py-10">Loading products...</div>; // Ensure loading message is shown
  }

  return (
    <div className="min-h-screen bg-[#fffdf7]">
      <Header /> {/* Header will show the updated cart count */}

      <div className="px-6 py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-[#FF9500] drop-shadow-sm">
            🐾 Our Pet Shop
          </h1>
          <p className="text-gray-600 mt-2 max-w-xl mx-auto">
            Browse our selection of pet essentials, from cuddly beds to tasty treats!
          </p>
        </div>

        {/* Notification for adding product to cart */}
        {notification && (
          <div className="fixed top-1/7 right-6 bg-green-500 text-white px-6 py-3 rounded-md shadow-lg">
            {notification}
          </div>
        )}

        {/* Display Products */}
        {products.length === 0 ? (
          <p className="text-center text-gray-500">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition duration-300 border border-gray-200 overflow-hidden flex flex-col"
              >
                <img
                  src={product.images?.[0] || "https://via.placeholder.com/200x200?text=No+Image"}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-2xl"
                />
                <div className="p-6 flex flex-col justify-between flex-grow">
                  <h2 className="text-base font-semibold text-gray-800 line-clamp-2">
                    {product.name}
                  </h2>
                  <p className="text-sm text-gray-500 line-clamp-1 mt-2">{product.category}</p>
                  <p className="text-[#FF9500] font-bold text-lg mt-3">
                    ₱{product.price}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Stock: {product.quantity}</p>

                  <div className="mt-6 flex gap-4">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className={`flex-1 px-4 py-2 bg-yellow-400 text-white font-medium rounded-lg hover:bg-yellow-500 transition-all ${product.quantity <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={product.quantity <= 0}
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleBuyNow(product)}
                      className="flex-1 px-4 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-all"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer /> {/* Add Footer component here */}
    </div>
  );
};  

export default Shop;
