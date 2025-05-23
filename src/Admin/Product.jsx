import React from "react";

const AdminProductSection = ({
  newProduct,
  handleInputChange,
  handleAddProduct,
  products,
  loading,
  handleQuantityChange,
  handleDeleteProduct,
}) => {
  const LOW_STOCK_THRESHOLD = 5; // you can adjust this threshold

  return (
    <>
      {/* Add Product Form */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Add New Product</h2>
        <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {["name", "price", "quantity", "description", "category", "image"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                type={field === "price" || field === "quantity" ? "number" : "text"}
                name={field}
                placeholder={`Enter ${field}`}
                value={newProduct[field]}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
              />
            </div>
          ))}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full p-3 bg-[#FF9500] text-white font-semibold rounded-lg hover:bg-orange-600 transition"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>

      {/* Product List */}
      {loading ? (
        <p className="text-lg text-gray-600">Loading products...</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center hover:shadow-xl transition transform hover:scale-105"
            >
              <img
                src={product.images?.[0] || "https://via.placeholder.com/150"}
                alt={product.name}
                className="w-32 h-32 object-cover rounded-lg mb-4"
              />
              <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
              <div className="text-gray-400 mb-2">Category: {product.category}</div>

              <label className="block text-sm font-medium text-gray-600 mb-1">Stock Quantity</label>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  value={product.quantity}
                  onChange={(e) => handleQuantityChange(product.id, e)}
                  className="w-16 p-2 text-center border border-gray-300 rounded focus:outline-none"
                  min="0"
                />
                <button
                  className="bg-red-200 text-gray-800 px-3 py-1 rounded hover:bg-red-100"
                  onClick={() => {
                    const newQty = Math.max(product.quantity - 1, 0);
                    handleQuantityChange(product.id, { target: { value: newQty } });
                  }}
                >
                  −
                </button>
                <button
                  className="bg-green-200 text-gray-800 px-3 py-1 rounded hover:bg-green-100"
                  onClick={() => {
                    const newQty = product.quantity + 1;
                    handleQuantityChange(product.id, { target: { value: newQty } });
                  }}
                >
                  +
                </button>
              </div>

              {/* Stock warnings */}
              {product.quantity === 0 ? (
                <p className="mt-2 text-sm text-red-700 font-bold">❌ Out of stock!</p>
              ) : product.quantity <= LOW_STOCK_THRESHOLD ? (
                <p className="mt-2 text-sm text-yellow-600 font-semibold">
                  ⚠️ Low stock! Only {product.quantity} left.
                </p>
              ) : null}

              <button
                onClick={() => handleDeleteProduct(product.id)}
                className="mt-3 text-sm bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Delete Product
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default AdminProductSection;
