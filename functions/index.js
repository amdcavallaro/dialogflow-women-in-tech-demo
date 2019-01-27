// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

const db = admin.firestore();
const collectionRef = db.collection('mentors');

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });

  function welcome(agent) {
    response.json({
      "fulfillmentMessages": [
        {
          "text": {
            "text": [
              "Greetings! What mentor are you looking for? You can search by name, city or topic."
            ]
          }
        },
        {
          "platform": "TELEPHONY",
          "telephonySynthesizeSpeech": {
            "text": "Greetings! What mentor are you looking for? You can search by name, city or topic."
          }
        }
      ]
    });
  }

  function fallback(agent) {
    // transfers the call in case someone says something negative
    // TODO Probably find a best practice -  not to show the phone number in full here
    if (request.body.queryResult.sentimentAnalysisResult && request.body.queryResult.sentimentAnalysisResult.queryTextSentiment && request.body.queryResult.sentimentAnalysisResult.queryTextSentiment.score < 0) {
      console.log(request.body.queryResult.sentimentAnalysisResult.queryTextSentiment.score);
      response.json({
        "fulfillmentMessages": [
          {
            "text": {
              "text": [
                "I am sorry you feel this way, let me transfer you to a real person!"
              ]
            }
          },
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
      response.json({
        "fulfillmentMessages": [
          {
            "text": {
              "text": [
                "I'm sorry I didn't catch that, would you prefer to be transferred to the main line?"
              ]
            }
          },
          {
            "platform": "TELEPHONY",
            "telephonySynthesizeSpeech": {
              "text": "I'm sorry I didn't catch that, would you prefer to be transferred to the main line?"
            }
          }
        ]
      });
    }
  }

  function transferCall(agent) {

    response.json({
      "fulfillmentMessages": [
        {
          "text": {
            "text": [
              "Transfering you now."
            ]
          }
        },
        {
          "platform": "TELEPHONY",
          "telephonySynthesizeSpeech": {
            "text": "Transfering you now"
          }
        }
      ]
    });
  }

  function goodbye(agent) {
    response.json({
      "fulfillmentText": "Cheers, good bye!",
      "fulfillmentMessages": [
        {
          "text": {
            "text": [
              "Cheers, good bye!"
            ]
          }
        },
        {
          "platform": "TELEPHONY",
          "telephonySynthesizeSpeech": {
            "text": "Cheers, good bye"
          }
        }
      ]
    });
  }

  // Fetching information from firebase real time database
  // Improve this search method completely
  function mentorSearch(agent) {
    const name = agent.parameters['given-name'];
    const city = agent.parameters['geo-city'];
    const topic = agent.parameters['topic'];

    const term = name.toLowerCase();
    const termRef = collectionRef.doc(`${term}`);

    if (name == null && topic == null && city == null) {
      agent.add("I'm sorry, I didn't understand your request. Please specify a name, topic or city.");
    }

    return termRef.get()
      .then((snapshot) => {
        const { Location, Topic } = snapshot.data();
        agent.add(`Here you go, ${Location}, ${Topic}. ` +
          `Would you like to talk to a real person?`);
      }).catch((e) => {
        console.log('error:', e);
        agent.add('Sorry, try again and tell me another mentor.');
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