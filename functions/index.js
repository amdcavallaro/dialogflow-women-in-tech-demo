// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Greetings! What mentor are you looking for?`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  function mentorSearch(agent) {
    agent.add(`This is their contact: mentor.contact . Would you like to call her?`);
  }

  function transferCall(agent) {
    agent.add(`Transfering you now!`);
  }

  function goodbye(agent) {
    agent.add(`Cheers, see you!`);
  }

 // function yourFunctionHandler(agent) {
 //    agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
 //    agent.add(new Card({
 //        title: `Mentor name`,
 //        imageUrl: 'https://www.insidehighered.com/sites/default/server_files/media/mentoring%20bulletin%20board.jpg',
 //        text: `Twitter💁`,
 //        buttonText: 'This is a button',
 //        buttonUrl: 'https://assistant.google.com/'
 //      })
 //    agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
 //    );


  // // Uncomment and edit to make your own intent handler
  // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function yourFunctionHandler(agent) {
  //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
  //   agent.add(new Card({
  //       title: `Title: this is a card title`,
  //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
  //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
  //       buttonText: 'This is a button',
  //       buttonUrl: 'https://assistant.google.com/'
  //     })
  //   );
  //   agent.add(new Suggestion(`Quick Reply`));
  //   agent.add(new Suggestion(`Suggestion`));
  //   
  // }

  // // Uncomment and edit to make your own Google Assistant intent handler
  // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function googleAssistantHandler(agent) {
  //   let conv = agent.conv(); // Get Actions on Google library conv instance
  //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
  //   agent.add(conv); // Add Actions on Google library responses to your agent's response
  // }
  // // See https://github.com/dialogflow/dialogflow-fulfillment-nodejs/tree/master/samples/actions-on-google
  // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

  // Run the proper function handler based on the matched Dialogflow intent name

  function checkSentiment(agent) {
    console.log(agent.sentimentAnalysisResult.queryTextSentiment.score);
    if (agent.sentimentAnalysisResult.queryTextSentiment.score < 0) {
      transferCall();
    }
  //   alternativeQueryResults.map(item => {
  // const score = item.sentimentAnalysisResult.queryTextSentiment.score;
  // return score == 0 ? 'neutral' : score > 0 ? 'positive' : 'negative';
  };

  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Mentor Search', mentorSearch);
  intentMap.set('Transfer Call Escalation to Human', transferCall);
  intentMap.set('Goodbye', goodbye);
  agent.handleRequest(intentMap);
});
