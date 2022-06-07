// delete user from database

// imports
require('dotenv').config({ path: '../../.env'});
const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const { getFirestore } = require('firebase-admin/firestore');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('deleteme')
      .setDescription('remove user from database'),
   async execute(interaction) {
      const discordID = interaction.user.id;

      // instantiate firestore
      const db = getFirestore();

      // delete doc containing steamID of corresponding discordID
      const docRef = await db.collection('users').doc(discordID).delete();

      interaction.reply('You have been deleted!');
   }
}