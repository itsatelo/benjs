const { Type, Interface, BitEnum, ErrorBuilder } = require("atils");

const CommandInterface = new Interface({
    name: String,
    aliases: Array,
    description: String,

    types: Array,
    _builders: {
        type: Object,
        default: {},
    },

    _requiredPermissions: {
        type: Array,
        default: [],
    },

    scripts: Object,
    /*
        {
            onMessageCommand
            onSlashCommand
            onContextMenuCommand
        }
    */
});

class Command {
    static Types = new BitEnum(
        "MessageCommand",
        "SlashCommand",
        "ContextMenuCommand",
    );

    constructor(CommandOptions) {
        CommandInterface.applyTo(CommandOptions);

        Object.keys(CommandOptions).forEach(key => {
            this[key] = CommandOptions[key];
        });

        if(this.types.includes(Command.Types.SlashCommand)) {
            if(!this.builders?.slashCommand && !this.builders?.slash_command) {
                throw new ErrorBuilder("Missing Command Builder", "A Command Builder is required to create a Slash Command.");
            }
        }

        if(this.types.includes(Command.Types.ContextMenuCommand)) {
            if(
                !this.builders?.contextMenuCommand
                && !this.builders?.context_menu_command
                && !this.builders?.context_menu 
                && !this.builders?.contextMenu
            ) {
                throw new ErrorBuilder("Missing Command Builder", "A Command Builder is required to create a Context Menu Command.");
            }
        }
    }
}

module.exports = Command;