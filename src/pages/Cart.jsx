import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useCart } from "../context/CartContext";
import Footer from "../components/Footer";

const Cart = () => {
  const { cart, removeFromCart, decreaseQuantity, addToCart } = useCart();
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState([]);

  const isSelected = (id) => selectedItems.includes(id);

  // Select All toggle
  const toggleSelectAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]); // Deselect all
    } else {
      setSelectedItems(cart.map((item) => item.id)); // Select all
    }
  };

  const toggleSelection = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleRemoveItem = (id) => {
    removeFromCart(id);
    setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
  };

  const handleQuantityChange = (item, action) => {
    if (action === "increase") {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        images: item.images,
      });
    } else if (action === "decrease") {
      decreaseQuantity(item.id);
    }
  };

  const selectedTotal = cart
    .filter((item) => selectedItems.includes(item.id))
    .reduce((total, item) => total + item.price * item.quantity, 0);

  const handleCheckout = () => {
    const selectedCartItems = cart.filter((item) =>
      selectedItems.includes(item.id)
    );
    localStorage.setItem("selectedCartItems", JSON.stringify(selectedCartItems));
    navigate("/payment");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="max-w-7xl mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold text-[#FF9500]">
            Your Shopping Cart
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            {cart.length === 0 ? "Your cart is empty. Start shopping now!" : `${cart.length} item(s) in your cart`}
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="text-center">
            <img
              src="/images/empty-cart.png"
              alt="Empty Cart"
              className="mx-auto w-64 mb-6"
            />
            <p className="text-lg text-gray-500 mb-6">
              Your cart is empty. Start shopping for your furry friend!
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="px-6 py-3 bg-yellow-400 text-white font-medium rounded-lg hover:bg-yellow-500 transition-all"
            >
              Go to Shop
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            {/* Select All Checkbox */}
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                checked={selectedItems.length === cart.length}
                onChange={toggleSelectAll}
                className="w-5 h-5 accent-[#FF9500]"
              />
              <span className="text-gray-700 font-medium">Select All</span>
            </div>

            {cart.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 sm:grid-cols-6 items-center gap-6 border-b pb-6"
              >
                <div className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={isSelected(item.id)}
                    onChange={() => toggleSelection(item.id)}
                    className="w-6 h-6 accent-[#FF9500] transition-all"
                  />
                </div>

                <div className="sm:col-span-1">
                  <img
                    src={item.images?.[0] || "https://via.placeholder.com/100"}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg shadow-md hover:scale-105 transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-500">₱{item.price}</p>
                </div>

                <div className="sm:col-span-1 flex items-center justify-center gap-4">
                  <button
                    className="px-4 py-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-all"
                    onClick={() => handleQuantityChange(item, "decrease")}
                  >
                    −
                  </button>
                  <span className="text-lg font-semibold">{item.quantity}</span>
                  <button
                    className="px-4 py-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-all"
                    onClick={() => handleQuantityChange(item, "increase")}
                  >
                    +
                  </button>
                </div>

                <div className="sm:col-span-1 text-right">
                  <p className="text-lg font-semibold text-[#FF9500]">
                    ₱{(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    className="text-sm text-red-500 hover:underline mt-2"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <div className="pt-6 border-t mt-6">
              <div className="flex justify-between items-center">
                <p className="text-xl font-semibold text-gray-800">
                  Total: ₱{selectedTotal.toFixed(2)}
                </p>
                <button
                  className="bg-green-500 text-white text-lg px-8 py-3 rounded-lg hover:bg-green-600 transition-all disabled:opacity-50"
                  disabled={selectedItems.length === 0}
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
