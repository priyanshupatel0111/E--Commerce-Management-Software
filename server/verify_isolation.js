const { sequelize, Tenant, Role, Permission, User, Product, RolePermission } = require('./models');
const { withTenantScope } = require('./utils/tenantScope');
const checkPermission = require('./middleware/rbac.middleware');
const bcrypt = require('bcrypt');

async function runTests() {
    try {
        console.log('--- Starting Verification ---');
        
        // 1. Seed Tenants
        const [tenantA] = await Tenant.findOrCreate({ where: { domain: 'storea.com' }, defaults: { name: 'Store A' } });
        const [tenantB] = await Tenant.findOrCreate({ where: { domain: 'storeb.com' }, defaults: { name: 'Store B' } });
        
        console.log(`✅ Tenants created: ${tenantA.name}, ${tenantB.name}`);

        // 2. Seed Roles & Permissions
        const [permView] = await Permission.findOrCreate({ where: { action: 'view_products' } });
        const [permEdit] = await Permission.findOrCreate({ where: { action: 'edit_products' } });

        const [roleAdmin] = await Role.findOrCreate({ where: { role_name: 'TENANT_ADMIN' } });
        const [roleSupport] = await Role.findOrCreate({ where: { role_name: 'SUPPORT' } });

        // Assign permissions
        await roleAdmin.addPermissions([permView, permEdit]);
        await roleSupport.addPermissions([permView]); // Support can only view

        console.log(`✅ Roles & Permissions seeded`);

        // 3. Seed Users
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync('password', salt);
        
        const [userA] = await User.findOrCreate({ 
            where: { username: 'adminA' },
            defaults: { password_hash: hash, tenant_id: tenantA.id, role_id: roleAdmin.id }
        });

        const [userB] = await User.findOrCreate({ 
            where: { username: 'supportB' },
            defaults: { password_hash: hash, tenant_id: tenantB.id, role_id: roleSupport.id }
        });

        console.log(`✅ Users created: ${userA.username} (Tenant A), ${userB.username} (Tenant B)`);

        // 4. Seed Products
        await Product.findOrCreate({ 
            where: { product_code: 'A-001' }, 
            defaults: { name: 'Product A1', tenant_id: tenantA.id } 
        });
        await Product.findOrCreate({ 
            where: { product_code: 'A-002' }, 
            defaults: { name: 'Product A2', tenant_id: tenantA.id } 
        });

        await Product.findOrCreate({ 
            where: { product_code: 'B-001' }, 
            defaults: { name: 'Product B1', tenant_id: tenantB.id } 
        });

        console.log(`✅ Products seeded with tenant contexts`);

        // 5. Verify Isolation (simulate request scope)
        const reqAdminA = { tenant_id: tenantA.id };
        const reqSupportB = { tenant_id: tenantB.id };

        // Should return only Tenant A's products
        const productsScopeA = await Product.findAll({ ...require('./utils/tenantScope.js')(reqAdminA) });
        console.log(`\n--- Isolation Test ---`);
        console.log(`Admin A (Tenant A) sees ${productsScopeA.length} products (Expected: 2)`);
        if (productsScopeA.length === 2 && productsScopeA.every(p => p.tenant_id === tenantA.id)) {
            console.log(`✅ ISOLATION PASSED FOR TENANT A`);
        } else {
            console.error(`❌ ISOLATION FAILED FOR TENANT A`);
        }

        const productsScopeB = await Product.findAll({ ...require('./utils/tenantScope.js')(reqSupportB) });
        console.log(`Support B (Tenant B) sees ${productsScopeB.length} products (Expected: 1)`);
        if (productsScopeB.length === 1 && productsScopeB[0].tenant_id === tenantB.id) {
            console.log(`✅ ISOLATION PASSED FOR TENANT B`);
        } else {
            console.error(`❌ ISOLATION FAILED FOR TENANT B`);
        }

        // 6. Verify RBAC
        console.log(`\n--- RBAC Test ---`);
        // We will simulate testing the role loaded on the user
        const testUserAdmin = await User.findByPk(userA.id, {
            include: { model: Role, include: { model: Permission } }
        });
        
        const hasEditPerm = testUserAdmin.Role.Permissions.some(p => p.action === 'edit_products');
        if (hasEditPerm) {
            console.log(`✅ TENANT_ADMIN has 'edit_products' permission`);
        } else {
            console.error(`❌ TENANT_ADMIN missing 'edit_products' permission`);
        }

        console.log('\n✅ Script Completed Successfully');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error during script:', err);
        process.exit(1);
    }
}

runTests();
