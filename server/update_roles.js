const { sequelize, Role } = require('./models');

const updateRoles = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Ensure Watcher role exists
        const watcher = await Role.findOne({ where: { role_name: 'Watcher' } });
        if (!watcher) {
            await Role.create({ role_name: 'Watcher', permissions: { reports: true } });
            console.log('Created Watcher role.');
        } else {
            console.log('Watcher role already exists.');
        }

        // Ensure Employee role exists (just in case)
        const employee = await Role.findOne({ where: { role_name: 'Employee' } });
        if (!employee) {
            await Role.create({ role_name: 'Employee', permissions: { pos: true, inventory_view: true } });
            console.log('Created Employee role.');
        } else {
            console.log('Employee role already exists.');
        }

        console.log('Roles updated successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Role update failed:', error);
        process.exit(1);
    }
};

updateRoles();
