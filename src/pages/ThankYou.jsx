import { Link } from "react-router-dom";

export default function ThankYou() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#f9fafb] text-center px-4">
      <h1 className="text-4xl font-bold text-[#FF9500] mb-4">🎉 Thank You!</h1>
      <p className="text-lg text-gray-700 mb-6">
        Your order has been placed successfully.
      </p>
      <Link
        to="/shop"  // Updated to redirect to the Shop page
        className="px-6 py-3 bg-[#FF9500] text-white rounded-lg font-semibold hover:bg-orange-600"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
