const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const purchaseRoutes = require('./routes/purchase.routes');
const reportRoutes = require('./routes/report.routes');
const adminRoutes = require('./routes/admin.routes');
const userRoutes = require('./routes/userRoutes');
const returnRoutes = require('./routes/return.routes'); // Added

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sellers', require('./routes/seller.routes')); // Added
app.use('/api/misc-expenses', require('./routes/miscExpense.routes')); // Added
app.use('/api/returns', returnRoutes); // Added

app.use('/api/suppliers', require('./routes/supplier.routes'));


app.get('/', (req, res) => {
    res.json({ message: 'Welcome to E-Commerce ERP API' });
});

// Sync Database and Start Server
sequelize.sync({ alter: true }).then(() => {
    console.log('Database synced successfully.');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to sync database:', err);
});
