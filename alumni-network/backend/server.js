require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// connect to mongo
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser:true, useUnifiedTopology:true })
  .then(()=>console.log('Mongo connected'))
  .catch(err=>console.error('Mongo error', err));

// simple health route
app.get('/health', (req,res)=> res.json({ ok:true }));

// mount alumni routes (create routes/alumni.js later)
const alumniRoutes = require('./routes/alumni');
app.use('/api/alumni', alumniRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log(`Backend listening ${PORT}`));
