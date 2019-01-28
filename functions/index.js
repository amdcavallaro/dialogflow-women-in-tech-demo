// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

const db = admin.firestore();
// const firestore = firebase.firestore();
const settings = { timestampsInSnapshots: true };
// firestore.settings(settings);
const collectionRef = db.collection('mentors');

// TODO Probably find a best practice - not to show the phone number in full here
const phone_number = "+12097484428";

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });

  // the welcome webhook response
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

  // Fallback webhook response
  // It transfers the call in case someone says something negative
  function fallback(agent) {
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
              "phoneNumber": phone_number
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

  // Transfer call webhook response
  // It transfers the call to another phone number
  // It is currently not being used, as the response is available via the dialogflow console
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
        },
        {
          "platform": "TELEPHONY",
          "telephonyTransferCall": {
            "phoneNumber": phone_number
          }
        },
      ]
    });
  }

  function goodbye(agent) {
    response.json({
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

  // The webhook response for searching the mentor
  // It fetches information from firebase real time database
  function getMentorSearchResult(agent) {
    let name = agent.parameters['given-name'];
    let topic = agent.parameters['topic'];
    let city = agent.parameters['geo-city'];

    console.log(`Search: name=${name}; topic=${topic}; city=${city}`);

    // If no name, topic and city are specified, return a message to the user
    if (!name && !topic && !city) {
      response.json({
        "fulfillmentMessages": [
          {
            "text": {
              "text": [
                "I'm sorry, I didn't understand your request. Please specify a name, topic or city."
              ]
            }
          },
          {
            "platform": "TELEPHONY",
            "telephonySynthesizeSpeech": {
              "text": "I'm sorry, I didn't understand your request. Please specify a name, topic or city."
            }
          }
        ]
      });
    }
    else {
      let query = collectionRef;

      if (name) {
        query = query.where('Name', '>=', name).where('Name', '<=', name + '~');
      }

      if (topic) {
        query = query.where('Topic', 'array-contains', topic.toLowerCase());
      }

      if (city) {
        query = query.where('Location', '==', city.toLowerCase());
      }

      return query.get()
        .then((querySnapshot) => {
          if (querySnapshot.empty) {
            response.json({
              "fulfillmentMessages": [
                {
                  "text": {
                    "text": [
                      "I'm sorry.  I didn't find any mentors for your search"
                    ]
                  }
                },
                {
                  "platform": "TELEPHONY",
                  "telephonySynthesizeSpeech": {
                    "text": "I'm sorry.  I didn't find any mentors for your search"
                  }
                }
              ]
            });
          }

          let mentors = querySnapshot.docs.map(documentSnapshot => documentSnapshot.data().Name).sort();
          if (mentors.length == 1) {
            response.json({
              "fulfillmentMessages": [
                {
                  "text": {
                    "text": [
                      `I found 1 mentor: ${mentors[0]}`
                    ]
                  }
                },
                {
                  "platform": "TELEPHONY",
                  "telephonySynthesizeSpeech": {
                    "text": `I found 1 mentor: ${mentors[0]}`
                  }
                }
              ]
            });
          } else {
            let lastMentor = mentors.pop();
            response.json({
              "fulfillmentMessages": [
                {
                  "text": {
                    "text": [
                      `I found ${mentors.length + 1} mentors: ${mentors.join()} and ${lastMentor}`
                    ]
                  }
                },
                {
                  "platform": "TELEPHONY",
                  "telephonySynthesizeSpeech": {
                    "text": `I found ${mentors.length + 1} mentors: ${mentors.join()} and ${lastMentor}`
                  }
                }
              ]
            });
          }
        });
    }
  }

  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Mentor Search', getMentorSearchResult);
  intentMap.set('Transfer Call Escalation to Human', transferCall);
  intentMap.set('Goodbye', goodbye);
  agent.handleRequest(intentMap);
});