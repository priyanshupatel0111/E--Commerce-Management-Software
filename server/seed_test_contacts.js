const { User } = require('./models');
const sequelize = require('./config/database');

async function seedContacts() {
    try {
        await sequelize.authenticate();
        console.log('DB Connection successful');
        
        const users = await User.findAll();
        for (let user of users) {
            // Only update if they don't have one
            if (!user.email) {
                user.email = `${user.username}@test.com`;
            }
            if (!user.phone_number) {
                 user.phone_number = `+1555${Math.floor(100000 + Math.random() * 900000)}`;
            }
            // superadmin exception for easy predictable login
            if (user.username === 'superadmin_test') { 
                 user.email = 'superadmin@system.local';
                 user.phone_number = '1234567890';
            }
            await user.save();
        }
        console.log('Successfully seeded dummy contacts for all users');
        process.exit(0);
    } catch (e) {
        console.error('Error seeding contacts:', e);
        process.exit(1);
    }
}
seedContacts();
