const fs = require('fs');
const axios = require('axios');

/**
 * Task Completion Tracking Test Suite
 * -----------------------------------
 * This test runs 20 iterations of random task operations to ensure that the task management API correctly
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
    test('Run completion tracking test 20 times', async () => {
    
        for (let iteration = 1; iteration <= 20; iteration++) {
            // Reset log file
            fs.writeFileSync(logFile, 'Completion Test Log:\n'); 

            // Log the current iteration
            fs.appendFileSync(logFile, `\n\n=== Iteration ${iteration} ===\n\n`);

            // Reset all tasks before starting
            await resetTasks(); 
            let tasks = [];

            // Fetch initial tasks from the API to get the correct counts
            try {
                const response = await axios.get(apiUrl);
                const tasks = response.data;
                completedCount = tasks.filter(task => task.completed).length;
                activeCount = tasks.filter(task => !task.completed).length;
            } catch (error) {
                logError("Failed to fetch initial tasks.");
                throw error;
            }

            // Perform 500 random actions
            let j = 0;
            while (j < 1000) {
                // Randomly choose an action to perform
                const randomAction = Math.random();
                if (randomAction < 0.25) {

                    // Insert a new task with random attributes
                    const newTask = {
                        id: tasks.length + 1,
                        title: getRandomString(1, 20),
                        description: getRandomString(0, 50),
                        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
                        completed: false,
                        dueDate: getRandomDate(),
                    };

                    // Update local task list, increment counters, log action, and send POST request
                    tasks.push(newTask);
                    activeCount++;
                    logAction(`Inserted task: ${newTask.title} (ID: ${newTask.id})`);
                    await axios.post(apiUrl, newTask);
                } 

                // Delete an existing random task
                else if (0.25 <= randomAction && randomAction < 0.5) {

                    // Skip if no tasks available and dont increment j
                    if (tasks.length == 0) continue;

                    // Delete a random task from the list, we doing the deletion as if the app works correctly
                    const indexToDelete = Math.floor(Math.random() * tasks.length);
                    const deletedTask = tasks.splice(indexToDelete, 1)[0];
                    logAction(`Deleted task: ${deletedTask.title} (ID: ${deletedTask.id}) completed: ${deletedTask.completed}`);

                    // Update counters and send DELETE request
                    if (deletedTask.completed) {
                        completedCount--;
                    } else {
                        activeCount--;
                    }
                    await axios.delete(`${apiUrl}/${deletedTask.id}`);
                } 
                
                // Complete an active task
                if (randomAction < 0.75) {
                    const activeTasks = tasks.filter(task => !task.completed);

                    // Skip if no active tasks available and don't increment j
                    if (activeTasks.length === 0) continue;

                    // Mark a random active task as completed
                    const taskToComplete = activeTasks[Math.floor(Math.random() * activeTasks.length)];
                    taskToComplete.completed = true;

                    // Update all tasks with the same ID as completed
                    for (const task of tasks) {
                        if (task.id === taskToComplete.id) {
                            task.completed = true;
                            await axios.put(`${apiUrl}/${task.id}`, { completed: true });
                        }
                    }

                    // Update counters and log action
                    completedCount++;
                    activeCount--;
                    logAction(`Completed task: ${taskToComplete.title} (ID: ${taskToComplete.id})`);

                } else {
                    // Reactivate a completed task
                    const completedTasks = tasks.filter(task => task.completed);

                    // Skip if no completed tasks available and don't increment j
                    if (completedTasks.length === 0) continue;

                    // Mark a random completed task as active
                    const taskToActivate = completedTasks[Math.floor(Math.random() * completedTasks.length)];
                    taskToActivate.completed = false;
                    await axios.put(`${apiUrl}/${taskToActivate.id}`, { completed: false });

                    // Update all tasks with the same ID as not completed
                    for (const task of tasks) {
                        if (task.id === taskToActivate.id) {
                            task.completed = false;
                            await axios.put(`${apiUrl}/${task.id}`, { completed: false });
                        }
                    }

                    // Update counters and log action
                    completedCount--;
                    activeCount++;
                    logAction(`Activated task: ${taskToActivate.title} (ID: ${taskToActivate.id})`);
                }


                // Fetch all tasks from the API and filter them into active and completed tasks
                const allTasksResponse = await axios.get(apiUrl);
                const allTasks = allTasksResponse.data;
                
                // Verify counts
                // Check that the number of completed tasks matches the expected count
                try {
                    expect(allTasks.filter(task => task.completed).length).toBe(completedCount);
                } catch (error) {
                    logError(`Completed count mismatch. Expected: ${completedCount}, Found: ${allTasks.filter(task => task.completed).length}`);
                    throw error;
                }

                // Check that the number of active tasks matches the expected count
                try {
                    expect(allTasks.filter(task => !task.completed).length).toBe(activeCount);
                } catch (error) {
                    logError(`Active count mismatch. Expected: ${activeCount}, Found: ${allTasks.filter(task => !task.completed).length}`);
                    throw error;
                }
                j++;
            }
        }
    }, 60000 * 100); // Extended timeout for 100 iterations
});
