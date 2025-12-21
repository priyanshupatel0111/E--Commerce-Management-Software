const sequelize = require('../config/database');
const User = require('./User');
const Role = require('./Role');
const Category = require('./Category');
const Product = require('./Product');
const Customer = require('./Customer');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Supplier = require('./Supplier');
const Purchase = require('./Purchase');
const PurchaseItem = require('./PurchaseItem');
const ActivityLog = require('./ActivityLog');
const Seller = require('./Seller'); // Added
const MiscellaneousExpense = require('./MiscellaneousExpense'); // Added
const Return = require('./Return'); // Added
const ReturnAnalysis = require('./ReturnAnalysis'); // Added

// User & Role
Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Role, { foreignKey: 'role_id' });

// Order Associations
User.hasMany(Order, { foreignKey: 'employee_id' });
Order.belongsTo(User, { foreignKey: 'employee_id', as: 'Employee' });

Customer.hasMany(Order, { foreignKey: 'customer_id' });
Order.belongsTo(Customer, { foreignKey: 'customer_id' });

Order.hasMany(OrderItem, { foreignKey: 'order_id' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

Product.hasMany(OrderItem, { foreignKey: 'product_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id' });

// Return Associations
Order.hasMany(Return, { foreignKey: 'order_id' });
Return.belongsTo(Order, { foreignKey: 'order_id' });

Product.hasMany(Return, { foreignKey: 'product_id' });
Return.belongsTo(Product, { foreignKey: 'product_id' });

// Return Analysis Associations
Order.hasOne(ReturnAnalysis, { foreignKey: 'order_id' });
ReturnAnalysis.belongsTo(Order, { foreignKey: 'order_id' });

// Purchase Associations
Supplier.hasMany(Purchase, { foreignKey: 'supplier_id' });
Purchase.belongsTo(Supplier, { foreignKey: 'supplier_id' });

Purchase.hasMany(PurchaseItem, { foreignKey: 'purchase_id' });
PurchaseItem.belongsTo(Purchase, { foreignKey: 'purchase_id' });

Product.hasMany(PurchaseItem, { foreignKey: 'product_id' });
PurchaseItem.belongsTo(Product, { foreignKey: 'product_id' });

// Inventory/Categories
Category.hasMany(Product, { foreignKey: 'category_id' }); // Assuming category_id in products as implicitly needed? 
// Wait, prompt said "categories: id, name", "products: id... no category_id listed explicitly but implied by relationship?" 
// Usually products have category. I'll add Association but check if Product model has category_id. 
// Sequelize creates FK automatically if defined here.
Product.belongsTo(Category, { foreignKey: 'category_id' });

// Logs
User.hasMany(ActivityLog, { foreignKey: 'user_id' });
ActivityLog.belongsTo(User, { foreignKey: 'user_id' });

// Miscellaneous Expenses
User.hasMany(MiscellaneousExpense, { foreignKey: 'added_by' });
MiscellaneousExpense.belongsTo(User, { foreignKey: 'added_by', as: 'AddedBy' });

module.exports = {
    sequelize,
    User,
    Role,
    Category,
    Product,
    Customer,
    Order,
    OrderItem,
    Supplier,
    Purchase,
    PurchaseItem,
    ActivityLog,
    Seller, // Added
    MiscellaneousExpense, // Added
    Return, // Added
    ReturnAnalysis // Added
};
