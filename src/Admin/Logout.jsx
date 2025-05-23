// src/Admin/Logout.jsx
import React, { useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const doLogout = async () => {
      try {
        await signOut(auth);
        // Optional: You can clear any localStorage/session data here
        navigate("/login");
      } catch (error) {
        console.error("Logout failed:", error);
      }
    };

    doLogout();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Logging out...</h2>
        <p>Please wait while we sign you out.</p>
      </div>
    </div>
  );
};

export default Logout;
