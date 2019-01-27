// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');

// Firebase real time database info
var admin = require(`firebase-admin`);
admin.initializeApp({
  databaseURL: `https://mentor-search-demo.firebaseio.com/`
});
var db = admin.database();

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });

  function welcome(agent) {
    // TODO: Add also a text response to be seen in the dialogflow console
    agent.add(`Webhook: welcome`);
  }

  function fallback(agent) {
    // transfers the call in case someone says something negative
    // TODO Probably find a best practice -  not to show the phone number in full here
    if (request.body.queryResult.sentimentAnalysisResult && request.body.queryResult.sentimentAnalysisResult.queryTextSentiment && request.body.queryResult.sentimentAnalysisResult.queryTextSentiment.score < 0) {
      console.log(request.body.queryResult.sentimentAnalysisResult.queryTextSentiment.score);
      response.json({
        'fulfillmentText': `I am sorry you feel this way`,
        "fulfillmentMessages": [
          {
            "platform": "TELEPHONY",
            "telephonySynthesizeSpeech": {
              "text": "I am sorry you feel this way, let me transfer you to a real person!"
            }
          },
          {
            "platform": "TELEPHONY",
            "telephonyTransferCall": {
              "phoneNumber": "+12097484428"
            }
          },
        ]
      });
    }
    else {
      agent.add(`Webhook: fallback`);
    }
  }

  function transferCall(agent) {
    // TODO: Add also a text response to be seen in the dialogflow console
    agent.add(`Webhook: Transfer`);
  }

  function goodbye(agent) {
    // TODO: Add also a text response to be seen in the dialogflow console
    agent.add(`Webhook: bye`);
  }

  // Fetching information from firebase real time database
  // Error: Sometimes it fetches the mentor, sometimes it doesn't
  // TODO Adapt code to use firestore instead..
  function mentorSearch(agent) {
    const name = agent.parameters['given-name'];
    console.log(request.body.queryResult.parameters['given-name']);
    var results = db.ref("techWomenCollection");
    results
      .orderByChild("Name")
      .startAt(name)
      .endAt(`${name}~`)
      .on("value", function (snapshot) {
        snapshot.forEach(function (data) {
          agent.add("The mentor " + data.val().Name + "'s twitter handle is " + data.val().Twitter);
        });
      });
    // TODO: Add also a text response to be seen in the dialogflow console
    agent.add(`Thanks for filling in the information!`);
  }

  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Mentor Search', mentorSearch);
  intentMap.set('Transfer Call Escalation to Human', transferCall);
  intentMap.set('Goodbye', goodbye);
  agent.handleRequest(intentMap);
});