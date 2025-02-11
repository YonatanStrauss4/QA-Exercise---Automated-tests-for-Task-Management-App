const fs = require('fs');
const axios = require('axios');

/**
 * Task Completion Tracking Test Suite
 * -----------------------------------
 * This test runs 100 iterations of random task operations to ensure that the task management API correctly
 * handles task insertions, deletions, completions, and reactivations while maintaining accurate counts.
 *
 * Operations:
 * - Insert a new task with random attributes (25% probability per iteration)
 * - Delete an existing task (25% probability per iteration)
 * - Mark an active task as completed (25% probability per iteration)
 * - Mark a completed task as active again (25% probability per iteration)
 */

describe('Task Completion Tracking Test (Repeated 100 times)', () => {
    const apiUrl = 'http://localhost:3000/api/tasks';
    let logFile = 'completion_test_log.txt';

    // Ensure all async operations are complete
    afterAll(async () => {
        await axios.get(apiUrl); 
    });

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
     * Generates a random string of a specified length.
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
     * Generates a random date within +/- 5 years from the current date.
     * @returns {string} A randomly generated date in DD/MM/YYYY format.
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
     * Main test execution loop.
     * Runs 100 iterations of the task tracking test.
     */
    test('Run completion tracking test 100 times', async () => {
        fs.writeFileSync(logFile, 'Completion Test Log:\n'); // Reset log file

        for (let iteration = 1; iteration <= 100; iteration++) {
            fs.appendFileSync(logFile, `\n\n=== Iteration ${iteration} ===\n\n`);
            await resetTasks(); // Reset all tasks before starting
            let tasks = [];
            let completedCount = 0;
            let activeCount = 0;

            for (let i = 0; i < 500; i++) {
                const randomAction = Math.random();
                if (randomAction < 0.25) {
                    // Insert a new task
                    const newTask = {
                        id: tasks.length + 1,
                        title: getRandomString(1, 20),
                        description: getRandomString(0, 50),
                        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
                        completed: false,
                        dueDate: getRandomDate(),
                    };

                    tasks.push(newTask);
                    activeCount++;
                    logAction(`Inserted task: ${newTask.title} (ID: ${newTask.id})`);
                    await axios.post(apiUrl, newTask);

                } else if (tasks.length > 0 && randomAction < 0.5) {
                    // Delete a task
                    const indexToDelete = Math.floor(Math.random() * tasks.length);
                    const deletedTask = tasks.splice(indexToDelete, 1)[0];
                    logAction(`Deleted task: ${deletedTask.title} (ID: ${deletedTask.id})`);
                    if (deletedTask.completed) {
                        completedCount--;
                    } else {
                        activeCount--;
                    }
                    await axios.delete(`${apiUrl}/${deletedTask.id}`);
                } else if (randomAction < 0.75) {
                    // Complete an active task
                    const activeTasks = tasks.filter(task => !task.completed);
                    if (activeTasks.length === 0) continue;

                    const taskToComplete = activeTasks[Math.floor(Math.random() * activeTasks.length)];
                    taskToComplete.completed = true;
                    await axios.put(`${apiUrl}/${taskToComplete.id}`, { completed: true });

                    completedCount++;
                    activeCount--;
                    logAction(`Completed task: ${taskToComplete.title} (ID: ${taskToComplete.id})`);
                } else {
                    // Reactivate a completed task
                    const completedTasks = tasks.filter(task => task.completed);
                    if (completedTasks.length === 0) continue;

                    const taskToActivate = completedTasks[Math.floor(Math.random() * completedTasks.length)];
                    taskToActivate.completed = false;
                    await axios.put(`${apiUrl}/${taskToActivate.id}`, { completed: false });

                    completedCount--;
                    activeCount++;
                    logAction(`Activated task: ${taskToActivate.title} (ID: ${taskToActivate.id})`);
                }
            }
        }
    }, 60000 * 100); // Extended timeout for 100 iterations
});
