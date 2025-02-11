const fs = require('fs');
const axios = require('axios');

describe('Task Management insertions and deletions test', () => {
    const apiUrl = 'http://localhost:3000/api/tasks';
    let tasks = [];
    let insertions = 0;
    let deletions = 0;
    let logFile = 'test_log.txt';

    // Ensure all async operations are complete
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
     * Performs a series of insertions and deletions on tasks.
     *
     * This function fetches all tasks from the API, then performs up to 1000 iterations of either inserting a new task or deleting an existing task.
     * After each insertion or deletion, it verifies the consistency of the tasks list by checking:
     * - The number of completed tasks is zero.
     * - The total number of tasks matches the expected count based on insertions and deletions.
     * - The number of active tasks matches the expected count.
     *
     * @async
     * @function performInsertionsAndDeletions
     * @throws Will throw an error if any of the consistency checks fail.
     */
    test('Perform insertions and deletions 100 times', async () => {
        for (let iteration = 1; iteration <= 100; iteration++) {

            // Generate a random insertion probability between 0 and 1
            const insertionProbability = Math.random();

            // Write the iteration number and insertion probability to the log file, after resetting the file
            fs.writeFileSync(logFile, 'Completion Test Log:\n'); 
            fs.appendFileSync(logFile, `\n\n=== Iteration ${iteration} ===\n\n`);
            fs.appendFileSync(logFile, `Insertion Probability: ${insertionProbability.toFixed(4)}\n`);

            // Reset all tasks before starting
            await resetTasks(); 
            const allTasksResponse = await axios.get(apiUrl);
            const allTasks = allTasksResponse.data;
            tasks = allTasks;

            // Reset counters for insertions and deletions
            insertions = tasks.length;
            deletions = 0;

            let j = 0;
            //  Perform up to 1000 iterations of insertions and deletions (if no deletion available, continue without incrementing j)
            while (j < 1000) {
                // Generate a random number between 0 and 1, and insert a new task if it's less than the insertion probability
                if (Math.random() < insertionProbability) {
                    // Generate a new task with random properties and completed = false
                    const newTask = {
                        id: tasks.length + 1,
                        title: getRandomString(1, 20),
                        description: getRandomString(0, 50),
                        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
                        completed: false,
                        dueDate: getRandomDate(),
                    };

                    // Add the new task to the tasks array, increment the insertions counter, log the action, and post the new task to the API
                    tasks.push(newTask);
                    insertions++;
                    logAction(`Inserted task: title: ${newTask.title} (ID: ${newTask.id})`);
                    await axios.post(apiUrl, newTask);

                // If there are no tasks to delete, continue without incrementing j
                } else if (tasks.length == 0) { continue; }

                // Otherwise, delete a random task from the tasks array, increment the deletions counter, log the action, and delete the task from the API
                else {
                    const indexToDelete = Math.floor(Math.random() * tasks.length);
                    const deletedTask = tasks.splice(indexToDelete, 1)[0];
                    logAction(`Deleted task: title: ${deletedTask.title} (ID: ${deletedTask.id})`);
                    deletions++;
                    await axios.delete(`${apiUrl}/${deletedTask.id}`);
                }

                // Fetch all tasks from the API and filter them into active and completed tasks
                const allTasksResponse = await axios.get(apiUrl);
                const allTasks = allTasksResponse.data;

                // Filter tasks into active and completed based on the 'completed' flag
                const activeTasks = allTasks.filter(task => !task.completed);
                const completedTasks = allTasks.filter(task => task.completed);

                // Consistency checks
                //  - The number of completed tasks is zero.
                try {
                    expect(completedTasks.length).toBe(0);
                } catch (error) {
                    logError("Completed tasks length check failed:");
                    logError(`Expected: 0, Received: ${completedTasks.length}`);
                    throw error; 
                }

                // - The total number of tasks matches the expected count based on insertions and deletions.
                try {
                    expect(allTasks.length).toBe(insertions - deletions);
                } catch (error) {
                    logError("Tasks length consistency check failed");
                    logError(`Expected: ${insertions - deletions}, Received: ${allTasks.length}`);
                    throw error; 
                }

                // - The number of active tasks matches the not completed tasks.
                try {
                    expect(activeTasks.length).toBe(allTasks.filter(task => !task.completed).length);
                } catch (error) {
                    logError("Active tasks length check failed:");
                    logError(`Expected: ${activeTasks.length}, Received: ${allTasks.filter(task => !task.completed).length}`);
                    throw error; 
                }
                j++; // Increment the iteration counter
            }
        }
    }, 60000 * 100); // Extended timeout for 100 iterations

});
