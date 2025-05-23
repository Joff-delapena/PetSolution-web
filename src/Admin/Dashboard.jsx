import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import AdminProductSection from "../Admin/Product";
import Users from "./Users";
import AdminOrders from "./AdminOrders";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  addDoc,
  query,
  where,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Menu, X } from "lucide-react";

const sidebarItems = [
  { id: "dashboard", label: "Dashboard" },
  { id: "products", label: "Products" },
  { id: "users", label: "Users" },
  { id: "orders", label: "Orders" },
  { id: "Feedback", label: "Feedback" },
];

const Admin = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggedInUsers, setLoggedInUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    quantity: "",
    description: "",
    category: "",
    image: "",
  });

  // Fetch products from Firestore
  const fetchProducts = async () => {
    try {
      const snapshot = await getDocs(collection(db, "products"));
      const productsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // Subscribe to users who are currently logged in (isOnline == true)
  const fetchLoggedInUsers = () => {
    const q = query(collection(db, "users"), where("isOnline", "==", true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLoggedInUsers(usersData);
    });
    return unsubscribe;
  };

  useEffect(() => {
    fetchProducts();
    const unsubscribe = fetchLoggedInUsers();
    return () => unsubscribe();
  }, []);

  const totalProducts = products.length;
  const outOfStock = products.filter((p) => p.quantity === 0).length;
  const totalStock = products.reduce((sum, p) => sum + (p.quantity || 0), 0);

  const handleLogout = async () => {
    try {
      // OPTIONAL: Update user status before signing out
      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, { isOnline: false, lastActive: serverTimestamp() });
      }

      await signOut(auth);
      window.location.href = "/";
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 bg-[#FF9500] text-white w-64 p-6 flex flex-col justify-between transform transition-transform duration-300 z-50
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div>
          <h2 className="text-3xl font-extrabold mb-10">Admin Panel</h2>
          <nav>
            <ul className="space-y-4">
              {sidebarItems.map(({ id, label }) => (
                <li key={id}>
                  <button
                    className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-colors 
                      ${activeSection === id ? "bg-white text-[#FF9500]" : "hover:bg-white hover:text-[#FF9500]"}`}
                    onClick={() => setActiveSection(id)}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div>
          <button
            onClick={handleLogout}
            className="w-full bg-white text-[#FF9500] font-bold py-3 rounded-lg hover:bg-gray-200 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Header */}
        <header className="flex items-center justify-between bg-white shadow px-6 py-4 sticky top-0 z-10">
          <button
            className="md:hidden text-[#FF9500]"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
          <h1 className="text-2xl font-bold text-[#FF9500]">
            {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
          </h1>
          <div></div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-8">
          {activeSection === "dashboard" && (
            <section>
              <h2 className="text-3xl font-extrabold text-[#FF9500] mb-8">Dashboard Overview</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                  <p className="text-lg font-semibold text-gray-600 mb-2">Total Products</p>
                  <p className="text-4xl font-bold text-[#FF9500]">{totalProducts}</p>
                </div>

                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                  <p className="text-lg font-semibold text-gray-600 mb-2">Out of Stock</p>
                  <p className="text-4xl font-bold text-red-600">{outOfStock}</p>
                </div>

                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                  <p className="text-lg font-semibold text-gray-600 mb-2">Users Logged In</p>
                  <p className="text-4xl font-bold text-green-600">{loggedInUsers.length}</p>
                </div>

                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                  <p className="text-lg font-semibold text-gray-600 mb-2">Total Stock</p>
                  <p className="text-4xl font-bold text-purple-600">{totalStock}</p>
                </div>
              </div>
            </section>
          )}

          {activeSection === "products" && (
            <AdminProductSection
              newProduct={newProduct}
              handleInputChange={(e) => {
                const { name, value } = e.target;
                setNewProduct((prev) => ({ ...prev, [name]: value }));
              }}
              handleAddProduct={async (e) => {
                e.preventDefault();
                const { name, price, quantity, description, category, image } = newProduct;

                if (!name || !price || !quantity || !description || !category || !image) {
                  alert("Please fill in all fields.");
                  return;
                }

                try {
                  await addDoc(collection(db, "products"), {
                    name,
                    price: parseFloat(price),
                    quantity: parseInt(quantity),
                    description,
                    category,
                    images: [image],
                    createdAt: serverTimestamp(),
                  });
                  setNewProduct({
                    name: "",
                    price: "",
                    quantity: "",
                    description: "",
                    category: "",
                    image: "",
                  });
                  fetchProducts();
                } catch (err) {
                  console.error("Error adding product:", err);
                }
              }}
              products={products}
              loading={loading}
              handleQuantityChange={async (id, e) => {
                const { value } = e.target;
                if (isNaN(value) || value < 0) return;

                const updatedProducts = products.map((product) =>
                  product.id === id ? { ...product, quantity: parseInt(value) } : product
                );

                setProducts(updatedProducts);

                const product = updatedProducts.find((product) => product.id === id);
                if (product) {
                  const productRef = doc(db, "products", id);
                  try {
                    await updateDoc(productRef, { quantity: product.quantity });
                  } catch (err) {
                    console.error("Error updating stock:", err);
                  }
                }
              }}
              handleDeleteProduct={async (id) => {
                if (!window.confirm("Are you sure you want to delete this product?")) return;
                try {
                  await deleteDoc(doc(db, "products", id));
                  fetchProducts();
                } catch (err) {
                  console.error("Error deleting product:", err);
                }
              }}
            />
          )}

          {/* Pass loggedInUsers here */}
          {activeSection === "users" && <Users loggedInUsers={loggedInUsers} />}

          {activeSection === "orders" && <AdminOrders />}

          {activeSection === "Feedback" && (
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-2xl font-bold mb-4">Feedback Section</h2>
              {/* Feedback content */}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Admin;
