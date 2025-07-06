import express from 'express';
import { authToken } from "../middleware/auth.js";
import Task from "../Module/Task.js";

const task = express.Router();

// Create new task
task.post('/NewTask', authToken, async (req, res) => {
    try {
        const newTask = req.body;
        const userId = req.user.id;

        if (!newTask || !newTask.title || !newTask.description || !newTask.category) {
            return res.status(400).json({ error: 'Title, description, and category are required' });
        }

        const task = new Task({
            title: newTask.title,
            description: newTask.description,
            category: newTask.category,
            priority: newTask.priority || 'Medium',
            reminder: newTask.reminder,
            dueDate: newTask.dueDate,
            status: 'Pending',
            userId: userId
        });

        const savedTask = await task.save();
        res.status(201).json({
            message: 'Task created successfully',
            task: savedTask
        });

    } catch (error) {
        console.error('Error creating task:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all tasks for user
task.get('/Get-Tasks', authToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const tasks = await Task.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json({
            message: 'Tasks fetched successfully',
            tasks: tasks
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single task
task.get('/Get-Task/:id', authToken, async (req, res) => {
    try {
        const taskId = req.params.id;
        const userId = req.user.id;

        const task = await Task.findOne({ _id: taskId, userId });

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.status(200).json({
            message: 'Task fetched successfully',
            task: task
        });
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update task
task.put('/Update-Task/:id', authToken, async (req, res) => {
    try {
        const taskId = req.params.id;
        const userId = req.user.id;
        const updates = req.body;

        // Remove fields that shouldn't be updated
        delete updates.userId;
        delete updates.createdAt;
        delete updates._id;

        const updatedTask = await Task.findOneAndUpdate(
            { _id: taskId, userId },
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.status(200).json({
            message: 'Task updated successfully',
            task: updatedTask
        });

    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete task
task.delete('/Delete-Task/:id', authToken, async (req, res) => {
    try {
        const taskId = req.params.id;
        const userId = req.user.id;

        const deletedTask = await Task.findOneAndDelete({ _id: taskId, userId });

        if (!deletedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.status(200).json({
            message: 'Task deleted successfully',
            task: deletedTask
        });

    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update task status only (useful for marking complete/incomplete)
task.patch('/Update-Status/:id', authToken, async (req, res) => {
    try {
        const taskId = req.params.id;
        const userId = req.user.id;
        const { status } = req.body;

        if (!status || !['Pending', 'In Progress', 'Completed'].includes(status)) {
            return res.status(400).json({ error: 'Valid status is required' });
        }

        const updatedTask = await Task.findOneAndUpdate(
            { _id: taskId, userId },
            { status },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.status(200).json({
            message: 'Task status updated successfully',
            task: updatedTask
        });

    } catch (error) {
        console.error('Error updating task status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default task;