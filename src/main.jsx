import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Make sure this contains your global styles
import App from './App'; // Entry point for the app
import { CartProvider } from './context/CartContext'; // Ensure CartContext is properly imported

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    
    <CartProvider> {/* CartProvider is wrapped around App to make cart context accessible throughout */}
      <App />
    </CartProvider>
  </React.StrictMode>
);
