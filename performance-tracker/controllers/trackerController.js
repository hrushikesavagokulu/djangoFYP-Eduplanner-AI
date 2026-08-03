const path = require('path');
const fileHandler = require('../utils/fileHandler');

const DATA_DIR = path.join(__dirname, '../data');

/**
 * Controller for tracker operations.
 */
const trackerController = {
    /**
     * Initialize tracker (set number of days, reset old data).
     */
    init: async (req, res) => {
        const { days } = req.body;
        const userId = req.session.userId;

        if (!days || days < 1) {
            return res.status(400).json({ error: 'Number of days must be at least 1.' });
        }

        try {
            const trackerFile = path.join(DATA_DIR, `tracker_${userId}.json`);
            const data = {
                days: parseInt(days),
                tasks: []
            };

            await fileHandler.write(trackerFile, data);
            res.status(200).json({ message: 'Tracker initialized successfully.', data });
        } catch (error) {
            console.error('Init error:', error);
            res.status(500).json({ error: 'Internal server error during initialization.' });
        }
    },

    /**
     * Get all tracker data for the logged-in user.
     */
    getData: async (req, res) => {
        const userId = req.session.userId;
        const trackerFile = path.join(DATA_DIR, `tracker_${userId}.json`);

        try {
            let data = await fileHandler.read(trackerFile);
            if (!data) {
                // If tracker doesn't exist, return default structure
                data = { days: 0, tasks: [] };
            }
            res.status(200).json(data);
        } catch (error) {
            console.error('GetData error:', error);
            res.status(500).json({ error: 'Internal server error while fetching data.' });
        }
    },

    /**
     * Add a new task.
     */
    addTask: async (req, res) => {
        const { name } = req.body;
        const userId = req.session.userId;
        const trackerFile = path.join(DATA_DIR, `tracker_${userId}.json`);

        if (!name) {
            return res.status(400).json({ error: 'Task name is required.' });
        }

        try {
            let data = await fileHandler.read(trackerFile);
            if (!data) {
                return res.status(400).json({ error: 'Tracker not initialized.' });
            }

            const newTask = {
                id: Date.now(),
                name,
                progress: new Array(data.days).fill(0) // Initialize with 0s
            };

            data.tasks.push(newTask);
            await fileHandler.write(trackerFile, data);

            res.status(201).json({ message: 'Task added successfully.', task: newTask });
        } catch (error) {
            console.error('AddTask error:', error);
            res.status(500).json({ error: 'Internal server error while adding task.' });
        }
    },

    /**
     * Toggle task progress (day-wise).
     */
    toggle: async (req, res) => {
        const { taskId, dayIndex } = req.body;
        const userId = req.session.userId;
        const trackerFile = path.join(DATA_DIR, `tracker_${userId}.json`);

        if (taskId === undefined || dayIndex === undefined) {
            return res.status(400).json({ error: 'Task ID and day index are required.' });
        }

        try {
            let data = await fileHandler.read(trackerFile);
            if (!data) {
                return res.status(400).json({ error: 'Tracker not initialized.' });
            }

            const task = data.tasks.find(t => t.id == taskId);
            if (!task) {
                return res.status(404).json({ error: 'Task not found.' });
            }

            if (dayIndex < 0 || dayIndex >= data.days) {
                return res.status(400).json({ error: 'Invalid day index.' });
            }

            // Toggle progress (0 -> 1, 1 -> 0)
            task.progress[dayIndex] = task.progress[dayIndex] === 1 ? 0 : 1;

            await fileHandler.write(trackerFile, data);
            res.status(200).json({ message: 'Progress toggled successfully.', task });
        } catch (error) {
            console.error('Toggle error:', error);
            res.status(500).json({ error: 'Internal server error while toggling progress.' });
        }
    },

    /**
     * Add a new day column.
     */
    addDay: async (req, res) => {
        const userId = req.session.userId;
        const trackerFile = path.join(DATA_DIR, `tracker_${userId}.json`);

        try {
            let data = await fileHandler.read(trackerFile);
            if (!data) {
                return res.status(400).json({ error: 'Tracker not initialized.' });
            }

            data.days += 1;
            data.tasks.forEach(task => {
                task.progress.push(0); // Append 0 to all tasks
            });

            await fileHandler.write(trackerFile, data);
            res.status(200).json({ message: 'Day added successfully.', data });
        } catch (error) {
            console.error('AddDay error:', error);
            res.status(500).json({ error: 'Internal server error while adding day.' });
        }
    },

    /**
     * Remove last day (min 1).
     */
    removeDay: async (req, res) => {
        const userId = req.session.userId;
        const trackerFile = path.join(DATA_DIR, `tracker_${userId}.json`);

        try {
            let data = await fileHandler.read(trackerFile);
            if (!data) {
                return res.status(400).json({ error: 'Tracker not initialized.' });
            }

            if (data.days <= 1) {
                return res.status(400).json({ error: 'Minimum 1 day required.' });
            }

            data.days -= 1;
            data.tasks.forEach(task => {
                task.progress.pop(); // Remove last index from all tasks
            });

            await fileHandler.write(trackerFile, data);
            res.status(200).json({ message: 'Day removed successfully.', data });
        } catch (error) {
            console.error('RemoveDay error:', error);
            res.status(500).json({ error: 'Internal server error while removing day.' });
        }
    },

    /**
     * Delete a task.
     */
    deleteTask: async (req, res) => {
        const { taskId } = req.body;
        const userId = req.session.userId;
        const trackerFile = path.join(DATA_DIR, `tracker_${userId}.json`);

        if (taskId === undefined) {
            return res.status(400).json({ error: 'Task ID is required.' });
        }

        try {
            let data = await fileHandler.read(trackerFile);
            if (!data) {
                return res.status(400).json({ error: 'Tracker not initialized.' });
            }

            // Ensure taskId is compared correctly (it might be a string from req.body)
            const idToDelete = Number(taskId);
            data.tasks = data.tasks.filter(t => Number(t.id) !== idToDelete);

            await fileHandler.write(trackerFile, data);
            res.status(200).json({ message: 'Task deleted successfully.', data });
        } catch (error) {
            console.error('DeleteTask error:', error);
            res.status(500).json({ error: 'Internal server error while deleting task.' });
        }
    },

    /**
     * Reset tracker.
     */
    reset: async (req, res) => {
        const userId = req.session.userId;
        const trackerFile = path.join(DATA_DIR, `tracker_${userId}.json`);

        try {
            let data = await fileHandler.read(trackerFile);
            if (!data) {
                return res.status(400).json({ error: 'Tracker not initialized.' });
            }

            data.tasks = [];

            await fileHandler.write(trackerFile, data);
            res.status(200).json({ message: 'Tracker reset successfully.', data });
        } catch (error) {
            console.error('Reset error:', error);
            res.status(500).json({ error: 'Internal server error while resetting tracker.' });
        }
    },

    /**
     * Return chart data (bar + line).
     */
    getCharts: async (req, res) => {
        const userId = req.session.userId;
        const trackerFile = path.join(DATA_DIR, `tracker_${userId}.json`);

        try {
            const data = await fileHandler.read(trackerFile);
            if (!data || data.tasks.length === 0) {
                return res.status(200).json({
                    bar: { labels: [], datasets: [] },
                    line: { labels: [], datasets: [] }
                });
            }

            // Bar Chart: % completion per task
            const barLabels = data.tasks.map(t => t.name);
            const barData = data.tasks.map(t => {
                const done = t.progress.filter(p => p === 1).length;
                const total = data.days;
                return total > 0 ? (done / total) * 100 : 0;
            });

            // Line Chart: Number of completed tasks per day
            const lineLabels = Array.from({ length: data.days }, (_, i) => `Day ${i + 1}`);
            const lineData = Array.from({ length: data.days }, (_, i) => {
                return data.tasks.filter(t => t.progress[i] === 1).length;
            });

            res.status(200).json({
                bar: {
                    labels: barLabels,
                    datasets: [{
                        label: 'Completion %',
                        data: barData,
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                line: {
                    labels: lineLabels,
                    datasets: [{
                        label: 'Tasks Completed',
                        data: lineData,
                        fill: false,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        tension: 0.1
                    }]
                }
            });
        } catch (error) {
            console.error('GetCharts error:', error);
            res.status(500).json({ error: 'Internal server error while fetching chart data.' });
        }
    }
};

module.exports = trackerController;
