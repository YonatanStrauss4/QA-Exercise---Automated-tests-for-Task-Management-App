const fs = require('fs');
const axios = require('axios');

describe('Task Management priority order test', () => {
    const apiUrl = 'http://localhost:3000/api/tasks';
    let logFile = 'priority_order_log.txt';

    // Ensure all async operations are complete after all tests
    afterAll(async () => {
        await axios.get(apiUrl); 
    });

    /**
     * Deletes all tasks from the API to reset the task list.
     * This ensures each test iteration starts with an empty database.
     */    
    const resetTasks = async () => {
        try {
            const response = await axios.get(apiUrl);
            const tasks = response.data;
            for (const task of tasks) {
                await axios.delete(`${apiUrl}/${task.id}`);
            }
            logAction("All tasks deleted, database reset.");
        } catch (error) {
            logError("Failed to reset tasks.");
            throw error;
        }
    };

    /**
     * Logs an action message with a timestamp to the log file.
     * @param {string} message - The action message to log.
     */
    const logAction = (message) => {
        const timestamp = new Date().toISOString();
        fs.appendFileSync(logFile, `[${timestamp}] [ACTION] ${message}\n`);
    };

    /**
     * Logs an error message with a timestamp to the log file.
     * @param {string} message - The error message to log.
     */
    const logError = (message) => {
        const timestamp = new Date().toISOString();
        fs.appendFileSync(logFile, `[${timestamp}] [ERROR] ${message}\n`);
    };

    /**
     * Generates a random string of specified length.
     * @param {number} min - Minimum length of the string.
     * @param {number} max - Maximum length of the string.
     * @returns {string} A randomly generated string.
     */
    const getRandomString = (min, max) => {
        const length = Math.floor(Math.random() * (max - min + 1)) + min;
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}|:<>?-=[]\\;',./`~\" ";
        return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
    };

    /**
     * Generates a random date within a range of ±5 years from the current date.
     * The date is formatted as "DD/MM/YYYY".
     *
     * @returns {string} A string representing the randomly generated date in the format "DD/MM/YYYY".
     */
    const getRandomDate = () => {
        const now = new Date();
        const randomYears = Math.floor(Math.random() * 10) - 5;
        const randomDate = new Date();
        randomDate.setFullYear(now.getFullYear() + randomYears);
        randomDate.setMonth(Math.floor(Math.random() * 12));
        randomDate.setDate(Math.floor(Math.random() * 28) + 1);

        const day = String(randomDate.getDate()).padStart(2, '0');
        const month = String(randomDate.getMonth() + 1).padStart(2, '0');
        const year = randomDate.getFullYear();

        return `${day}/${month}/${year}`;
    };

    /**
     * Checks if tasks are sorted by priority.
     * @param {Array} tasks - The array of tasks to check.
     * @returns {boolean} True if tasks are sorted by priority, false otherwise.
     */
    const areTasksSortedByPriority = (tasks) => {
        const priorityOrder = { 'high': 1, 'medium': 2, 'low': 3 };
        for (let i = 1; i < tasks.length; i++) {
            if (priorityOrder[tasks[i - 1].priority] > priorityOrder[tasks[i].priority]) {
                return false;
            }
        }
        return true;
    };

    /**
     * Test to check if tasks are sorted by priority.
     */
    test('Check if tasks are sorted by priority', async () => {
        for (let iteration = 0; iteration < 20; iteration++) {
            // Reset log file
            fs.writeFileSync(logFile, 'Completion Test Log:\n'); 
            
            // Log the current iteration
            fs.appendFileSync(logFile, `\n\n=== Iteration ${iteration} ===\n\n`);

            // Reset all tasks before starting
            await resetTasks();

            // Insert tasks with random priorities
            const priorities = ['high', 'medium', 'low'];
            for (let i = 0; i < 10; i++) {
                const newTask = {
                    id: i + 1,
                    title: getRandomString(1, 20),
                    description: getRandomString(0, 50),
                    priority: priorities[Math.floor(Math.random() * 3)],
                    completed: false,
                    dueDate: getRandomDate(),
                };
                await axios.post(apiUrl, newTask);
            }

            // Fetch all tasks from the API
            const allTasksResponse = await axios.get(apiUrl);
            const allTasks = allTasksResponse.data;

            // Check if tasks are sorted by priority
            const sorted = areTasksSortedByPriority(allTasks);
            try {
                expect(sorted).toBe(true);
                logAction("Tasks are sorted by priority.");
            } catch (error) {
                logError("Tasks are not sorted by priority:");
                allTasks.forEach(task => {
                    logAction(`Task ID: ${task.id}, Title: ${task.title}, Priority: ${task.priority}`);
                });
                throw error;
            }

            // Delete five random tasks
            for (let i = 0; i < 5; i++) {
                const randomTaskIndex = Math.floor(Math.random() * allTasks.length);
                const taskToDelete = allTasks.splice(randomTaskIndex, 1)[0];
                await axios.delete(`${apiUrl}/${taskToDelete.id}`);
            }

            // Fetch all tasks from the API again
            const remainingTasksResponse = await axios.get(apiUrl);
            const remainingTasks = remainingTasksResponse.data;

            // Check if remaining tasks are sorted by priority
            const sortedAfterDeletion = areTasksSortedByPriority(remainingTasks);
            try {
                expect(sortedAfterDeletion).toBe(true);
                logAction("Remaining tasks are sorted by priority after deletion.");
            } catch (error) {
                logError("Remaining tasks are not sorted by priority after deletion:");
                remainingTasks.forEach(task => {
                    logAction(`Task ID: ${task.id}, Title: ${task.title}, Priority: ${task.priority}`);
                });
                throw error;
            }
        }
    }, 60000); // Extended timeout for the test

});
