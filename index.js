const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, Intents, Collection } = require('discord.js');

const dotenv = require('dotenv');

/**
 * Get .env variables
 */

dotenv.config();
const { TOKEN, DEV_ID, CHANNEL_ID } = process.env;

/**
 * Discord.js setup
 */
// Create a new client instance
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

// Creating a collection for commands in client
client.commands = new Collection();

/**
 * Import commands found in /commands
 */
const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));
const commands = [];

/* eslint-disable */
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
  client.commands.set(command.data.name, command);
}
/* eslint-enable */

/**
 * Register the commands once bot is ready.
 */
client.once('ready', () => {
  console.log('Ready!');
  const CLIENT_ID = client.user.id;
  const rest = new REST({
    version: '9',
  }).setToken(TOKEN);
  (async () => {
    try {
      if (!DEV_ID) {
        await rest.put(Routes.applicationCommands(CLIENT_ID), {
          body: commands,
        });
        console.log('Successfully registered application commands globally');
      } else {
        const list = await rest.put(Routes.applicationGuildCommands(CLIENT_ID, DEV_ID), {
          body: commands,
        });
        list.forEach((c) => console.log(c.name, c.options || 'no options'));
        console.log('Successfully registered application commands for development guild');
      }
    } catch (error) {
      if (error) console.error(error);
    }
  })();
});

/**
 * Listen for the commands
 */
client.on('interactionCreate', async (interaction) => {
  if (interaction.user.bot) return;
  if (!interaction.isCommand()) return;

  // Check they are using correct channel, responds with ephemeral notification to correct channel.
  if (interaction.channelId !== CHANNEL_ID) {
    await interaction.reply({ content: `Please use <#${CHANNEL_ID}> for this bot`, ephemeral: true });
  } else {
    const command = client.commands.get(interaction.commandName);

    // If command doesn't exist, return error.
    if (!command) return;

    try {
      await interaction.deferReply({ ephemeral: true });

      await command.execute(interaction, client);
    } catch (error) {
      if (error) console.error(error);
      await interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
});

/**
 * Log bot in.
 */
client.login(TOKEN);
