import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductDetail from './pages/productDetail';
import Shop from './pages/Shop';
import CheckOut from './pages/CheckOut';
import Payment from "./pages/Payment";
import ThankYou from "./pages/ThankYou";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/productDetail" element={<ProductDetail />} />
        <Route path="/Shop" element={<Shop />} />
        <Route path="/CheckOut" element={<CheckOut />} />
        <Route path="/Payment" element={<Payment />} />
        <Route path="/thankyou" element={<ThankYou />} />

      </Routes>
    </Router>
  );
}

export default App;
