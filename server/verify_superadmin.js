const axios = require('axios');
const { User, Role } = require('./models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('dotenv').config();

async function runSuperAdminTests() {
    try {
        console.log('--- Starting Super Admin Dashboard Verification ---');

        // 1. Ensure a Super Admin role and user exists
        const [superAdminRole] = await Role.findOrCreate({ where: { role_name: 'SUPER_ADMIN' } });
        
        const salt = bcrypt.genSaltSync(10);
        const [superAdminUser] = await User.findOrCreate({
            where: { username: 'superadmin_test' },
            defaults: { password_hash: bcrypt.hashSync('password', salt), role_id: superAdminRole.id, tenant_id: null }
        });

        console.log(`✅ Super Admin created: ${superAdminUser.username}`);

        // Generate a valid token for testing API locally
        const token = jwt.sign({ 
            id: superAdminUser.id, 
            role: 'SUPER_ADMIN', 
            role_id: superAdminRole.id 
        }, process.env.JWT_SECRET || 'secret123', { expiresIn: 3600 });
        
        const headers = { Authorization: `Bearer ${token}` };

        // 2. Test /api/superadmin/analytics
        console.log(`\n⏳ Fetching Analytics...`);
        const analyticsRes = await axios.get('http://localhost:5000/api/superadmin/analytics', { headers });
        console.log(`✅ Analytics Data: ${JSON.stringify(analyticsRes.data)}`);

        // 3. Test /api/superadmin/stores
        console.log(`\n⏳ Fetching Stores Registry...`);
        const storesRes = await axios.get('http://localhost:5000/api/superadmin/stores', { headers });
        console.log(`✅ Stores fetched: ${storesRes.data.length} stores found.`);

        // 4. Test /api/superadmin/roles
        console.log(`\n⏳ Fetching Global Roles...`);
        const rolesRes = await axios.get('http://localhost:5000/api/superadmin/roles', { headers });
        console.log(`✅ Roles fetched: ${rolesRes.data.roles.length} roles, ${rolesRes.data.permissions.length} permissions.`);

        console.log('\n✅ Super Admin API Verification Completed Successfully!');
        process.exit(0);

    } catch (err) {
        console.error('❌ Verification Error:', err.response ? err.response.data : err.message);
        process.exit(1);
    }
}

runSuperAdminTests();
