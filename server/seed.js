const { sequelize, Role, User, Category, Customer, Supplier } = require('./models');
const bcrypt = require('bcrypt');
require('dotenv').config();

const seed = async () => {
    try {
        await sequelize.sync({ force: true }); // Reset DB

        // Roles
        const adminRole = await Role.create({ role_name: 'Admin', permissions: { all: true } });
        const staffRole = await Role.create({ role_name: 'Employee', permissions: { pos: true, inventory_view: true } });
        const watcherRole = await Role.create({ role_name: 'Watcher', permissions: { reports: true } });
        // Keeping ReportViewer for backward compatibility if needed, or just replacing it.
        // Given the requirement "create new emmplyee and watcher", I'll use Watcher as the prompt name.

        // Users
        const salt = bcrypt.genSaltSync(10);

        await User.create({
            username: 'admin_user',
            password_hash: bcrypt.hashSync('admin123', salt),
            role_id: adminRole.id
        });

        await User.create({
            username: 'staff_user',
            password_hash: bcrypt.hashSync('staff123', salt),
            role_id: staffRole.id
        });

        await User.create({
            username: 'investor_user',
            password_hash: bcrypt.hashSync('view123', salt),
            role_id: viewerRole.id
        });

        // Default Customer for POS
        await Customer.create({
            name: 'Walk-in Customer',
            email: 'walkin@example.com',
            phone: '0000000000',
            address: 'Store Counter'
        });

        // Default Supplier
        await Supplier.create({
            company_name: 'General Supplies Inc.',
            contact_info: 'contact@supplies.com'
        });

        // Dummy Categories
        await Category.create({ name: 'Electronics' });
        await Category.create({ name: 'Clothing' });
        await Category.create({ name: 'Groceries' });

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seed();
