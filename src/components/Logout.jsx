import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logoutUser = async () => {
      try {
        const user = auth.currentUser;

        if (user) {
          // Set user status to offline in Firestore
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, { isOnline: false });
          console.log("User status updated to offline.");
        }

        // Firebase sign out
        await signOut(auth);
        console.log("Sign out successful!");

        // Redirect to login page (same for user and admin)
        navigate("/login");
      } catch (error) {
        console.error("Error logging out:", error);
      }
    };

    logoutUser();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-semibold text-gray-800">Logging you out...</h1>
    </div>
  );
};

export default Logout;
