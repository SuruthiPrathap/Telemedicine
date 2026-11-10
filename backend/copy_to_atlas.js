// One-time copy: local MongoDB -> Atlas
// Usage (inside backend folder):  node copy_to_atlas.js
// It will ask you to paste your Atlas connection string.
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']); // fixes querySrv ECONNREFUSED on blocked DNS
const mongoose = require('mongoose');

const LOCAL = process.env.LOCAL_URI || 'mongodb://127.0.0.1:27017/telemedicine';
const readline = require('readline');

function ask(q) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(res => rl.question(q, a => { rl.close(); res(a.trim()); }));
}

(async () => {
    try {
        let ATLAS = process.env.ATLAS_URI;
        const fs = require('fs');
        if (!ATLAS && fs.existsSync(__dirname + '/atlas_uri.txt')) {
            ATLAS = fs.readFileSync(__dirname + '/atlas_uri.txt', 'utf8').split(/\r?\n/)[0].trim();
            console.log('Read the connection string from atlas_uri.txt');
        }
        if (!ATLAS) {
            ATLAS = await ask('Paste your Atlas connection string and press Enter:\n> ');
        }
        ATLAS = ATLAS.replace(/^"|"$/g, '');
        if (!ATLAS.includes('@')) {
            console.error('The string is cut off: it has no @ part. Put the full string on ONE line in atlas_uri.txt.');
            process.exit(1);
        }
        if (!ATLAS.startsWith('mongodb')) {
            console.error('That is not a MongoDB connection string. It must start with mongodb+srv://');
            process.exit(1);
        }

        console.log('Connecting to local MongoDB...');
        const src = await mongoose.createConnection(LOCAL).asPromise();
        const cols = (await src.db.listCollections().toArray()).filter(c => !c.name.startsWith('system.'));

        let total = 0;
        const data = {};
        for (const c of cols) {
            data[c.name] = await src.db.collection(c.name).find({}).toArray();
            total += data[c.name].length;
        }
        if (total === 0) {
            console.error('Local database "' + src.name + '" has no data. Check the database name (set LOCAL_URI) and try again.');
            process.exit(1);
        }

        console.log('Connecting to Atlas...');
        const dst = await mongoose.createConnection(ATLAS, { serverSelectionTimeoutMS: 15000 }).asPromise();
        console.log('Clearing old data in Atlas database "' + dst.name + '" ...');
        const existing = await dst.db.listCollections().toArray();
        for (const c of existing) {
            if (c.name.startsWith('system.')) continue;
            await dst.db.collection(c.name).deleteMany({});
        }

        for (const name of Object.keys(data)) {
            if (data[name].length) {
                await dst.db.collection(name).insertMany(data[name]);
            }
            console.log(`  ${name}: ${data[name].length} documents copied`);
        }
        console.log('Done. Restart your Render service now.');
        process.exit(0);
    } catch (err) {
        console.error('Copy failed:', err.message);
        const m = String(err.message).toLowerCase();
        if (m.includes('auth')) console.error('HINT: Wrong username or password. Set a new simple password in Atlas (Database Access > Edit) and use it.');
        else if (m.includes('querysrv') || m.includes('enotfound') || m.includes('econnrefused')) console.error('HINT: Your network/DNS blocks Atlas. Try mobile hotspot, or set DNS to 8.8.8.8.');
        else if (m.includes('timed out') || m.includes('selection') || m.includes('primary')) console.error('HINT: Atlas blocked the connection. In Atlas > Network Access, add 0.0.0.0/0 (Allow access from anywhere) and wait 1 minute. Or try mobile hotspot.');
        process.exit(1);
    }
})();