import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ProductDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-600">No product selected.</p>
      </div>
    );
  }

  const { id, name, images, description, price, quantity } = state;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 text-indigo-500 hover:text-indigo-700 font-semibold flex items-center"
        >
          ← Back
        </button>

        <div className="flex flex-col md:flex-row bg-white shadow-md rounded-lg overflow-hidden">
          {/* Product Image */}
          <div className="md:w-1/2 p-4">
            <img
              src={
                images && images.length > 0
                  ? images[0]
                  : "https://via.placeholder.com/400"
              }
              alt={name}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>

          {/* Product Info */}
          <div className="md:w-1/2 p-6 flex flex-col">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{name}</h1>
            <p className="text-emerald-600 font-semibold text-2xl mb-4">₱{(parseFloat(price) || 0).toFixed(2)}</p>

            <p className="text-gray-600 mb-6">{description}</p>

            <div className="mb-6">
              <span className="text-gray-500">Available Stock:</span>
              <span className="text-gray-800 font-bold ml-2">{quantity}</span>
            </div>

            <button className="px-6 py-3 bg-gradient-to-r from-green-400 to-green-600 text-white font-bold rounded-full hover:opacity-90 transition">
              Add to Cart
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
