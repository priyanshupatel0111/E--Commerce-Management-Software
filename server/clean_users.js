const { sequelize, User, Role } = require('./models');
const { Op } = require('sequelize');

const cleanUsers = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB. Cleaning old unique constraints for Users...');

        // 1. Drop existing global username constraint
        const getConstraintsQuery = `
            SELECT conname as constraint_name, t.relname as table_name
            FROM pg_constraint c 
            JOIN pg_class t ON c.conrelid = t.oid 
            WHERE t.relname = 'Users'
            AND conname LIKE '%username_key%'
        `;
        const [results] = await sequelize.query(getConstraintsQuery);
        for (let row of results) {
            console.log(`Dropping constraint: ${row.constraint_name} from ${row.table_name}`);
            await sequelize.query(`ALTER TABLE "${row.table_name}" DROP CONSTRAINT IF EXISTS "${row.constraint_name}" CASCADE`);
        }

        // 2. Fetch Employee and Watcher Role IDs
        const roles = await Role.findAll({
            where: {
                role_name: { [Op.in]: ['Employee', 'Watcher'] }
            }
        });
        const roleIds = roles.map(r => r.id);

        // 3. Delete existing Employees and Watchers
        if (roleIds.length > 0) {
            const deletedCount = await User.destroy({
                where: {
                    role_id: { [Op.in]: roleIds }
                }
            });
            console.log(`Deleted ${deletedCount} existing employees/watchers to start fresh!`);
        }

        // 4. Sync to create the new scoped compound index
        console.log('Running sync alter...');
        await sequelize.sync({ alter: true });

        console.log('Script completed successfully.');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

cleanUsers();
