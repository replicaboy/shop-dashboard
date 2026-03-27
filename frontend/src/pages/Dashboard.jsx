import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IndianRupee, TrendingUp, AlertCircle, Users, PackageOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE = 'https://shop-dashboard-pi.vercel.app/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalUdhaar: 0,
    totalBills: 0,
    lowStockItems: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Teeno APIs se data mangwao
        const [billsRes, customersRes, productsRes] = await Promise.all([
          axios.get(`${API_BASE}/bills`),
          axios.get(`${API_BASE}/customers`),
          axios.get(`${API_BASE}/products`)
        ]);

        const bills = billsRes.data;
        const customers = customersRes.data;
        const products = productsRes.data;

        // 1. Total Sales (Sirf Cash aur UPI wale)
        const sales = bills
          .filter(bill => bill.paymentMode !== 'Udhaar')
          .reduce((sum, bill) => sum + bill.totalAmount, 0);

        // 2. Market me Total Udhaar kitna hai
        const udhaar = customers.reduce((sum, cust) => sum + cust.udhaarBalance, 0);

        // 3. Low Stock Items (Jo 5 piece se kam bache hain)
        const lowStock = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 5);

        setStats({
          totalSales: sales,
          totalUdhaar: udhaar,
          totalBills: bills.length,
          lowStockItems: lowStock
        });
        setLoading(false);

      } catch (error) {
        console.error("Dashboard data laane me error:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Chote-chote khubsurat UI cards
  const StatCard = ({ title, value, icon, colorClass, bgColor }) => (
    <div className={`p-6 rounded-2xl border ${bgColor} shadow-sm flex items-center gap-4`}>
      <div className={`p-4 rounded-xl ${colorClass} text-white shadow-md`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-gray-500 mb-1">{title}</p>
        <h3 className="text-3xl font-black text-gray-800">{value}</h3>
      </div>
    </div>
  );

  if (loading) return <div className="p-6 text-center text-gray-500 font-bold mt-20">Data load ho raha hai...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <TrendingUp className="text-brand-600" size={32} />
        <h2 className="text-3xl font-extrabold text-gray-800">Dukaan Ka Hisaab (Dashboard)</h2>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Total Cash / UPI Aaya" 
          value={`₹${stats.totalSales}`} 
          icon={<IndianRupee size={28} />} 
          colorClass="bg-green-500" bgColor="bg-green-50 border-green-100" 
        />
        <StatCard 
          title="Market Me Udhaar Fasa Hai" 
          value={`₹${stats.totalUdhaar}`} 
          icon={<Users size={28} />} 
          colorClass="bg-red-500" bgColor="bg-red-50 border-red-100" 
        />
        <StatCard 
          title="Total Bill Kate" 
          value={stats.totalBills} 
          icon={<PackageOpen size={28} />} 
          colorClass="bg-brand-500" bgColor="bg-brand-50 border-brand-100" 
        />
      </div>

      {/* Low Stock Alerts */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 bg-orange-50 border-b border-orange-100 flex items-center gap-2">
          <AlertCircle className="text-orange-500" size={24} />
          <h3 className="text-xl font-bold text-orange-800">Alert: Ye Saaman Khatam Hone Wala Hai!</h3>
        </div>
        
        <div className="p-5">
          {stats.lowStockItems.length === 0 ? (
            <p className="text-gray-500 font-medium text-center py-4">Sab badhiya hai! Abhi koi saaman short nahi hai.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.lowStockItems.map(item => (
                <div key={item._id} className="p-4 border border-gray-100 rounded-xl flex justify-between items-center bg-gray-50">
                  <div className="font-bold text-gray-800">{item.name}</div>
                  <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-extrabold">
                    Sirf {item.stockQuantity} bache hain!
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
