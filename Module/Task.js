import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200 // prevent extremely long titles
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000 // limit description length
    },
    category: {
        type: String,
        required: true,
        enum: ['Study', 'Work', 'Personal', 'Shopping', 'Other'],
        default: 'Other'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    reminder: {
        type: Date,
        required: false
    },
    dueDate: {
        type: Date,
        required: false
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true // This automatically handles createdAt and updatedAt
});

// Add indexes for better query performance
TaskSchema.index({ userId: 1, createdAt: -1 }); // Most common query pattern
TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ userId: 1, dueDate: 1 });

// Add a virtual for checking if task is overdue
TaskSchema.virtual('isOverdue').get(function() {
    return this.dueDate && this.dueDate < new Date() && this.status !== 'Completed';
});

const Task = mongoose.model('Task', TaskSchema);
export default Task;