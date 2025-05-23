import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

const adminEmails = [
  "admin@example.com",
  "carlpdaguinotas@gmail.com", // your admin emails
];

export default function PrivateRoute({ children }) {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isAdminRoute = window.location.pathname.startsWith("/admin");
  const isAdmin = adminEmails.includes(user.email);

  // If accessing /admin and not admin, redirect to /shop
  if (isAdminRoute && !isAdmin) {
    return <Navigate to="/shop" replace />;
  }

  return children;
}
