const { sequelize } = require('./models');

const fixDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB. Fixing constraints...');

        // For PostgreSQL, unique constraints created by `unique: true` are often named TableName_columnName_key
        const dialect = sequelize.getDialect();
        if (dialect === 'postgres') {
            try { await sequelize.query('ALTER TABLE "Products" DROP CONSTRAINT "Products_sku_key";'); } catch(e) { console.log('Products_sku_key not dropped or not found'); }
            try { await sequelize.query('ALTER TABLE "Products" DROP CONSTRAINT "Products_product_code_key";'); } catch(e) { console.log('Products_product_code_key not dropped or not found'); }
            try { await sequelize.query('ALTER TABLE "Sellers" DROP CONSTRAINT "Sellers_seller_code_key";'); } catch(e) { console.log('Sellers_seller_code_key not dropped or not found'); }
        }

        console.log('Running sync alter...');
        await sequelize.sync({ alter: true });

        console.log('Database sync successful.');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing database:', error);
        process.exit(1);
    }
}

fixDatabase();
