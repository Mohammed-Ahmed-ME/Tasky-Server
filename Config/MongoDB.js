// Config/MongoDB.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const Connect = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Tasky';

        // MongoDB connection options (updated for compatibility)
        const options = {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        // Configure mongoose-specific options
        mongoose.set('bufferCommands', false); // Disable mongoose buffering

        await mongoose.connect(mongoUri, options);

        console.log('✅ Connected to MongoDB successfully');
        console.log(`📍 Database: ${mongoose.connection.name}`);
        console.log(`🌐 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);

    } catch (error) {
        console.error('❌ MongoDB connection error' );
        throw error; // Re-throw to be caught by server startup
    }
};

// Handle connection events
mongoose.connection.on('connected', () => {
    console.log('📡 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('📡 Mongoose disconnected from MongoDB');
});

// Handle application termination
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed through app termination');
    } catch (error) {
        console.error('❌ Error closing MongoDB connection:', error);
    }
});

export default Connect;