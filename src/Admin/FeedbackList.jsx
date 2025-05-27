// import React, { useState } from "react";
// import { collection, addDoc, serverTimestamp } from "firebase/firestore";
// import { db } from "../firebase";

// export default function UserFeedbackForm({ userEmail, productId }) {
//   const [message, setMessage] = useState("");
//   const [success, setSuccess] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!message.trim()) return;

//     try {
//       await addDoc(collection(db, "feedback"), {
//         message: message.trim(),
//         userEmail: userEmail || "Anonymous",
//         productId: productId || "Unknown",
//         createdAt: serverTimestamp(),
//         adminReply: "",
//       });

//       setMessage("");
//       setSuccess(true);
//       setTimeout(() => setSuccess(false), 3000); // hide after 3s
//     } catch (error) {
//       console.error("Error submitting feedback:", error);
//     }
//   };

//   return (
//     <div className="bg-white shadow-md rounded p-6 max-w-md mx-auto mt-6">
//       <h3 className="text-xl font-semibold text-gray-700 mb-4">
//         Leave a Product Review
//       </h3>
//       {success && (
//         <p className="mb-3 text-green-600 font-medium">
//           Feedback submitted successfully!
//         </p>
//       )}
//       <form onSubmit={handleSubmit}>
//         <textarea
//           rows={4}
//           className="w-full p-3 border rounded mb-3"
//           placeholder="Write your feedback here..."
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//         />
//         <button
//           type="submit"
//           className="bg-[#FF9500] hover:bg-[#e08300] text-white px-4 py-2 rounded"
//         >
//           Submit Feedback
//         </button>
//       </form>
//     </div>
//   );
// }
