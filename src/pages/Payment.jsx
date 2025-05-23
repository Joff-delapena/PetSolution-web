import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useCart } from "../Context/CartContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getAuth } from "firebase/auth";

const Payment = () => {
  const navigate = useNavigate();
  const { removeFromCart } = useCart();
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const auth = getAuth();

  useEffect(() => {
    const stored = localStorage.getItem("selectedCartItems");
    if (stored) setCheckoutItems(JSON.parse(stored));
  }, []);

  const getTotal = () =>
    checkoutItems.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2);

  const paymentMethods = [
    { id: "gcash", label: "GCash", desc: "GCash is not available at the moment." },
    { id: "cod", label: "COD", desc: "Cash on Delivery" },
  ];

  // Optional: Force login before paying (uncomment to enforce)
  // if (!auth.currentUser) {
  //   navigate("/login");
  //   return null;
  // }

  const handleConfirm = async () => {
    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    setIsProcessing(true);

    if (paymentMethod === "gcash") {
      alert("GCash payment is not available at the moment.");
      setIsProcessing(false);
      return;
    }

    try {
      // 1. Check stock and update Firestore stock quantities
      for (const item of checkoutItems) {
        const ref = doc(db, "products", item.id);
        const snap = await getDoc(ref);
        const currentStock = snap.exists() ? snap.data().quantity || 0 : 0;

        if (currentStock < item.quantity) {
          alert(`Not enough stock for "${item.name}". Available: ${currentStock}`);
          setIsProcessing(false);
          return;
        }
        await updateDoc(ref, { quantity: currentStock - item.quantity });
      }

      // Prepare order items array for saving
      const orderItems = checkoutItems.map(({ id, name, price, quantity, image }) => ({
        id,
        name,
        price,
        quantity,
        image: image || "",
      }));

      // 2. Save order to Firestore "orders" collection
      const orderRef = await addDoc(collection(db, "orders"), {
        items: orderItems,
        total: Number(getTotal()),
        status: "Pending",
        paymentMethod,
        timestamp: serverTimestamp(),
        userId: auth.currentUser ? auth.currentUser.uid : null,
      });

      // 3. Save purchase history to Firestore "purchaseHistory" collection for authenticated users
      if (auth.currentUser) {
        await addDoc(collection(db, "purchaseHistory"), {
          userId: auth.currentUser.uid,
          orderId: orderRef.id,
          items: orderItems,
          total: Number(getTotal()),
          paymentMethod,
          status: "Pending", // IMPORTANT: keep status for filtering in PurchaseHistory page
          timestamp: serverTimestamp(),
        });
      } else {
        // Optional: For unauthenticated users, save to localStorage or redirect to login
        // Here is example saving locally (you may want to improve this or force login)
        const existingHistory = JSON.parse(localStorage.getItem("purchaseHistory")) || [];
        existingHistory.push({
          orderId: orderRef.id,
          items: orderItems,
          total: Number(getTotal()),
          paymentMethod,
          status: "Pending",
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem("purchaseHistory", JSON.stringify(existingHistory));
      }

      // 4. Remove purchased items from cart and clear selectedCartItems in localStorage
      checkoutItems.forEach((item) => removeFromCart(item.id));
      localStorage.removeItem("selectedCartItems");

      // 5. Navigate to Thank You page
      navigate("/thankyou");
    } catch (error) {
      console.error("Payment processing error:", error);
      alert("Payment processing failed. Please try again.");
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
                    <p
                      className={`text-sm ${
                        m.id === "gcash" ? "text-red-500" : "text-gray-500"
                      }`}
                    >
                      {m.desc}
                    </p>
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
