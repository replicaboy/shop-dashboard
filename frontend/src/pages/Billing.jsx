import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react'; // QR Code ke liye
import { ReceiptText, ShoppingCart, Plus, Minus, Trash2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE = 'https://shop-dashboard-pi.vercel.app/api';

const Billing = () => {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  
  // Bill Settings
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [billGenerated, setBillGenerated] = useState(false);
  const [finalAmount, setFinalAmount] = useState(0);

  // Data Fetch Karna
  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await axios.get(`${API_BASE}/products`);
        setProducts(prodRes.data);
        const custRes = await axios.get(`${API_BASE}/customers`);
        setCustomers(custRes.data);
      } catch (error) {
        console.error("Data laane me error:", error);
      }
    };
    fetchData();
  }, []);

  // Cart me saaman add karna
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.productId === product._id);
    if (existingItem) {
      setCart(cart.map(item => item.productId === product._id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { productId: product._id, name: product.name, price: product.sellingPrice, quantity: 1 }]);
    }
  };

  // Cart se quantity kam karna ya hatana
  const updateQuantity = (productId, delta) => {
    setCart(cart.map(item => {
      if (item.productId === productId) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  // Total Amount Calculate karna
  const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Final Bill Generate Karna (API Call)
  const handleGenerateBill = async () => {
    if (cart.length === 0) return alert("Pehle saaman to select karo!");
    if (paymentMode === 'Udhaar' && !selectedCustomer) return alert("Udhaar ke liye Grahak chunna zaroori hai!");

    try {
      const payload = {
        customer: selectedCustomer || null,
        items: cart,
        totalAmount: totalAmount,
        paymentMode: paymentMode
      };

      await axios.post(`${API_BASE}/bills/create`, payload);
      setFinalAmount(totalAmount);
      setBillGenerated(true);
      
      // Stock update dikhane ke liye products wapas fetch karlo
      const prodRes = await axios.get(`${API_BASE}/products`);
      setProducts(prodRes.data);

    } catch (error) {
      alert("❌ Bill banane me error aayi.");
    }
  };

  // Naya Bill banane ke liye reset karna
  const resetBill = () => {
    setCart([]);
    setSelectedCustomer('');
    setPaymentMode('Cash');
    setBillGenerated(false);
    setFinalAmount(0);
  };

  // UPI QR Code URL (Gopal Ji ke UPI ID par)
  const upiUrl = `upi://pay?pa=9263613438@ybl&pn=Gopal%20Ji%20Store&am=${finalAmount}&cu=INR`;

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <ReceiptText className="text-brand-600" size={32} />
        <h2 className="text-3xl font-extrabold text-gray-800">Naya Bill Banao (POS)</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Product Selection & Settings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Bill Settings (Customer & Payment) */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-bold text-gray-600 mb-2">Grahak (Optional)</label>
              <select 
                className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-brand-500 bg-gray-50"
                value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}
              >
                <option value="">-- Chillar Grahak (Walk-in) --</option>
                {customers.map(c => <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>)}
              </select>
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-bold text-gray-600 mb-2">Payment Mode</label>
              <div className="flex gap-2">
                {['Cash', 'UPI', 'Udhaar'].map(mode => (
                  <button 
                    key={mode} 
                    onClick={() => setPaymentMode(mode)}
                    className={`flex-1 py-3 rounded-xl font-bold border transition-all ${paymentMode === mode ? 'bg-brand-600 text-white border-brand-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 h-[500px] overflow-y-auto">
            <h3 className="font-bold text-gray-800 mb-4 text-lg">Dukaan Ka Saaman (Click to add)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map(product => (
                <div 
                  key={product._id} 
                  onClick={() => product.stockQuantity > 0 ? addToCart(product) : null}
                  className={`p-4 border rounded-xl cursor-pointer transition-all ${product.stockQuantity > 0 ? 'border-gray-200 hover:border-brand-500 hover:shadow-md bg-white' : 'border-red-100 bg-red-50 opacity-60 cursor-not-allowed'}`}
                >
                  <div className="font-bold text-gray-800 truncate">{product.name}</div>
                  <div className="text-brand-600 font-extrabold mt-1">₹{product.sellingPrice}</div>
                  <div className="text-xs text-gray-500 mt-2 font-medium">Stock: {product.stockQuantity}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: The Receipt / Cart */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 h-fit flex flex-col overflow-hidden relative">
          
          {/* Success Overlay (Jab bill generate ho jaye) */}
          {billGenerated && (
            <div className="absolute inset-0 bg-white z-10 flex flex-col items-center justify-center p-6 text-center">
              <CheckCircle2 size={60} className="text-green-500 mb-4" />
              <h3 className="text-2xl font-black text-gray-800">Bill Generate Ho Gaya!</h3>
              <p className="text-gray-500 font-medium mb-6 mt-1">Total Amount: <span className="text-gray-900 font-bold">₹{finalAmount}</span></p>
              
              {paymentMode === 'UPI' && (
                <div className="bg-white p-4 rounded-2xl border-2 border-brand-100 shadow-sm mb-6">
                  <p className="text-xs font-bold text-brand-600 mb-3 uppercase tracking-wider">Scan to Pay</p>
                  <QRCodeSVG value={upiUrl} size={150} />
                </div>
              )}
              
              <button onClick={resetBill} className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-all">
                Naya Bill Banao
              </button>
            </div>
          )}

          <div className="bg-gray-900 text-white p-5 text-center">
            <ShoppingCart className="mx-auto mb-2 opacity-80" size={24} />
            <h3 className="text-xl font-bold tracking-widest uppercase">Receipt</h3>
          </div>
          
          <div className="flex-1 p-5 min-h-[350px] overflow-y-auto">
            {cart.length === 0 ? (
              <div className="text-center text-gray-400 mt-20 font-medium">Cart khaali hai. Saaman select karein.</div>
            ) : (
              <div className="space-y-4">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <div className="flex-1">
                      <div className="font-bold text-gray-800 text-sm">{item.name}</div>
                      <div className="text-gray-500 text-xs mt-1">₹{item.price} x {item.quantity}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="font-bold text-gray-900 w-12 text-right">₹{item.price * item.quantity}</div>
                      <div className="flex items-center bg-gray-100 rounded-lg">
                        <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 hover:bg-gray-200 rounded-l-lg"><Minus size={14}/></button>
                        <span className="px-2 text-sm font-bold w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 hover:bg-gray-200 rounded-r-lg"><Plus size={14}/></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 p-5 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 font-bold">Total Amount:</span>
              <span className="text-3xl font-black text-gray-900">₹{totalAmount}</span>
            </div>
            <button 
              onClick={handleGenerateBill}
              disabled={cart.length === 0}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${cart.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'}`}
            >
              Confirm Bill ({paymentMode})
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Billing;
