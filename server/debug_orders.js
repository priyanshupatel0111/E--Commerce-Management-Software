const { sequelize, Order, OrderItem, Product, User, Role } = require('./models');

async function debugOrders() {
    try {
        await sequelize.authenticate();
        console.log('DB Connection OK');

        // 1. Check if ANY orders exist
        const count = await Order.count();
        console.log(`Total Orders in DB: ${count}`);

        if (count === 0) {
            console.log('No orders found. Creating a dummy order...');
            // Need a valid user and product
            const user = await User.findOne();
            const product = await Product.findOne();

            if (!user || !product) {
                console.error('Cannot create dummy order: No User or Product found');
                return;
            }

            const t = await sequelize.transaction();
            try {
                const order = await Order.create({
                    customer_id: null,
                    employee_id: user.id,
                    total_amount: 100,
                    status: 'Completed',
                    seller_custom_id: 'DEBUG_A',
                    platform: 'DebugPlat'
                }, { transaction: t });

                await OrderItem.create({
                    order_id: order.id,
                    product_id: product.id,
                    quantity: 1,
                    price_at_sale: 100
                }, { transaction: t });

                await t.commit();
                console.log('Dummy order created successfully ID:', order.id);
            } catch (err) {
                await t.rollback();
                console.error('Failed to create dummy order:', err.message);
            }
        }

        // 2. Try Fetching with Associations (The exact query from routes)
        console.log('Attempting to fetch orders with associations...');
        try {
            const orders = await Order.findAll({
                include: [
                    { model: OrderItem, include: [Product] },
                    { model: User, as: 'Employee', attributes: ['username'] }
                ],
                limit: 5,
                order: [['createdAt', 'DESC']]
            });
            console.log('Fetch successful!');
            console.log('Fetched Orders:', JSON.stringify(orders, null, 2));
        } catch (err) {
            console.error('Fetch FAILED:', err);
        }

    } catch (error) {
        console.error('Top level error:', error);
    } finally {
        await sequelize.close();
    }
}

debugOrders();
