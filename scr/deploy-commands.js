// load token from .env file
require('dotenv').config({ path: '../.env'});

// imports
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId } = require('../config.json');
const fs = require('node:fs');
const path = require('node:path');

// list of slash commands
const commands = [];

// path to folder containing all commands
const commandPath = path.join(__dirname, 'commands');

// array of filesnames in commands folder
const commandFiles = fs.readdirSync(commandPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
   const filePath = path.join(commandPath, file);
   const command = require(filePath);

   // push exported module into list of commands
   commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);