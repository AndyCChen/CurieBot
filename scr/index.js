// load token from .env file
require('dotenv').config({ path: '../.env'});

// Imports
const { Client, Intents, Collection } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const admin = require('firebase-admin');
const serviceAccount = require("../admin.json");
 
// Initialize Firebase
admin.initializeApp({
   credential: admin.credential.cert(serviceAccount)
 });

// instantiate new client instance
const client = new Client(
   { intents: 
      [
         Intents.FLAGS.GUILDS
      ]
   }
);

client.commands = new Collection();

// path to commands folder containing all commands
const commandsPath = path.join(__dirname, 'commands');

// array of all filenames inside of commands folder
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
   const filePath = path.join(commandsPath, file);
   const command = require(filePath);

   // set new command to collection with key as name and value as the exported module
   client.commands.set(command.data.name, command);
}

// run when client is ready
client.once('ready', () => {
   console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
   // return if not a slash command
   if (!interaction.isCommand()) return;

   const command = client.commands.get(interaction.commandName);

   if (!command) return;

   // run slash command
   try {
      await command.execute(interaction);
   } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
   }
});

// login with client token
client.login(process.env.TOKEN);