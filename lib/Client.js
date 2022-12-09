const { Client, Collection, EmbedBuilder } = require("discord.js");
const { Console, ConsoleStyles, Type, BitEnum } = require("atils");
const { Routes } = require("discord-api-types/v10");
const { REST } = require("@discordjs/rest");
const Path = require("path");

const Command = require("./Command.js");
const Config = require("./Config.js");
const Event = require("./Event.js");

const EventType = new Type(Event);
const CommandType = new Type(Command);

const ClientConsole = new Console({
    styles: {
        title: [
            ConsoleStyles.TextStyles.Bright,
            ConsoleStyles.TextColors.Cyan,
        ],

        message: [
            ConsoleStyles.TextColors.White,
        ],

        info: [
            ConsoleStyles.TextStyles.Dim,
            ConsoleStyles.TextColors.Magenta,
        ],
    }
});

class Bot extends Client {
    static InteractionApplicationScales = new BitEnum(
        "Global", "Guild"
    );

    constructor() {
        super({
            intents: Config.ClientIntents,
            partials: Config.ClientPartials,
        });

        this.Events = new Collection();
        this.Commands = new Collection();
        this.Config = new Collection();
        this.Config.set("prefixes", Config.ClientPrefixes);

        this.REST = new REST({ version: "10" }).setToken(Config.ClientToken);
        this.Console = ClientConsole;

        this.login(Config.ClientToken);

        this.db = this.Database;
        this.console = this.Console;
    }

    useDefaultCommandParser() {
        this.on("messageCreate", async(message) => {
            let prefixes = this.Config.get("prefixes");
            let usedPrefix;

            prefixes.forEach(prefix => {
                if(message.content.startsWith(prefix)) {
                    usedPrefix = prefix;
                }
            });

            if(!usedPrefix) return;
            else {
                let args = message.content.slice(usedPrefix.length).trim().split(" ");
                let command = args.shift().toLowerCase();

                command = this.Commands.get(command);

                try {
                    command.scripts.onMessageCommand(this, message, args);
                } catch(error) {
                    return message.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Failed to Parse Command")
                                .setDescription(`\`\`\`js\n${error}\n\`\`\``)
                                .setColor("Red")
                        ]
                    });
                }
            }
        });

        this.on("interactionCreate", async(i) => {
            if(i.isChatInputCommand()) {
                let command = this.Commands.get(i.commandName);

                try {
                    command.scripts.onSlashCommand(this, i);
                } catch(error) {
                    return i.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Failed to Parse Command")
                                .setDescription(`\`\`\`js\n${error}\n\`\`\``)
                                .setColor("Red")
                        ]
                    });
                }
            }
        });
    }

    registerEvents(...Events) {
        Events.forEach(EventItem => {
            EventType.applyTo(EventItem, false);

            this.Events.set(EventItem.name, EventItem);
            this.Console.log("@EventManager", "loaded a new Event", { Event_Name: EventItem.name });

            this.on(EventItem.name, async(...EventParameters) => {
                EventItem.scripts.onEvent(this, ...EventParameters);
            });
        });
    }

    registerCommands(...Commands) {
        Commands.forEach(CommandItem => {
            CommandType.applyTo(CommandItem, false);

            this.Commands.set(CommandItem.name, CommandItem);
            this.Console.log("@CommandManager", "loaded a new Command", { Command_Name: CommandItem.name, Command_Types: CommandItem.types.join(", ") });
        });
    }

    applyInteractions(Options, ...Commands) {
        this.Console.log("NOTICE:", "Applying Interactions can take time. Please be patient as the Discord API updates your Client.");

        const InteractionsBody = [];

        Commands.forEach(CommandItem => {
            CommandType.applyTo(CommandItem);

            if(CommandItem.types.includes(Command.Types.SlashCommand) || CommandItem.types.includes(Command.Types.ContextMenuCommand)) {
                Object.keys(CommandItem.builders).forEach(CommandItemBuilder => {
                    InteractionsBody.push(CommandItem.builders[CommandItemBuilder].toJSON());
                });
            }
        });

        if(Options.type === Bot.InteractionApplicationScales.Global) {
            (async() => {
                try {
                    this.Console.log("@CommandManager", `started refreshing ${InteractionsBody.length} Global Interactions`);
                    const data = await this.REST.put(Routes.applicationCommands(this.user.id), { body: InteractionsBody });
                    this.Console.log("@CommandManager", `successfully refreshed ${data.length} Global Interactions`);

                } catch(error) {
                    this.Console.error(error);
                }
            })();
        }

        else if(Options.type === Bot.InteractionApplicationScales.Guild) {
            (async() => {
                try {
                    this.Console.log("@CommandManager", `started refreshing ${InteractionsBody.length} Guild Interactions`);
                    const data = await this.REST.put(Routes.applicationGuildCommands(this.user.id, Options.guild_id), { body: InteractionsBody });
                    this.Console.log("@CommandManager", `successfully refreshed ${data.length} Guild Interactions`);

                } catch(error) {
                    console.log(error);
                }
            })();
        }

        return this;
    }

    #formatFilePath() {
        let path;
        let filePath;

        if(Config.DatabaseFilePath.endsWith("/")) filePath = Config.DatabaseFilePath;
        else filePath = `${Config.DatabaseFilePath}/`;

        path = Path.join(`${filePath}${Config.DatabaseFileName}.sqlite`);
        return path;
    }
}

module.exports = Bot;