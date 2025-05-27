// src/index.js or src/main.jsx (depending on your setup)
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { CartProvider } from './Context/cartContext'; // fixed casing in import path
import { AuthProvider } from './Context/AuthContext'; // fixed casing in import path

// Create root using React 18 API
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);
