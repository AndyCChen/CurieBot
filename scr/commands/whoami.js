// return embeded message with a summary of steam profile

require('dotenv').config({ path: '../../.env'});
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const { getFirestore } = require('firebase-admin/firestore');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('whoami')
      .setDescription('Displays image based on profile info.'),
   async execute(interaction) {
      // escape special markdown characters in discord chat
      function escapeMarkdown(text) {
         return text.replace(/(\*|_|`|\\)/g, '\\$1');
      }

      // instantiate firestore
      const db = getFirestore();

      const discordID = interaction.user.id;

      // reference to user collection and discordID document
      const docRef = db.collection('users').doc(discordID);

      // get document
      const steamID_doc = await docRef.get();

      if (!steamID_doc.exists) {
         await interaction.reply('Error, verify yourself first.');
      } else {
         // set api request url
         const key = process.env.KEY;
         const steam_ID = steamID_doc.data().steamID;
         const playerSummaryUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${key}&steamids=${steam_ID}`;
         const playerLevelUrl = `https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=${key}&steamid=${steam_ID}`;

         // make api request
         // player summaries
         const playerSummaryResponse = await fetch(playerSummaryUrl);
         const playerSummaryData = await playerSummaryResponse.json();

         // player level
         const playerLevelResponse = await fetch(playerLevelUrl);
         const playerLevelData = await playerLevelResponse.json();

         const playerSummaryEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(escapeMarkdown(playerSummaryData.response.players[0].personaname.toString()))
            .setURL(playerSummaryData.response.players[0].profileurl.toString())
            .setImage(playerSummaryData.response.players[0].avatarfull.toString())
            .setDescription('Level: ' + playerLevelData.response.player_level.toString());

         interaction.reply({ embeds: [playerSummaryEmbed] });
      }
   },
}