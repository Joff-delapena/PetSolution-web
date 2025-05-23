import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
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
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Load cart from localStorage on mount for instant UI
  useEffect(() => {
    const localCart = localStorage.getItem("cart");
    if (localCart) {
      setCartItems(JSON.parse(localCart));
    }
  }, []);

  // Listen to auth state and load cart and orders from Firestore for signed-in users only
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
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
            // Initialize empty cart in Firestore for new user
            await setDoc(cartRef, { items: [] });
            setCartItems([]);
            localStorage.setItem("cart", JSON.stringify([]));
          }

          await fetchOrders(user.uid);
        } else {
          // User signed out - clear all
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

  // Debounced save cart to Firestore when cartItems or userId changes
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
  const addToCart = useCallback(
    async (product) => {
      if (!userId) {
        toast.error("Please sign in to add items to cart.");
        return;
      }
      try {
        const productRef = doc(db, "products", product.id);
        const productSnap = await getDoc(productRef);
        if (!productSnap.exists()) throw new Error("Product not found");
        const stock = productSnap.data().quantity || 0;

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
            if (stock <= 0) {
              toast.error(`${product.name} is out of stock.`);
              return prev;
            }
            return [...prev, { ...product, quantity: 1 }];
          }
        });

        toast.success(`${product.name} added to cart.`);
      } catch (error) {
        console.error("Add to cart Error:", error);
        toast.error(error.message);
      }
    },
    [userId]
  );

  // Remove item from cart
  const removeFromCart = useCallback((id) => {
    setCartItems((prev) => {
      const item = prev.find((item) => item.id === id);
      if (item) toast.info(`${item.name} removed.`);
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  // Update quantity by delta (+1 or -1), checking stock when increasing
  const updateQuantity = useCallback(
    async (id, delta) => {
      if (delta === 0) return;

      setCartItems(async (prev) => {
        const item = prev.find((i) => i.id === id);
        if (!item) return prev;

        let newQty = item.quantity + delta;
        if (newQty < 1) newQty = 0;

        // If increasing quantity, check stock first
        if (delta > 0) {
          try {
            const productRef = doc(db, "products", id);
            const productSnap = await getDoc(productRef);
            if (!productSnap.exists()) {
              toast.error("Product not found");
              return prev;
            }
            const stock = productSnap.data().quantity || 0;
            if (newQty > stock) {
              toast.error(`Only ${stock} ${item.name} left.`);
              return prev;
            }
          } catch (error) {
            toast.error("Failed to check stock.");
            return prev;
          }
        }

        if (newQty === 0) {
          // Remove item
          return prev.filter((i) => i.id !== id);
        } else {
          return prev.map((i) =>
            i.id === id ? { ...i, quantity: newQty } : i
          );
        }
      });
    },
    []
  );

  // Clear entire cart
  const clearCart = useCallback(() => setCartItems([]), []);

  // Checkout selected items
  const checkout = useCallback(
    async (selectedIds) => {
      if (checkoutLoading) return; // Prevent double clicks
      if (!userId || cartItems.length === 0) {
        toast.error("Please sign in and add items to cart.");
        return;
      }

      setCheckoutLoading(true);
      try {
        const selectedItems = cartItems.filter((item) =>
          selectedIds.includes(item.id)
        );

        // Check stock for each item
        for (const item of selectedItems) {
          const productRef = doc(db, "products", item.id);
          const productSnap = await getDoc(productRef);
          if (!productSnap.exists())
            throw new Error(`Product ${item.name} not found`);
          const stock = productSnap.data().quantity || 0;
          if (item.quantity > stock) {
            toast.error(`${item.name} only has ${stock} left.`);
            setCheckoutLoading(false);
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

        // Update stock quantities
        for (const item of selectedItems) {
          const productRef = doc(db, "products", item.id);
          const productSnap = await getDoc(productRef);
          const stock = productSnap.data().quantity || 0;
          await updateDoc(productRef, { quantity: stock - item.quantity });
        }

        // Remove checked out items from cart
        setCartItems((prev) => prev.filter((item) => !selectedIds.includes(item.id)));

        toast.success("Order submitted successfully.");
      } catch (error) {
        console.error("Checkout Error:", error);
        toast.error(error.message || "Something went wrong.");
      } finally {
        setCheckoutLoading(false);
      }
    },
    [cartItems, userId, checkoutLoading]
  );

  // Cancel order and restore stock
  const cancelOrder = useCallback(
    async (order) => {
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
    },
    []
  );

  // Fetch orders of the user
  const fetchOrders = useCallback(async (uid) => {
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
  }, []);

  if (loading) {
    return <div className="p-10 text-center text-xl">Loading your cart...</div>;
  }

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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
