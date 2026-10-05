require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./middleware/auth');

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// 1. Healthcheck Endpoint (Mục 4)
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'UP', database: 'CONNECTED' });
  } catch (error) {
    res.status(500).json({ status: 'DOWN', database: 'DISCONNECTED', error: error.message });
  }
});

// 2. Auth Route: Login (Lấy JWT)
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({
    where: { username },
    include: { role: true, membership: true },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: 'Invalid username or password' });
  }

  const token = jwt.sign(
    { uid: user.uid, username: user.username, role: user.role.rolename },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.json({ token, user: { uid: user.uid, username: user.username, role: user.role.rolename } });
});

// 3. Protected Route: CRUD Product Mẫu (Yêu cầu Token JWT)
app.get('/api/products', authenticateToken, async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
});

app.post('/api/products', authenticateToken, async (req, res) => {
  const { pname, price, quantity } = req.body;
  const product = await prisma.product.create({
    data: { pname, price: parseFloat(price), quantity: parseInt(quantity) },
  });
  res.status(201).json(product);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});