// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
const { Card, Suggestion } = require('dialogflow-fulfillment');

// Firebase real time database info
var admin = require(`firebase-admin`);
admin.initializeApp({
  databaseURL: `https://mentor-search-demo.firebaseio.com/`
});
var db = admin.database();

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  function welcome(agent) {
    agent.add(`Greetings! What mentor are you looking for?`);
  }

  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  function transferCall(agent) {
    agent.add(`Transfering you now!`);
  }

  function goodbye(agent) {
    agent.add(`Cheers, see you!`);
  }

  // transfers the call in case someone says something negative
  if (request.body.queryResult.sentimentAnalysisResult.queryTextSentiment.score < 0) {
    console.log(request.body.queryResult.sentimentAnalysisResult.queryTextSentiment.score);
    let callEvent = agent.setFollowupEvent('telephone-event');
  } else {
    console.log(request.body.queryResult.sentimentAnalysisResult.queryTextSentiment.score);
  }

  // Fetching information from firebase real time database
  // function searchName(agent) {
  //   var results = db.ref("myDatabase");
  //   results
  //     .orderByChild("Name")
  //     .startAt(agent.parameters.person_name)
  //     .endAt(`${agent.parameters.person_name}~`)
  //     .on("value", function(snapshot) {
  //       snapshot.forEach(function(data) {
  //         console.log(`The mentor's e-mail is ${data.val().Email}`);
  //         agent.add(`The mentor's e-mail is ${data.val().Email}`);
  //       });
  //     });
  // }

  // function searchSkill(agent) {
  //   var scoresRef = db.ref("myDatabase");
  //   scoresRef
  //     .orderByChild("Skill")
  //     .equalTo(agent.parameters.person_skill)
  //     .on("value", function(snapshot) {
  //       snapshot.forEach(function(data) {
  //         agent.add(
  //           "The mentor is an expert at " +
  //             data.val().Skill +
  //             " is " +
  //             data.val().Name
  //         );
  //       });
  //     });
  // }

  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Mentor Search', mentorSearch);
  intentMap.set('Transfer Call Escalation to Human', transferCall);
  intentMap.set('Goodbye', goodbye);
  agent.handleRequest(intentMap);
});