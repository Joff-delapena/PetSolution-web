import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../firebase';
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
} from 'firebase/firestore';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { toast } from 'react-toastify';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const storedCart = localStorage.getItem('cartItems');
    return storedCart ? JSON.parse(storedCart) : [];
  });
  const [orders, setOrders] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const cartRef = doc(db, 'carts', user.uid);
        const cartDoc = await getDoc(cartRef);
        if (cartDoc.exists()) {
          const firestoreCart = cartDoc.data().items || [];
          setCartItems(firestoreCart);
        } else {
          await setDoc(cartRef, { items: [] });
        }
      } else {
        // Sign in anonymously if not authenticated
        await signInAnonymously(auth);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const saveCart = async () => {
      try {
        const cartRef = doc(db, 'carts', userId);
        await updateDoc(cartRef, { items: cartItems });
      } catch (error) {
        console.error('Failed to save cart to Firestore', error);
      }
    };

    saveCart();
  }, [cartItems, userId]);

  const addToCart = async (product) => {
    try {
      const productRef = doc(db, 'products', product.id);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) throw new Error('Product not found');

      const stock = productSnap.data().quantity || 0;
      if (stock <= 0) {
        toast.error(`${product.name} is out of stock.`);
        return;
      }

      setCartItems((prev) => {
        const existing = prev.find((item) => item.id === product.id);
        let updatedCart;

        if (existing) {
          if (existing.quantity + 1 > stock) {
            toast.error(`Only ${stock} ${product.name} left.`);
            return prev;
          }

          updatedCart = prev.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          updatedCart = [...prev, { ...product, quantity: 1 }];
        }

        toast.success(`${product.name} has been added to cart.`);
        return updatedCart;
      });
    } catch (error) {
      console.error('Add to Cart Error', error);
      toast.error(error.message);
    }
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => {
      const item = prev.find((item) => item.id === id);
      if (item) toast.info(`${item.name} has been removed.`);
      return prev.filter((item) => item.id !== id);
    });
  };

  const clearCart = () => setCartItems([]);

  const checkout = async () => {
    if (!userId || cartItems.length === 0) {
      toast.error('Please sign in and add items to cart.');
      return;
    }

    try {
      for (const item of cartItems) {
        const productRef = doc(db, 'products', item.id);
        const productSnap = await getDoc(productRef);

        if (!productSnap.exists()) throw new Error(`Product ${item.name} not found`);
        const stock = productSnap.data().quantity || 0;

        if (item.quantity > stock) {
          toast.error(`${item.name} has only ${stock} left in stock.`);
          return;
        }
      }

      const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
      const order = {
        userId,
        items: cartItems,
        total,
        createdAt: serverTimestamp(),
        status: 'Pending',
      };

      await addDoc(collection(db, 'orders'), order);

      for (const item of cartItems) {
        const productRef = doc(db, 'products', item.id);
        const productSnap = await getDoc(productRef);
        const stock = productSnap.data().quantity || 0;
        await updateDoc(productRef, { quantity: stock - item.quantity });
      }

      clearCart();
      toast.success('Your order has been submitted successfully.');
    } catch (error) {
      console.error('Checkout Error:', error);
      toast.error(error.message || 'Something went wrong.');
    }
  };

  const cancelOrder = async (order) => {
    try {
      const orderRef = doc(db, 'orders', order.id);
      const orderSnap = await getDoc(orderRef);
      if (!orderSnap.exists()) return;

      if (order.status === 'Cancelled') return;

      for (const item of order.items) {
        const productRef = doc(db, 'products', item.id);
        await updateDoc(productRef, {
          quantity: increment(item.quantity),
        });
      }

      await updateDoc(orderRef, { status: 'Cancelled' });
      fetchOrders(order.userId);
    } catch (error) {
      console.error('Failed to cancel order:', error.message);
    }
  };

  const fetchOrders = async (uid) => {
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('userId', '==', uid));
      const snapshot = await getDocs(q);
      const userOrders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOrders(userOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error.message);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        checkout,
        cancelOrder,
        fetchOrders,
        orders,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
