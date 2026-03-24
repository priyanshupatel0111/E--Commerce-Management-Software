const { Tenant } = require('./models');

async function fixCodes() {
    try {
        const stores = await Tenant.findAll();
        let results = [];
        for (const store of stores) {
            if (!store.tenant_code) {
                // Generate a code from name
                const baseCode = store.name.replace(/\s+/g, '').substring(0, 4).toUpperCase();
                const randomNum = Math.floor(Math.random() * 900) + 100;
                store.tenant_code = `${baseCode}${randomNum}`;
                await store.save();
                console.log(`Updated ${store.name} -> Code: ${store.tenant_code}`);
            } else {
                console.log(`${store.name} already has Code: ${store.tenant_code}`);
            }
            results.push({ name: store.name, code: store.tenant_code });
        }
        console.log('\n--- ALL STORE CODES ---');
        console.table(results);
        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}
fixCodes();
