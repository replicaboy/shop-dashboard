const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Frontend se aane wale JSON data ko parse karne ke liye

// Routes import karna
const productRoutes = require('./routes/productRoutes');
const customerRoutes = require('./routes/customerRoutes'); 
const billRoutes = require('./routes/billRoutes');

// API endpoint set karna
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes); 
app.use('/api/bills', billRoutes);

// Database Connection (Vercel ke liye optimized)
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000, // 5 second me connect nahi hua to turant error dega
  family: 4 // Sabse zaroori: Ye Vercel ko IPv4 use karne pe force karta hai, jisse timeout theek hota hai
})
  .then(() => console.log('✅ MongoDB Connected Successfully!'))
  .catch((err) => console.error('❌ MongoDB Connection Error: ', err.message));

// Basic Test Route (Taki Vercel par check kar sakein ki API chal rahi hai)
app.get('/', (req, res) => {
  res.send('Gopal Ji General Store API is successfully running on Vercel! 🚀');
});

// Vercel (Serverless) aur Local dono ke liye setup
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server is locally running on port ${PORT}`);
  });
}

// Vercel ke liye app ko export karna zaroori hai
module.exports = app;