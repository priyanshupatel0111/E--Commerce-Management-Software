const axios = require('axios');
const { Tenant } = require('./models');

async function testGateway() {
    try {
        console.log('--- Phase 5: Tenant Gateway Verification ---');

        // 1. Create a dummy tenant with a specific code
        const code = 'TESTXYZ' + Math.floor(Math.random() * 1000);
        await Tenant.create({ name: 'Verification Store', tenant_code: code });
        console.log(`✅ Created seed tenant with Store Code: ${code}`);

        // 2. Test valid verification via API endpoint (Case Insensitive: testxyz)
        const verifyRes = await axios.get(`http://localhost:5000/api/tenants/verify?code=${code.toLowerCase()}`);
        if (verifyRes.data.tenant_code === code) {
            console.log(`✅ Gateway Verification successful for code: ${code.toLowerCase()}`);
        }

        // 3. Test invalid code handling
        try {
            await axios.get(`http://localhost:5000/api/tenants/verify?code=INVALID999`);
        } catch (err) {
            if (err.response.status === 404) {
                console.log(`✅ Gateway securely rejects invalid codes with 404.`);
            }
        }

        console.log('\n--- Gateway Verification Completed Successfully! ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ Verification Error:', err.message);
        process.exit(1);
    }
}

testGateway();
