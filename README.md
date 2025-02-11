# QA-Exercise---Automated-tests-for-Task-Management-App
## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Installation and Usage](#installation-and-usage)
- [Tests Description](#Tests-Description)

## Introduction
This repository contains automated tests for a Task Management App. The tests are designed to ensure the app functions correctly and meets all specified requirements.

## Features
- Automated test scripts for various functionalities of the Task Management App
- Easy to run
- Detailed test reports

## Installation and Usage
1. Clone the repository
   
2. Navigate to the project directory
 
3. Install the required dependencies (like jest), make sure you have Node.js on your machine

4. Build the project with: `npm start`

4. Open a new cmd in the terminal so you can run the tests

5. Run the test you choose: `npm test -- tests/---name of test you chose---`
   
## Tests Description

1. `insertionsAndDeletions` test is meant to perform 20 rounds of 1000 random insertions/deletions to check if the app backend keeps track of the correct number of tasks. The results are tracked in the `insertions_and_deletion_log.txt` file.

2. `completeAndActive` test is meant to perform 20 rounds of 1000 random insertions/deletions/completions/activations to check if the app backend keeps track of the correct number of tasks in each list. The results are tracked in the `completion_test_log.txt` file.

3. `priorityOrder` test is meant to perform 20 rounds of first adding 10 random tasks and checking for the priority order, where high should be first, then medium, and then low. Then, delete 5 random tasks and check for the priority order again. The results are tracked in the `priority_order.txt` file.

