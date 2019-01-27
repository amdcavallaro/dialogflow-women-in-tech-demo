
# Dialogflow: Women Mentor Search and Escalation to a Human 

This project consists of a simple Dialogflow agent, deployed to firebase cloud functions that shows the use of dialogflow, google cloud natural language api, sentiment analysis and firebase.

This project is designed as a demo, not as a finished solution.

## Overview

In this repo you can find a node.js demo for presentation on the 28/01/2019 for [GDG Cloud London](https://www.gdgcloud.com)

If you'd like to find a .net alternative by Jon Skeet you can find it [here](https://github.com/jskeet/DemoCode/pull/21/files).


## Running Steps

1. Sign-up or Log-in to your Dialogflow account.
2. In Dialogflow's console, select Create Agent in the left navigation and fill in the required fields and Save.
3. Name for your agent, i.e. `mentor-search-game `
4. Select Create.
5. Go to the settings ⚙ > Export and Import tab > Restore from zip.
Upload the `mentor-search-demo.zip` file located in this repo.
6. git clone `https://github.com/amdcaruso/dialogflow-women-in-tech-demo.git`
7. [Download and install Node.js](https://nodejs.org/)
8. [Install Firebase](https://developers.google.com/actions/dialogflow/deploy-fulfillment)
9. Within the repo directory, `$npm install` to install all of the project's dependencies. 

## Technology Stack
1. Node.js
2. Dialogflow
3. Firebase
4. Firestore
5. Google Cloud Platform

## Credit
The list used in this project was imported from [Lady Leet's #Fempire](https://github.com/fempire/women-tech-speakers-organizers)


## Demo

The demo can be found [here](https://bot.dialogflow.com/0320156d-2248-470b-a834-6f6919137f8c)

## To be improved

- [x] Add the Firebase search by region or name
- [x] Add Firestore
- [ ] Once the telephone gateway fix has been merged in official dialogflow codebase, remove the `response.json` and add `agent.add`
