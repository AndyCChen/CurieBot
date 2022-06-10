// return list of owned games

// imports
require('dotenv').config({ path: '../../.env'});
const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const { getFirestore } = require('firebase-admin/firestore');
const { Client } = require('discord.js');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('ownedgames')
      .setDescription('returned list of owned applications'),
   async execute(interaction) {
      // instantiate firestore
      const db = getFirestore();

      const discordID = interaction.user.id;

      // reference to user collection and discordID doc
      const docRef = db.collection('users').doc(discordID);

      // get doc
      const steamID_doc = await docRef.get();

      if (!steamID_doc.exists) {
         await interaction.reply('Error, verify yourself first.');
      } else {
         // setup api request url
         const key = process.env.KEY;
         const steam_ID = steamID_doc.data().steamID;
         const ownedGamesUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${key}&steamid=${steam_ID}&include_appinfo=1`;

         // make api request for getOwnedGames
         const ownedGamesResponse = await fetch(ownedGamesUrl);
         const ownedGamesData = await ownedGamesResponse.json();

         // gamesCount for max loop iteration
         const gamesCount = ownedGamesData.response.game_count;

         // loop counter
         let n = 0;

         // onwedGamesList is the string to send and is init to empty string
         let ownedGamesList = '';
         let stringLength = 0;
         const maxMessageLength = 2000;

         // channel to send message to
         const channel_ID = interaction.channel.id;
         const channel = interaction.client.channels.cache.get(channel_ID);

         while (n < gamesCount) {
            let gameName = ownedGamesData.response.games[n].name;
            stringLength = ownedGamesList.length + gameName.toString().length;

            // if char count exceeds maxmessageLength, send current ownedGamesList string else continue appending gameName
            if (stringLength > maxMessageLength) {
               channel.send(ownedGamesList);

               // reset string to empty and stringLength to zero
               ownedGamesList = '';
               stringLength = 0;
            } else {
               ownedGamesList += n + 1 + '. ' + gameName + '\n';
               n++;
            }
         }
         interaction.reply('**Total Applications:** ' + gamesCount);
         channel.send(ownedGamesList);
      }
   }
}