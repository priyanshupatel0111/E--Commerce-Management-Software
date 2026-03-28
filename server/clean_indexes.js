const { sequelize } = require('./models');

const cleanIndexes = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB. Cleaning old unique constraints...');

        const getConstraintsQuery = `
            SELECT conname as constraint_name, t.relname as table_name
            FROM pg_constraint c 
            JOIN pg_class t ON c.conrelid = t.oid 
            WHERE t.relname IN ('Products', 'Sellers') 
            AND (conname LIKE '%sku_key%' OR conname LIKE '%product_code_key%' OR conname LIKE '%seller_code_key%')
        `;

        const [results] = await sequelize.query(getConstraintsQuery);
        
        for (let row of results) {
            console.log(`Dropping constraint: ${row.constraint_name} from ${row.table_name}`);
            await sequelize.query(`ALTER TABLE "${row.table_name}" DROP CONSTRAINT IF EXISTS "${row.constraint_name}" CASCADE`);
        }

        console.log('Successfully dropped all old global unique constraints.');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

cleanIndexes();
