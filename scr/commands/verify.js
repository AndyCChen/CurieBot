// check if steam id is valid based on if a player is returned from GetPlayerSummaries

require('dotenv').config({ path: '../../.env'});
const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const { getFirestore } = require('firebase-admin/firestore');
const escape = require('../../exports/escapeMarkdown');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('verify')
      .setDescription('verify steam id.')
      .addStringOption(option =>
         option.setName('steam_id')
            .setDescription('SteamID from your profile url, enabled via settings -> Interface -> display web address')
            .setRequired(true)),
   async execute(interaction) {
      // set api request url
      const key = process.env.KEY
      const steam_ID = interaction.options.getString('steam_id');
      const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${key}&steamids=${steam_ID}`;

      // make api request
      const response = await fetch(url);
      const data = await response.json();

      // playerCount = 0 if steamID is not linked to a existing steam account, else playerCount = 1
      const playerCount = data.response.players.length;

      if (playerCount != 1) {
         await interaction.reply('Error, steam id not associated with a account.');
      } else {
         const discordID = interaction.user.id;

         // instantiate firestore
         const db = getFirestore();

         // reference to user collection and discordID document
         const docRef = db.collection('users').doc(discordID);

         // write steam_ID into database
         await docRef.set({
            'steamID': steam_ID,
         });

         const playerName = escape.escapeMarkdown(data.response.players[0].personaname);
         await interaction.reply(`Success!\nHeyo ${playerName}`);
      }
   }
}