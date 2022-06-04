// setup env variables with dotenv
require('dotenv').config();

// Import discord.js
const { Client, Intents } = require('discord.js');

// instantiate new client instance
const client = new Client({intents: [Intents.FLAGS.GUILDS]});

// run when client is ready
client.once('ready', () => {
   console.log('Ready!');
});

// login with client token
client.login(process.env.TOKEN);