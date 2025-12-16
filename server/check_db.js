const { sequelize, User, Role } = require('./models');

async function checkDB() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        const roles = await Role.findAll();
        console.log('Roles:', JSON.stringify(roles, null, 2));

        const users = await User.findAll({ include: Role });
        console.log('Users:', JSON.stringify(users, null, 2));

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

checkDB();
