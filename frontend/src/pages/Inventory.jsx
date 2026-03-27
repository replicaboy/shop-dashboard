import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Plus, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({
    name: '',
    costPrice: '',
    sellingPrice: '',
    stockQuantity: ''
  });

  // Backend se saara stock mangwane ka function
  const fetchProducts = async () => {
    try {
      const response = await axios.get('https://shop-dashboard-pi.vercel.app/api/products');
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Products fetch karne me error:", error);
      setLoading(false);
    }
  };

  // Jab page khule toh automatically stock fetch ho jaye
  useEffect(() => {
    fetchProducts();
  }, []);

  // Naya saaman add karne ka function
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://shop-dashboard-pi.vercel.app/api/products/add', newProduct);
      alert("✅ Naya saaman successfully add ho gaya!");
      setNewProduct({ name: '', costPrice: '', sellingPrice: '', stockQuantity: '' }); // Form clear karo
      fetchProducts(); // Table ko update karo
    } catch (error) {
      console.error("Add karne me error:", error);
      alert("❌ Error aayi, backend check karo.");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-6 max-w-6xl mx-auto"
    >
      <div className="flex items-center gap-3 mb-8">
        <Package className="text-brand-600" size={32} />
        <h2 className="text-3xl font-extrabold text-gray-800">Dukaan Ka Stock</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Naya Item Add Karne Ka Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Plus size={20} className="text-green-500" /> Naya Item Jodein
          </h3>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Item ka Naam</label>
              <input 
                required type="text" placeholder="e.g., Aashirvaad Atta 5kg" 
                className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
              />
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Kharid Rate (₹)</label>
                <input 
                  required type="number" placeholder="0.00" 
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  value={newProduct.costPrice} onChange={(e) => setNewProduct({...newProduct, costPrice: e.target.value})}
                />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Bikri Rate (₹)</label>
                <input 
                  required type="number" placeholder="0.00" 
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  value={newProduct.sellingPrice} onChange={(e) => setNewProduct({...newProduct, sellingPrice: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Kitne Piece Aaye? (Stock)</label>
              <input 
                required type="number" placeholder="e.g., 20" 
                className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                value={newProduct.stockQuantity} onChange={(e) => setNewProduct({...newProduct, stockQuantity: e.target.value})}
              />
            </div>
            <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md shadow-brand-200 mt-2">
              Item Add Karein
            </button>
          </form>
        </div>

        {/* Stock List (Table) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">Current Inventory</h3>
            <span className="bg-white px-3 py-1 rounded-full text-sm font-bold text-brand-600 shadow-sm border border-gray-100">
              Total Items: {products.length}
            </span>
          </div>
          
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-gray-500 text-sm border-b border-gray-100 sticky top-0">
                  <th className="p-4 font-semibold">Item Name</th>
                  <th className="p-4 font-semibold">Kharid</th>
                  <th className="p-4 font-semibold">Bikri</th>
                  <th className="p-4 font-semibold">Margin</th>
                  <th className="p-4 font-semibold">Stock</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center p-6 text-gray-500">Loading data...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan="5" className="text-center p-6 text-gray-500">Dukaan me abhi koi saaman nahi hai!</td></tr>
                ) : (
                  products.map((item) => (
                    <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-800">{item.name}</td>
                      <td className="p-4 text-gray-600">₹{item.costPrice}</td>
                      <td className="p-4 font-bold text-gray-800">₹{item.sellingPrice}</td>
                      <td className="p-4">
                        <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-md text-xs font-bold w-fit">
                          <TrendingUp size={12} /> ₹{item.sellingPrice - item.costPrice}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${item.stockQuantity < 5 ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-600'}`}>
                          {item.stockQuantity} pcs
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default Inventory;
