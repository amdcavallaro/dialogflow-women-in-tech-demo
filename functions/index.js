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
  }

  // Fetching information from firebase real time database
  function mentorSearch(agent) {
    const name = agent.parameters['given-name'];
    // const nametwo = request.body.queryResult.parameters['given-name'];
    agent.add(`Thanks for filling in the information!`);
    console.log(request.body.queryResult.parameters['given-name']);
    var results = db.ref("techWomenCollection");
    results
      .orderByChild("Name")
      .startAt(name)
      .endAt(`${name}~`)
      .on("value", function (snapshot) {
        snapshot.forEach(function (data) {
          agent.add("The " + data.val().Name + "'s twitter handle is " + data.val().Twitter);
        });
      });
  }

  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Mentor Search', mentorSearch);
  intentMap.set('Transfer Call Escalation to Human', transferCall);
  intentMap.set('Goodbye', goodbye);
  agent.handleRequest(intentMap);
});