import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Payment = () => {
  const navigate = useNavigate();
  const { cart, clearCart, removeFromCart } = useCart();
  const [checkoutProduct, setCheckoutProduct] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("creditCard");

  useEffect(() => {
    const selectedItems = localStorage.getItem("selectedCartItems");
    if (selectedItems) {
      setCheckoutProduct(JSON.parse(selectedItems));
    }
  }, []);

  const handlePayment = () => {
    setIsProcessing(true);

    setTimeout(() => {
      if (checkoutProduct && Array.isArray(checkoutProduct)) {
        checkoutProduct.forEach((item) => {
          removeFromCart(item.id);
        });
      } else {
        clearCart();
      }

      localStorage.removeItem("selectedCartItems");
      navigate("/thankyou");
    }, 2000);
  };

  const getTotal = () => {
    return checkoutProduct
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
      .toFixed(2);
  };

  const methods = [
    {
      id: "creditCard",
      label: "Credit Card",
      description: "Visa, MasterCard, etc.",
    },
    {
      id: "paypal",
      label: "PayPal",
      description: "Pay securely with PayPal",
    },
    {
      id: "gcash",
      label: "GCash",
      description: "Pay using your GCash account",
    },
    {
      id: "cod",
      label: "Cash on Delivery",
      description: "Pay when your order arrives",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-center text-[#FF9500] mb-8">
        Secure Payment
      </h2>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-lg mb-4 text-gray-700">
          You are about to pay for the following items:
        </p>

        {/* Item Summary */}
        {checkoutProduct.length > 0 ? (
          <div className="space-y-4 mb-6">
            {checkoutProduct.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b pb-2"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.images?.[0] || "/placeholder.png"}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800">{item.name}</h4>
                    <p className="text-sm text-gray-600">
                      ₱{item.price} x {item.quantity}
                    </p>
                  </div>
                </div>
                <div className="font-bold text-gray-800">
                  ₱{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mb-6">No items selected.</p>
        )}

        {/* Total */}
        <div className="text-3xl font-bold text-[#FF9500] mb-6">
          Total: ₱{getTotal()}
        </div>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">
            Choose Your Payment Method
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {methods.map((method) => (
              <div
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`cursor-pointer py-4 px-6 rounded-xl border-2 text-center transition-all duration-300 ease-in-out transform hover:scale-105 ${
                  paymentMethod === method.id
                    ? "border-[#FF9500] bg-orange-50"
                    : "border-gray-300 bg-white"
                }`}
              >
                <h4 className="text-lg font-medium text-gray-800">
                  {method.label}
                </h4>
                <p className="text-sm text-gray-500">{method.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Button */}
        <div className="mt-8">
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className={`w-full py-4 text-white rounded-xl font-semibold ${
              isProcessing
                ? "bg-gray-400"
                : "bg-[#FF9500] hover:bg-orange-600"
            }`}
          >
            {isProcessing
              ? `Processing ${paymentMethod === "cod" ? "Order" : "Payment"}...`
              : paymentMethod === "cod"
              ? "Place Order"
              : "Pay Now"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
