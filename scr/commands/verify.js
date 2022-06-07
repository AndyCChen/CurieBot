// check if steam id is valid based on if a player is returned from GetPlayerSummaries

require('dotenv').config({ path: '../../.env'});
const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('verify')
      .setDescription('verify steam id.')
      .addStringOption(option =>
         option.setName('steam_id')
            .setDescription('SteamID argument')
            .setRequired(true)),
   async execute(interaction) {

      // escape special markdown characters in discord chat
      function escapeMarkdown(text) {
         return text.replace(/(\*|_|`|\\)/g, '\\$1');
      }

      const key = process.env.KEY
      const steam_ID = interaction.options.getString('steam_id');
      const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${key}&steamids=${steam_ID}`;

      const response = await fetch(url);
      const data = await response.json();

      const playerCount = data.response.players.length;
      const playerName = escapeMarkdown(data.response.players[0].personaname);
      const discordID = interaction.user.id;
      console.log(interaction.user.id);

      if (playerCount != 1) {
         await interaction.reply('Error, steam id not associated with a account.');
      } else {
         // instantiate firestore
         const db = getFirestore();

         // reference to user collection and discordID document
         const docRef = db.collection('users').doc(discordID);

         // write steam_ID into database
         await docRef.set({
            steamID: steam_ID,
         });

         await interaction.reply(`Success!\nHeyo ${playerName}`);
      }
   }
}