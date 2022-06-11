// return list of friends

// imports
require('dotenv').config({ path: '../../.env'});
const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const { getFirestore } = require('firebase-admin/firestore');
const escape = require('../../exports/escapeMarkdown');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('getfriends')
      .setDescription('Returns friends list'),
   async execute(interaction) {
      // instantiate firebase
      const db = getFirestore();

      const discordID = interaction.user.id;

      // reference to user collection and dicordID doc that contains steamID
      const docRef = db.collection('users').doc(discordID);

      // get doc
      const steamID_doc = await docRef.get();

      if (!steamID_doc.exists) {
         await interaction.reply('Error, verify yourself first.');
      } else {
         // channel to send message to
         const channel_ID = interaction.channel.id;
         const channel = interaction.client.channels.cache.get(channel_ID);

         // set api request url
         const key = process.env.KEY;
         const steam_ID = steamID_doc.data().steamID;
         const friendsListUrl = `https://api.steampowered.com/ISteamUser/GetFriendList/v1/?key=${key}&steamid=${steam_ID}`;

         // make api request
         const friendsListResponse = await fetch(friendsListUrl);
         const friendsListData = await friendsListResponse.json();

         // friendCount for max loop interations
         const friendCount = friendsListData.friendslist.friends.length;
         
         // check if friends array is empty first
         if (friendCount === 0) {
            await interaction.reply('Sadly you have no friends.');
         } else {
            // initilize list of embeds to empty
            const embedList = [];

            // loop counter
            let n = 0;

            while (n < friendCount) {
               // steamID of friend
               const friendID = friendsListData.friendslist.friends[n].steamid;

               // set api request url
               const friendSummaryUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${key}&steamids=${friendID}`;

               // make api request
               const friendSummaryResponse = await fetch(friendSummaryUrl);
               const friendSummaryData = await friendSummaryResponse.json();

               // friends data
               const name = escape.escapeMarkdown(friendSummaryData.response.players[0].personaname);
               const profileUrl = friendSummaryData.response.players[0].profileurl;
               const profilePic = friendSummaryData.response.players[0].avatarfull;

               // get date of when this user was added as friend
               const friendSinceTimeStamp = friendsListData.friendslist.friends[n].friend_since;
               let dateObject = new Date(friendSinceTimeStamp * 1000); // pass timeStamp in milliseconds
               const friend_since = dateObject.toLocaleString();

               // get date of account creation
               const dateOfCreationTimeStamp = friendSummaryData.response.players[0].timecreated;
               dateObject = new Date(dateOfCreationTimeStamp * 1000);
               const dateOfCreation = dateObject.toLocaleString();

               // make embeded message object
               const embed = {
                  title: name,
                  url: profileUrl,
                  image: {
                     url: profilePic,
                  },
                  fields: [
                     {
                        name: 'Friend since',
                        value: friend_since,
                     },
                     {
                        name: 'Date Created',
                        value: dateOfCreation,
                     },
                  ]
               };

               // only a max of 10 embeds allowed per message send in discord
               // if list is about to be over 10 items long, send current list and then empty the list
               if( (embedList.length + 1 ) > 10) {
                  channel.send({
                     embeds: embedList
                  });

                  embedList.splice(0, embedList.length);
                  n++;
               } else { // else continue pushing new embed objects onto the list
                  embedList.push(embed);
                  n++;
               }
            }
            
            // send remaining items in list if the list is not empty
            if (embedList.length != 0) {
               channel.send({
                  embeds: embedList
               });
            }
         }

         await interaction.reply('**Total friends:** ' + friendCount.toString());
      }
   }
}