import React, { createContext, useContext, useState, useEffect } from "react";

// Create the CartContext
const CartContext = createContext();

// Export custom hook to access cart
export const useCart = () => useContext(CartContext);

// CartProvider component
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Load cart from localStorage on initial load
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
  setCart((prevCart) => {
    const existingItem = prevCart.find((item) => item.id === product.id);

    if (existingItem) {
      // If the item exists, increase the quantity
      return prevCart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      // If the item does not exist, add it with quantity 1
      return [...prevCart, { ...product, quantity: 1 }];
    }
  });
};

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // Decrease quantity or remove item if quantity reaches 0
  const decreaseQuantity = (productId) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 } // Decrease the quantity
            : item
        )
        .filter((item) => item.quantity > 0) // Remove the item if quantity <= 0
    );
  };

  // Calculate the total quantity of items in the cart
  const cartQuantity = cart.reduce((total, item) => total + item.quantity, 0);

  // Calculate the total price of items in the cart
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        cartQuantity,
        cartTotal,
        addToCart,
        removeFromCart,
        decreaseQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
