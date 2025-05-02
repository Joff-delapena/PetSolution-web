// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductDetail from "./pages/ProductDetail";
import Shop from "./pages/Shop";
import CheckOut from "./pages/CheckOut";
import Payment from "./pages/Payment";
import ThankYou from "./pages/ThankYou";
import {CartProvider} from "./context/CartContext";
import Logout from "./components/Logout";

function App() {
  return (
    <CartProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<CheckOut />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/thankyou" element={<ThankYou />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/logout" element={<Logout />} />
        <Route
          path="*"
          element={
            <div className="p-10 text-center">
              <h2 className="text-2xl">404: Page not found</h2>
            </div>
          }
        />
      </Routes>
    </Router>
    </CartProvider>
  );
}

export default App;
