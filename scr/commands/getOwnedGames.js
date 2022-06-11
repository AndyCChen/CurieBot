// return list of owned games

// imports
require('dotenv').config({ path: '../../.env'});
const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const { getFirestore } = require('firebase-admin/firestore');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('ownedgames')
      .setDescription('returns list of owned applications'),
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

         // channel to send message to
         const channel_ID = interaction.channel.id;
         const channel = interaction.client.channels.cache.get(channel_ID);

         // onwedGamesList is the string to send and is init to empty string
         let ownedGamesList = '';
         let stringLength = 0;
         const maxMessageLength = 2000;

         let totalHours = 0;

         // loop counter and gamesCount for max loop iterations
         let n = 0;
         const gamesCount = ownedGamesData.response.game_count;

         while (n < gamesCount) {
            let gameName = ownedGamesData.response.games[n].name;
            let gamePlaytime = ownedGamesData.response.games[n].playtime_forever / 60;

            // combine gameName and gamePlaytime into one entry per line
            // EX: "1. Counter Strike 500 hrs"
            let gameEntry = n + 1 + '. `' + gameName + '` \t' + gamePlaytime.toFixed(1) + ' hrs\n';
            stringLength = ownedGamesList.length + gameEntry.toString().length;

            // if char count exceeds maxmessageLength, send current ownedGamesList string else continue appending gameEntry to ownedGamesList
            if (stringLength > maxMessageLength) {
               channel.send(ownedGamesList);

               // reset string to empty and stringLength to zero
               ownedGamesList = '';
               stringLength = 0;

               // then appended gameEntry and gamePlaytime to newly reseted string
               ownedGamesList += gameEntry;
               totalHours += gamePlaytime;
               n++;
            } else {
               ownedGamesList += gameEntry;
               totalHours += gamePlaytime;
               n++;
            }
         }
         await interaction.reply('**Total Applications:** ' + gamesCount + '\t**Total Hours:** ' + totalHours.toFixed(1) + ' hrs');
         channel.send(ownedGamesList);
      }
   }
}