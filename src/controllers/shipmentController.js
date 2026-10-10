const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.updateShipmentStatus = async (req, res) => {
    try {
        const { orderId, status, address } = req.body;
        const oid = Number(orderId);

        // Tìm shipment đã tồn tại theo oid
        const existingShipment = await prisma.shipment.findFirst({
            where: { oid }
        });

        let shipment;
        if (existingShipment) {
            // Nếu đã có shipment thì update
            shipment = await prisma.shipment.update({
                where: { shipid: existingShipment.shipid },
                data: {
                    status: status || 'SHIPPED'
                }
            });
        } else {
            // Nếu chưa có thì tạo mới và connect tới Order qua oid
            shipment = await prisma.shipment.create({
                data: {
                    status: status || 'SHIPPED',
                    order: {
                        connect: { oid }
                    }
                }
            });
        }

        res.json(shipment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};