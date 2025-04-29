import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaShoppingCart, FaStore, FaSearch, FaHome } from "react-icons/fa"; // Added FaHome for the Home icon
import { useCart } from "../context/CartContext";

const Header = () => {
  const { cartQuantity, notification } = useCart();
  const [searchQuery, setSearchQuery] = useState("");

  // Handle search action (you can customize this to trigger a search in your app)
  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  return (
    <header className="bg-[#FF9500] py-3 relative">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-4">
        {/* Logo and Search Bar Section */}
        <div className="flex items-center space-x-4 flex-1">
          {/* Logo */}
          <img
            src="/Images/Logo/Logo.png" // Fixed image path
            alt="Logo"
            className="h-14 w-auto"
          />

          {/* Search Bar next to Logo */}
          <form onSubmit={handleSearch} className="flex items-center w-full max-w-lg">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="px-4 py-2 rounded-l-lg bg-white border-2 border-white focus:outline-none w-full"
            />
            <button
              type="submit"
              className="bg-white text-[#000] p-3 rounded-r-lg flex items-center justify-center"
            >
              <FaSearch className="text-xl" />
            </button>
          </form>
        </div>

        {/* Navigation Links (Centered) */}
        <nav className="flex justify-center flex-1 space-x-12">
          <ul className="flex space-x-12">
            <li>
              <Link to="/" className="text-black text-lg hover:text-gray-200 flex items-center">
                <FaHome className="text-white text-2xl mr-2" /> {/* Home icon */}
                Home
              </Link>
            </li>
            <li className="flex items-center">
              <Link to="/shop" className="text-black text-lg hover:text-gray-200 flex items-center">
                <FaStore className="text-white text-2xl mr-2" /> {/* Store icon for Shop */}
                Shop
              </Link>
            </li>
            <li className="relative flex items-center">
              <Link
                to="/cart"
                className="text-black text-lg hover:text-gray-200 flex items-center"
              >
                <FaShoppingCart className="text-white text-2xl mr-2" /> {/* Cart icon */}
                Cart
              </Link>
              {cartQuantity > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartQuantity}
                </span>
              )}
            </li>
          </ul>
        </nav>
      </div>

      {/* Notification */}
      {notification && (
        <div className="fixed top-16 right-6 bg-green-500 text-white px-4 py-2 rounded-md shadow-md z-50">
          {notification}
        </div>
      )}
    </header>
  );
};

export default Header;
