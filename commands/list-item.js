const { SlashCommandBuilder } = require('@discordjs/builders');

const dotenv = require('dotenv');

dotenv.config();
const { CHANNEL_ID } = process.env;

function getStatus(issue) {
  let response;

  if (issue === 1) {
    response = {
      listed: true,
    };
  } else {
    response = {
      listed: false,
    };
  }

  return response;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('list-item')
    .setDescription('Will post an embed if your item is listed')
    .addIntegerOption((option) => option.setName('issue')
      .setDescription('number')
      .setRequired(true)),
  async execute(interaction, client) {
    const issue = interaction.options.getInteger('issue');

    const itemData = await getStatus(issue);

    if (!itemData.listed) {
      await interaction.editReply(
        {
          content: 'This item does not seem to be listed',
          embeds: [{
            title: 'embed',
            description: 'embed in editReply works',
          }],
          ephemeral: true,
        },
      );
    } else {
      await interaction.editReply({
        content: 'Found a listing, posting now.',
        embeds: [{
          title: 'embed',
          description: 'embed in editReply works',
        }],
        components: [],
      });

      await client.channels.cache.get(CHANNEL_ID).send({
        embeds: [{
          title: 'test',
          description: 'description',
        }],
      });
    }
  },

};
