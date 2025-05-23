import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../Context/CartContext";
import { useAuth } from "../Context/AuthContext";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, checkout } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const isSelected = (id) => selectedItems.includes(id);

  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item.id));
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
      updateQuantity(item.id, 1);
    } else if (action === "decrease") {
      updateQuantity(item.id, -1);
    }
  };

  const selectedTotal = cartItems
    .filter((item) => selectedItems.includes(item.id))
    .reduce((total, item) => total + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!currentUser) {
      alert("Please sign in to checkout.");
      return;
    }
    if (selectedItems.length === 0) {
      alert("Please select at least one item.");
      return;
    }

    setIsProcessing(true);
    try {
      // Call checkout from context - it handles order creation, stock update, cart update
      await checkout(selectedItems);

      // Save selected items locally if needed (for payment page)
      const selectedCartItems = cartItems.filter((item) =>
        selectedItems.includes(item.id)
      );
      localStorage.setItem("selectedCartItems", JSON.stringify(selectedCartItems));

      // Navigate to payment page
      navigate("/payment");
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-5xl font-extrabold text-[#FF9500]">Your Shopping Cart</h1>
            <p className="mt-2 text-lg text-gray-600">
              {cartItems.length === 0
                ? "Your cart is empty. Start shopping now!"
                : `${cartItems.length} item(s) in your cart`}
            </p>
          </div>
        </div>

        {cartItems.length === 0 ? (
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
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                checked={selectedItems.length === cartItems.length}
                onChange={toggleSelectAll}
                className="w-5 h-5 accent-[#FF9500]"
              />
              <span className="text-gray-700 font-medium">Select All</span>
            </div>

            {cartItems.map((item) => (
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

                <div className="sm:col-span-5 text-right">
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
                  disabled={selectedItems.length === 0 || isProcessing}
                  onClick={handleCheckout}
                >
                  {isProcessing ? "Processing..." : "Proceed to Checkout"}
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
