import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Checkout = () => {
  const { cart, cartQuantity, totalPrice } = useCart();
  const navigate = useNavigate();
  const [checkoutProduct, setCheckoutProduct] = useState(null);

  useEffect(() => {
    const product = localStorage.getItem("checkoutProduct");
    if (product) {
      setCheckoutProduct(JSON.parse(product));
    }
  }, []);

  const handleProceedToPayment = () => {
    navigate("/payment");
  };

  // If checking out a single item via Buy Now
  if (checkoutProduct) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-3xl font-semibold mb-6">Review your order</h2>

        <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={checkoutProduct.images?.[0] || "https://via.placeholder.com/100"}
              alt={checkoutProduct.name}
              className="w-24 h-24 rounded-lg object-cover"
            />
            <div>
              <h3 className="text-xl font-bold">{checkoutProduct.name}</h3>
              <p className="text-gray-600">₱{parseFloat(checkoutProduct.price).toFixed(2)}</p>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <span className="font-semibold">Total:</span>
            <span className="text-[#FF9500] font-bold text-lg">
              ₱{parseFloat(checkoutProduct.price).toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleProceedToPayment}
            className="w-full mt-6 bg-[#FF9500] text-white py-3 rounded-lg font-semibold hover:bg-orange-600"
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    );
  }

  // Else show full cart checkout
  if (cartQuantity === 0) {
    return (
      <div className="max-w-7xl mx-auto text-center py-12">
        <h2 className="text-2xl font-semibold">Your cart is empty!</h2>
        <Link to="/shop" className="text-[#FF9500] font-medium underline">
          Go back to shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-semibold mb-6">Review your cart</h2>

      <ul className="space-y-4">
        {cart.map((item) => (
          <li key={item.id} className="flex justify-between border-b pb-3">
            <span>{item.name} - {item.quantity} x ₱{item.price}</span>
            <span>₱{(item.quantity * item.price).toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <div className="flex justify-between mt-6 text-lg font-semibold">
        <span>Total Price:</span>
        <span className="text-[#FF9500]">₱{totalPrice.toFixed(2)}</span>
      </div>

      <div className="mt-6">
        <Link
          to="/payment"
          className="bg-[#FF9500] text-white py-3 px-6 rounded-md hover:bg-orange-600 inline-block"
        >
          Proceed to Payment
        </Link>
      </div>
    </div>
  );
};

export default Checkout;
    