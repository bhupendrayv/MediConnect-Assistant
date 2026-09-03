const mongoose = require('mongoose');

const localUri = 'mongodb://127.0.0.1:27017/smart-healthcare';
const atlasUri = 'mongodb+srv://bhupendrayadav2077_db_user:Bhupendra123@cluster0.qahscd2.mongodb.net/smart-healthcare?retryWrites=true&w=majority&appName=Cluster0';


async function migrate() {
    console.log('🔄 Connecting to Local MongoDB...');
    const localConn = await mongoose.createConnection(localUri).asPromise();
    console.log('✅ Connected to Local MongoDB.');

    console.log('🔄 Connecting to MongoDB Atlas...');
    const atlasConn = await mongoose.createConnection(atlasUri).asPromise();
    console.log('✅ Connected to MongoDB Atlas.');

    // Get all collection names from local database
    const collections = await localConn.db.listCollections().toArray();
    console.log(`📦 Found ${collections.length} collections in local database:`, collections.map(c => c.name));

    for (const colInfo of collections) {
        const colName = colInfo.name;
        if (colName.startsWith('system.')) continue;

        console.log(`\n🚚 Migrating collection: "${colName}"...`);
        const localCollection = localConn.db.collection(colName);
        const atlasCollection = atlasConn.db.collection(colName);

        const docs = await localCollection.find({}).toArray();
        console.log(`   Found ${docs.length} documents in local "${colName}".`);

        if (docs.length > 0) {
            // Drop target Atlas collection first to avoid duplicate key conflict on fresh migration
            try {
                await atlasCollection.drop();
            } catch (e) {
                // Ignore NamespaceNotFound error if collection doesn't exist
            }
            await atlasCollection.insertMany(docs);
            console.log(`   ✅ Successfully migrated ${docs.length} documents to Atlas "${colName}".`);
        } else {
            console.log(`   ℹ️ Collection "${colName}" is empty, skipping.`);
        }
    }

    console.log('\n🎉 ALL DATA MIGRATION TO MONGODB ATLAS COMPLETED SUCCESSFULLY!');
    await localConn.close();
    await atlasConn.close();
    process.exit(0);
}

migrate().catch(err => {
    console.error('❌ Migration Error:', err);
    process.exit(1);
});
