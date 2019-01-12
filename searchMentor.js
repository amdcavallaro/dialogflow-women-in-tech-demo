// Imports the Dialogflow library
const dialogflow = require('dialogflow');

// Instantiates the Intent Client
const intentsClient = new dialogflow.IntentsClient();

// The path to identify the agent that owns the created intent.
const agentPath = intentsClient.projectAgentPath('star-wars-search-engine');

const trainingPhrases = [];

const trainingPhrasesParts = [];

trainingPhrasesParts.forEach(trainingPhrasesPart => {
  const part = {
    text: trainingPhrasesPart,
  };

  // Here we create a new training phrase for each provided part.
  const trainingPhrase = {
    type: 'EXAMPLE',
    parts: [part],
  };a

  trainingPhrases.push(trainingPhrase);
});

const messageText = {
  text: messageTexts,
};

const message = {
  text: messageText,
};

const intent = {
  displayName: displayName,
  trainingPhrases: trainingPhrases,
  messages: [message],
};

const createIntentRequest = {
  parent: agentPath,
  intent: intent,
};

// Create the intent
const responses = sintentsClient.createIntent(createIntentRequest);
console.log(`Intent ${responses[0].name} created`);