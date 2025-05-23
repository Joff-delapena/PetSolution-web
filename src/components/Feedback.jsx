import React, { useState, useEffect } from "react";

const Feedback = ({ isOpen, onClose, onSubmit, userInfo = {} }) => {
  const [comment, setComment] = useState("");
  const [firstName, setFirstName] = useState(userInfo.firstName || "");
  const [lastName, setLastName] = useState(userInfo.lastName || "");
  const [userId, setUserId] = useState(userInfo.userId || "");

  useEffect(() => {
    if (userInfo) {
      setFirstName(userInfo.firstName || "");
      setLastName(userInfo.lastName || "");
      setUserId(userInfo.userId || "");
    }
  }, [userInfo]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!comment.trim() || !firstName.trim() || !lastName.trim() || !userId.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    const feedbackData = {
      comment,
      firstName,
      lastName,
      userId,
      createdAt: new Date().toISOString(), // optional timestamp
    };

    onSubmit(feedbackData);

    // Reset form fields
    setComment("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md relative">
        <h3 className="text-lg font-semibold mb-4 text-[#FF9500]">Leave a Feedback</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="sr-only">Comment</span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="4"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Write your comment..."
              required
            />
          </label>

          <div className="flex gap-2">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-1/2 border rounded-lg px-3 py-2 text-sm"
              placeholder="First name"
              required
            />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-1/2 border rounded-lg px-3 py-2 text-sm"
              placeholder="Last name"
              required
            />
          </div>

          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="User ID"
            required
          />

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                setComment(""); // clear comment when closing
              }}
              className="px-4 py-2 text-sm bg-gray-300 hover:bg-gray-400 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-[#FF9500] hover:bg-[#e08300] text-white rounded"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
