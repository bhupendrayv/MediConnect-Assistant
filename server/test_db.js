const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://bhupendrayadav2077_db_user:Bhupendra123@cluster0.qahscd2.mongodb.net/smart-healthcare?appName=Cluster0';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB is Connected!');
        process.exit(0);
    })
    .catch(err => {
        console.error('MongoDB Connection Failed:', err.message);
        process.exit(1);
    });
