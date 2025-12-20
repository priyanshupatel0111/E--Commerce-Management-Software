const { Order, sequelize } = require('./models');

async function checkOrders() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        const orders = await Order.findAll();
        console.log(`Found ${orders.length} orders.`);
        console.log('Order IDs:', orders.map(o => o.id).join(', '));
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

checkOrders();
