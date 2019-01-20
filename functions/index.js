// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
const { Card, Suggestion } = require('dialogflow-fulfillment');

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

  function mentorSearch(agent) {
    console.log("mentor");
    console.log(request.body.queryResult.languageCode);
    agent.add(`This is their contact: mentor.contact. Would you like to call her?`);
  }

  function transferCall(agent) {
    console.log("transferCall");
    console.log(request.body.queryResult.sentimentAnalysisResult);
    agent.add(`Transfering you now!`);
  }

  function goodbye(agent) {
    agent.add(`Cheers, see you!`);
  }

  // transfers the call in case someone says something negative
  if (request.body.queryResult.sentimentAnalysisResult.queryTextSentiment.score < 0) {
    let callEvent = agent.setFollowupEvent('telephone-event');
  }

  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Mentor Search', mentorSearch);
  intentMap.set('Transfer Call Escalation to Human', transferCall);
  intentMap.set('Goodbye', goodbye);
  agent.handleRequest(intentMap);
});