const { GatewayIntentBits, Partials } = require("discord.js");
const { Type } = require("atils");

const StringType = new Type(String);

class Config {
    constructor() {
        this.ClientToken = null;

        this.ClientIntents = [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
        ];

        this.ClientPartials = [
            Partials.Channel,
            Partials.GuildMember,
            Partials.User,
            Partials.ThreadMember,
        ];

        this.ClientPrefixes = [
            "-",
        ];

        this.DeveloperIDs = [
            "333987747112943626",
            "539215596051496960",
        ];
    }

    setToken(TokenString) {
        StringType.applyTo(TokenString, false);

        this.ClientToken = TokenString;
        return this;
    }

    setDeveloperIDs(...IDStrings) {
        this.DeveloperIDs = [...IDStrings];
    }

    setIntents(...IntentStrings) {
        const Intents = [];
        const FinalizedIntents = [];

        IntentStrings.forEach(Intent => {
            StringType.applyTo(Intent, false);
            Intents.push(Intent.toLowerCase());
        });

        Object.keys(GatewayIntentBits).forEach(Intent => {
            if(Intents.includes(Intent.toLowerCase())) {
                FinalizedIntents.push(GatewayIntentBits[Intent]);
            }
        });

        this.ClientIntents = FinalizedIntents;
        return this;
    }

    setPartials(...PartialStrings) {
        const _Partials = [];
        const FinalizedPartials = [];

        PartialStrings.forEach(Partial => {
            StringType.applyTo(Partial, false);
            _Partials.push(Partial.toLowerCase());
        });

        Object.keys(Partials).forEach(Partial => {
            if(_Partials.includes(Partial.toLowerCase())) {
                FinalizedPartials.push(Partials[Partial]);
            }
        });

        this.ClientPartials = FinalizedPartials;
        return this;
    }

    /**
     * @note "/" will ALWAYS be a prefix for Slash Commands if you apply Interactions.
     */
    setPrefixes(...PrefixStrings) {
        const Prefixes = [];
        
        PrefixStrings.forEach(Prefix => {
            StringType.applyTo(Prefix, false);
            Prefixes.push(Prefix);
        });

        this.ClientPrefixes = Prefixes;
        return this;
    }

    setDatabaseFilePath(FilePathString) {
        StringType.applyTo(FilePathString);

        this.DatabaseFilePath = FilePathString;
    }

    setDatabaseFileName(FileNameString) {
        StringType.applyTo(FileNameString);

        this.DatabaseFileName = FileNameString;
    }

    addIntents(...IntentStrings) {
        const Intents = [];

        IntentStrings.forEach(Intent => {
            StringType.applyTo(Intent, false);
            Intents.push(Intent.toLowerCase());
        });

        Object.keys(GatewayIntentBits).forEach(Intent => {
            if(Intents.includes(Intent.toLowerCase())) {
                this.ClientIntents.push(GatewayIntentBits[Intent]);
            }
        });

        return this;
    }

    addPartials(...PartialStrings) {
        const _Partials = [];

        PartialStrings.forEach(Partial => {
            StringType.applyTo(Partial, false);
            _Partials.push(Partial.toLowerCase());
        });

        Object.keys(Partials).forEach(Partial => {
            if(_Partials.includes(Partial.toLowerCase())) {
                this.ClientPartials.push(Partials[Partial]);
            }
        });

        return this;
    }

    /**
     * @note "/" will ALWAYS be a prefix for Slash Commands if you apply Interactions.
     */
    addPrefixes(...PrefixStrings) {
        PrefixStrings.forEach(Prefix => {
            StringType.applyTo(Prefix, false);
            this.ClientPrefixes.push(Prefix);
        });
    }
}

module.exports = new Config();