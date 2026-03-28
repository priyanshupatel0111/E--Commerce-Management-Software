const {
    sequelize,
    Product,
    Category,
    Order,
    OrderItem,
    Purchase,
    PurchaseItem,
    Supplier,
    Seller,
    MiscellaneousExpense,
    ActivityLog,
    Return
} = require('./models');

const clearDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB. Starting cleanup...');

        // We destroy from child tables first to avoid FK constraints if any are active
        if (typeof OrderItem !== 'undefined') await OrderItem.destroy({ where: {}, force: true });
        if (typeof PurchaseItem !== 'undefined') await PurchaseItem.destroy({ where: {}, force: true });
        if (typeof Return !== 'undefined') await Return.destroy({ where: {}, force: true });
        
        // Middle data tables
        await Order.destroy({ where: {}, force: true });
        await Purchase.destroy({ where: {}, force: true });
        await Product.destroy({ where: {}, force: true });
        
        // Parent data tables
        await Category.destroy({ where: {}, force: true });
        await Supplier.destroy({ where: {}, force: true });
        await Seller.destroy({ where: {}, force: true });
        await MiscellaneousExpense.destroy({ where: {}, force: true });
        await ActivityLog.destroy({ where: {}, force: true });

        console.log('Database successfully cleared of all store data. Users and Tenants are preserved.');
        process.exit(0);
    } catch (error) {
        console.error('Error clearing database:', error);
        process.exit(1);
    }
}

clearDatabase();
