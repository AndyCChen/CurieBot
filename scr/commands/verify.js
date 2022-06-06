require('dotenv').config({ path: '../../.env'});
const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('verify')
      .setDescription('verify steam id.'),
   async execute(interaction) {
      const key = process.env.KEY
      const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${key}&steamids=76561198241832058`

      const response = await fetch(url);
      const data = await response.json();

      const playerCount = data.response.players.length;

      console.log(playerCount);

      if (playerCount != 1) {
         await interaction.reply('Error, steam id not associated with a account.');
      } else {
         await interaction.reply('Success!');
      }
   }
}