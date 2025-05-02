import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaStore, FaHome } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const Header = () => {
  const navigate = useNavigate();
  const { cartItems, notification } = useCart();
  const uniqueProductCount = cartItems.length;
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async (e) => {
    e.preventDefault();
    setIsLoggingOut(true);

    try {
      // Optional: short delay for animation effect
      await new Promise(resolve => setTimeout(resolve, 1000));
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out: ", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-[#FF9500] py-3 relative">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-4">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <img
            src="/Images/Logo/Logo.png"
            alt="Logo"
            className="h-14 w-auto"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex justify-center">
          <ul className="flex space-x-12 items-center">
            <li>
              <Link
                to="/"
                className="text-white text-lg hover:text-gray-200 flex items-center"
              >
                <FaHome className="mr-2" /> Home
              </Link>
            </li>
            <li>
              <Link
                to="/shop"
                className="text-white text-lg hover:text-gray-200 flex items-center"
              >
                <FaStore className="mr-2" /> Shop
              </Link>
            </li>
            <li className="relative">
              <Link
                to="/cart"
                className="text-white text-lg hover:text-gray-200 flex items-center"
              >
                <FaShoppingCart className="mr-2" /> Cart
              </Link>
              {uniqueProductCount > 0 && (
                <span className="absolute bottom-4 right-7 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {uniqueProductCount}
                </span>
              )}
            </li>

            <li>
              {isLoggingOut ? (
                <div className="flex items-center gap-2 text-white">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Logging out...</span>
                </div>
              ) : (
                <a
                  href="/login"
                  onClick={handleLogout}
                  className="text-white text-lg hover:text-gray-200"
                >
                  Logout
                </a>
              )}
            </li>
          </ul>
        </nav>
      </div>

      {notification && (
        <div className="fixed top-16 right-6 bg-green-500 text-white px-4 py-2 rounded-md shadow-md z-50">
          {notification}
        </div>
      )}
    </header>
  );
};

export default Header;
