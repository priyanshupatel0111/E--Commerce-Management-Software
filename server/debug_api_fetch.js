const axios = require('axios');

async function testAPI() {
    try {
        // 1. Login
        console.log('Logging in as admin_user...');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            username: 'admin_user',
            password: 'admin123'
        });

        const token = loginRes.data.accessToken;
        console.log('Login successful. Token:', token ? 'Recieved' : 'Missing');

        if (!token) return;

        // 2. Fetch Orders
        console.log('Fetching orders...');
        const ordersRes = await axios.get('http://localhost:5000/api/orders', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`Status: ${ordersRes.status}`);
        console.log('Data Type:', Array.isArray(ordersRes.data) ? 'Array' : typeof ordersRes.data);
        console.log('Orders Count:', ordersRes.data.length);
        if (ordersRes.data.length > 0) {
            console.log('First Order Sample:', JSON.stringify(ordersRes.data[0], null, 2));
        }

    } catch (error) {
        console.error('API Test Failed:', error.response?.data || error.message);
    }
}

testAPI();
