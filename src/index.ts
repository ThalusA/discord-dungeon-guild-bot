import {
    Collection,
    Client,
    REST,
    Routes,
    GatewayIntentBits,
    Events,
    ChannelType,
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    Message
} from 'discord.js';
import fs from "node:fs";
import path from "node:path";
import internal from "stream";

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;

if (DISCORD_TOKEN === undefined) {
    throw new Error("DISCORD_TOKEN is not set");
}

if (DISCORD_CLIENT_ID === undefined) {
    throw new Error("DISCORD_CLIENT_ID is not set");
}

interface InternalCommand {
    data: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}
interface ExternalCommand {
    data: SlashCommandBuilder;
    execute: (interaction: { client: Client, message: Message, info: string }) => Promise<void>;
}


const internalCommands: Collection<string, InternalCommand> = new Collection();
const externalCommands: Collection<string, ExternalCommand> = new Collection();

const commandsPath = path.join(__dirname, "commands");
const internalCommandsPath = path.join(commandsPath, "internal");
const externalCommandsPath = path.join(commandsPath, "external");

const internalCommandFiles = fs.readdirSync(internalCommandsPath).filter(file => file.endsWith('.js'));
const externalCommandFiles = fs.readdirSync(externalCommandsPath).filter(file => file.endsWith('.js'));

for (const file of internalCommandFiles) {
    const command = await import(path.join(internalCommandsPath, file));
    internalCommands.set(command.data.name, command);
}
for (const file of externalCommandFiles) {
    const command = await import(path.join(externalCommandsPath, file));
    externalCommands.set(command.data.name, command);
}

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, async () => {
    try {
        console.log(`Started refreshing ${internalCommands.size} application (/) commands.`);

        await rest.put(
            Routes.applicationCommands(DISCORD_CLIENT_ID),
            { body: internalCommands.map(command => command.data.toJSON()) },
        );

        console.log(`Successfully reloaded ${internalCommands.size} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = internalCommands.get(interaction.commandName);

    if (!command) {
        console.error(`Command ${interaction.commandName} was not found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.on(Events.MessageCreate, async message => {
    if (message.channel.type !== ChannelType.GuildText || !message.content.startsWith("#!")) return;
    const [commandName, info] = message.content.substring(2).split(" ", 2);

    const command = externalCommands.get(commandName);

    if (!command) return;

    try {
        await command.execute({client, message, info});
        await message.react('✅');
    } catch (error) {
        console.error(error);
        await message.react('❌');
    }
});

await client.login(DISCORD_TOKEN);
