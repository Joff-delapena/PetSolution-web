// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  increment,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "react-toastify";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load cart from localStorage on mount for instant UI
  useEffect(() => {
    const localCart = localStorage.getItem("cart");
    if (localCart) {
      setCartItems(JSON.parse(localCart));
    }
  }, []);

  // Listen to auth state and load cart from Firestore for signed in users only
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setUserId(user.uid);
          const cartRef = doc(db, "carts", user.uid);
          const cartDoc = await getDoc(cartRef);
          if (cartDoc.exists()) {
            const firestoreCart = cartDoc.data().items || [];
            setCartItems(firestoreCart);
            localStorage.setItem("cart", JSON.stringify(firestoreCart));
          } else {
            await setDoc(cartRef, { items: [] });
            setCartItems([]);
            localStorage.setItem("cart", JSON.stringify([]));
          }
          fetchOrders(user.uid);
        } else {
          setUserId(null);
          setCartItems([]);
          setOrders([]);
          localStorage.removeItem("cart");
        }
      } catch (error) {
        console.error("Auth/Cart fetch error:", error);
        toast.error(`Something went wrong loading your cart: ${error.message}`);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Save cart to Firestore when cartItems or userId changes (debounced)
  useEffect(() => {
    if (!userId) return;
    const timeout = setTimeout(async () => {
      try {
        const cartRef = doc(db, "carts", userId);
        await updateDoc(cartRef, { items: cartItems });
      } catch (error) {
        console.error("Failed to save cart to Firestore:", error);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [cartItems, userId]);

  // Sync cart to localStorage on every cart change
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Add item to cart with stock check
  const addToCart = async (product) => {
    if (!userId) {
      toast.error("Please sign in to add items to cart.");
      return;
    }
    try {
      const productRef = doc(db, "products", product.id);
      const productSnap = await getDoc(productRef);
      if (!productSnap.exists()) throw new Error("Product not found");
      const stock = productSnap.data().quantity || 0;
      if (stock <= 0) {
        toast.error(`${product.name} is out of stock.`);
        return;
      }
      setCartItems((prev) => {
        const existing = prev.find((item) => item.id === product.id);
        if (existing) {
          if (existing.quantity + 1 > stock) {
            toast.error(`Only ${stock} ${product.name} left.`);
            return prev;
          }
          return prev.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          return [...prev, { ...product, quantity: 1 }];
        }
      });
      toast.success(`${product.name} added to cart.`);
    } catch (error) {
      console.error("Add to cart Error:", error);
      toast.error(error.message);
    }
  };

  // Remove item from cart
  const removeFromCart = (id) => {
    setCartItems((prev) => {
      const item = prev.find((item) => item.id === id);
      if (item) toast.info(`${item.name} removed.`);
      return prev.filter((item) => item.id !== id);
    });
  };

  // Update quantity by delta (+1 or -1)
  const updateQuantity = (id, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            if (newQty < 1) return null;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // Clear entire cart
  const clearCart = () => setCartItems([]);

  // Checkout selected items
  const checkout = async (selectedIds) => {
    if (!userId || cartItems.length === 0) {
      toast.error("Please sign in and add items to cart.");
      return;
    }
    try {
      const selectedItems = cartItems.filter((item) =>
        selectedIds.includes(item.id)
      );  

      for (const item of selectedItems) {
        const productRef = doc(db, "products", item.id);
        const productSnap = await getDoc(productRef);
        if (!productSnap.exists())
          throw new Error(`Product ${item.name} not found`);
        const stock = productSnap.data().quantity || 0;
        if (item.quantity > stock) {
          toast.error(`${item.name} only has ${stock} left.`);
          return;
        }
      }

      const total = selectedItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      const order = {
        userId,
        items: selectedItems,
        total,
        createdAt: serverTimestamp(),
        status: "Pending",
      };

      await addDoc(collection(db, "orders"), order);

      for (const item of selectedItems) {
        const productRef = doc(db, "products", item.id);
        const productSnap = await getDoc(productRef);
        const stock = productSnap.data().quantity || 0;
        await updateDoc(productRef, { quantity: stock - item.quantity });
      }

      setCartItems((prev) => prev.filter((item) => !selectedIds.includes(item.id)));

      toast.success("Order submitted successfully.");
    } catch (error) {
      console.error("Checkout Error:", error);
      toast.error(error.message || "Something went wrong.");
    }
  };

  // Cancel order and restore stock
  const cancelOrder = async (order) => {
    try {
      const orderRef = doc(db, "orders", order.id);
      const orderSnap = await getDoc(orderRef);
      if (!orderSnap.exists()) return;
      if (order.status === "Cancelled") return;

      for (const item of order.items) {
        const productRef = doc(db, "products", item.id);
        await updateDoc(productRef, {
          quantity: increment(item.quantity),
        });
      }

      await updateDoc(orderRef, { status: "Cancelled" });
      await fetchOrders(order.userId);
      toast.info("Order cancelled.");
    } catch (error) {
      console.error("Failed to cancel order:", error.message);
      toast.error("Failed to cancel order.");
    }
  };

  // Fetch orders of the user
  const fetchOrders = async (uid) => {
    try {
      const ordersRef = collection(db, "orders");
      const q = query(ordersRef, where("userId", "==", uid));
      const snapshot = await getDocs(q);
      const userOrders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(userOrders);
    } catch (error) {
      console.error("Failed to fetch orders:", error.message);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        checkout,
        cancelOrder,
        fetchOrders,
        orders,
        loading,
        userId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
