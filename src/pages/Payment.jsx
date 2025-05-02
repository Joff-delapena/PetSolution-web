import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useCart } from "../context/CartContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Payment = () => {
  const navigate = useNavigate();
  const { removeFromCart, clearCart } = useCart();
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("creditCard");

  useEffect(() => {
    const stored = localStorage.getItem("selectedCartItems");
    if (stored) setCheckoutItems(JSON.parse(stored));
  }, []);

  const getTotal = () =>
    checkoutItems.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2);

  const paymentMethods = [
    { id: "creditCard", label: "Credit Card", desc: "Visa, MasterCard, etc." },
    { id: "paypal",    label: "PayPal",      desc: "Pay securely with PayPal" },
    { id: "gcash",     label: "GCash",       desc: "Pay using your GCash account" },
    { id: "cod",       label: "COD",         desc: "Cash on Delivery" },
  ];

  const handleConfirm = async () => {
    setIsProcessing(true);

    try {
      // 1. Update Firestore stock
      for (const item of checkoutItems) {
        const ref = doc(db, "products", item.id);
        const snap = await getDoc(ref);
        const current = snap.exists() ? snap.data().quantity || 0 : 0;

        if (current < item.quantity) {
          alert(`Not enough stock for "${item.name}"`);
          setIsProcessing(false);
          return;
        }
        await updateDoc(ref, { quantity: current - item.quantity });
      }

      // 2. Remove from cart context
      checkoutItems.forEach((item) => removeFromCart(item.id));
      // 3. Clear localStorage
      localStorage.removeItem("selectedCartItems");
      // (optional) clear entire cart: clearCart();
      // 4. Navigate to Thank You
      navigate("/thankyou");
    } catch (err) {
      console.error(err);
      alert("Payment processing failed.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-grow max-w-4xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-center text-[#FF9500] mb-8">
          Secure Payment
        </h2>

        {checkoutItems.length === 0 ? (
          <p className="text-center text-gray-600">No items to pay for.</p>
        ) : (
          <div className="bg-white rounded-xl shadow p-6 space-y-6">
            {/* Item summary */}
            <div className="space-y-4">
              {checkoutItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <h4 className="font-medium text-gray-800">{item.name}</h4>
                    <p className="text-sm text-gray-600">
                      ₱{item.price} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold">
                    ₱{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-between text-xl font-bold text-[#FF9500]">
              <span>Total:</span>
              <span>₱{getTotal()}</span>
            </div>

            {/* Payment methods */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Choose Payment Method
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {paymentMethods.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`cursor-pointer p-4 border-2 rounded-lg text-center transition transform hover:scale-105 ${
                      paymentMethod === m.id
                        ? "border-[#FF9500] bg-orange-50"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    <h4 className="font-medium">{m.label}</h4>
                    <p className="text-sm text-gray-500">{m.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm button */}
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className={`w-full py-3 text-white rounded-lg font-semibold transition ${
                isProcessing
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#FF9500] hover:bg-orange-600"
              }`}
            >
              {isProcessing
                ? paymentMethod === "cod"
                  ? "Placing Order..."
                  : "Processing Payment..."
                : paymentMethod === "cod"
                ? "Place Order"
                : "Pay Now"}
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Payment;
