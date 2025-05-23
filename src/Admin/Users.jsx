import React from "react";

const Users = ({ loggedInUsers }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Logged-in Users</h2>
      {loggedInUsers.length === 0 ? (
        <p>No users are currently logged in.</p>
      ) : (
        <ul>
          {loggedInUsers.map((user, index) => (
            <li key={index} className="mb-2">
              <strong>{user.username || "User"}:</strong> {user.email || "No email"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Users;
