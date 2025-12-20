const { Order } = require('./models');

async function listOrders() {
    try {
        const orders = await Order.findAll();
        console.log('Orders found:', orders.length);
        if (orders.length > 0) {
            const firstId = orders[0].id;
            console.log(`Testing findByPk(${firstId})...`);
            const order = await Order.findByPk(firstId);
            console.log('Result:', order ? 'Found' : 'Not Found');

            console.log(`Testing findByPk('${firstId}')...`); // String
            const orderStr = await Order.findByPk(String(firstId));
            console.log('Result:', orderStr ? 'Found' : 'Not Found');
        }
    } catch (error) {
        console.error('Error listing orders:', error);
    }
}

listOrders();
