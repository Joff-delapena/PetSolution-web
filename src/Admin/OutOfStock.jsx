// src/Admin/OutOfStockProducts.jsx
import React from "react";

const OutOfStockProducts = ({ products }) => {
  const outOfStockProducts = products.filter((product) => product.quantity === 0);

  return (
    <section>
      <h2 className="text-3xl font-extrabold text-[#FF9500] mb-8">Out of Stock Products</h2>
      {outOfStockProducts.length === 0 ? (
        <p className="text-gray-600 text-lg">All products are currently in stock.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {outOfStockProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow p-5 flex flex-col">
              {/* Image container with fixed height and responsive width */}
              <div className="w-full h-48 overflow-hidden rounded-lg mb-4 flex-shrink-0">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <h3 className="text-xl font-bold">{product.name}</h3>
              <p className="text-gray-600 flex-grow">{product.description}</p>
              <p className="text-red-600 font-semibold mt-2">Out of Stock</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default OutOfStockProducts;
