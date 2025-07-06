import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true, // normalize email to lowercase
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false // Don't include password in queries by default
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other','male','female'], // Fixed 'Mail' typo and added 'Other'
        required: false
    },
    profilePicture: {
        type: String, // URL to profile image
        required: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date,
        required: false
    }
}, {
    timestamps: true
});
userSchema.index({ email: 1 });
userSchema.virtual('profile').get(function() {
    return {
        _id: this._id,
        name: this.name,
        email: this.email,
        gender: this.gender,
        profilePicture: this.profilePicture,
        isVerified: this.isVerified,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
});

// Ensure virtual fields are included in JSON output
userSchema.set('toJSON', { virtuals: true });

const User = mongoose.model('User', userSchema);
export default User;