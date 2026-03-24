const { Tenant } = require('./models');

async function print() {
    console.log("--- STORE CODES ---");
    const stores = await Tenant.findAll();
    stores.forEach(s => {
        console.log(`Store: ${s.name} | Code: ${s.tenant_code}`);
    });
    process.exit(0);
}
print();
