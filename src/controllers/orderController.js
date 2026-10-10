const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createOrder = async (req, res) => {
    try {
        const { items } = req.body; // items: [{ productId, quantity }]
        const userId = req.user.uid; // Lấy từ token JWT

        const orderDetailsData = [];

        for (const item of items) {
            const product = await prisma.product.findUnique({ where: { pid: item.productId } });
            if (!product || product.quantity < item.quantity) {
                return res.status(400).json({ message: `Sản phẩm ID ${item.productId} không đủ số lượng` });
            }
            orderDetailsData.push({
                product: {
                    connect: { pid: item.productId }
                },
                qty: item.quantity,
                unit_price: product.price
            });
        }

        // Tạo Order khớp chuẩn 100% với relation product của Prisma Schema
        const order = await prisma.order.create({
            data: {
                user: {
                    connect: { uid: userId }
                },
                orderDetails: {
                    create: orderDetailsData
                }
            },
            include: { orderDetails: true }
        });

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: req.user.uid },
            include: { orderDetails: true, shipments: true }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};