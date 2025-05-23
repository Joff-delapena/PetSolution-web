import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductDetail from "./pages/ProductDetail";
import Payment from "./pages/Payment";
import ThankYou from "./pages/ThankYou";
import PurchaseHistory from "./pages/PurchaseHistory";
import Feedback from "./components/Feedback";

import AdminOrders from "./Admin/AdminOrders"; 
import Profile from "./Admin/Profile";
import AdminDashboard from "./Admin/Dashboard";
import Product from "./Admin/Product";
import Users from "./Admin/Users";
import FeedbackList from "./Admin/FeedbackList";

import { CartProvider } from "./Context/CartContext";
import PrivateRoute from "./components/PrivateRoute";
import Logout from "./components/Logout";

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/thankyou" element={<ThankYou />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/purchase-history" element={<PurchaseHistory />} />
          <Route path="/feedback" element={<Feedback />} />

        
          {/* Admin-only routes */}
          <Route
            path="/admin"
            element={
              <PrivateRoute adminOnly={true}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <PrivateRoute adminOnly={true}>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <PrivateRoute adminOnly={true}>
                <Product />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute adminOnly={true}>
                <Users />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <PrivateRoute adminOnly={true}>
                <AdminOrders />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/feedback"
            element={
              <PrivateRoute adminOnly={true}>
                <FeedbackList />
              </PrivateRoute>
            }
          />

          {/* 404 fallback */}
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
