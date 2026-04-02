// Mongoose connection setup. This file is responsible for connecting to the MongoDB database using Mongoose. 
// It exports an asynchronous function that attempts to connect to the database using the connection string 
// from environment variables. If the connection is successful, it logs a success message; if it fails, it 
// catches the error and logs it. This function can be imported and called in the main server file to establish 
// the database connection before starting the server.

const mongoose = require('mongoose');

module.exports = async () => {
    try {
        const atlasUri = process.env.MONGO_URI;
        const localUri = process.env.MONGO_LOCAL_URI || 'mongodb://127.0.0.1:27017/bwf_local';
        const preferLocal = String(process.env.PREFER_LOCAL_DB || 'false').toLowerCase() === 'true';

        const selectedUri = preferLocal ? localUri : (atlasUri || localUri);
        const dbMode = selectedUri === localUri ? 'local' : 'atlas';

        await mongoose.connect(selectedUri);
        console.log(`Mongoose Connected (${dbMode})`);
    } catch (err) {
        console.log("MONGO ERROR: ", err);
    }
}