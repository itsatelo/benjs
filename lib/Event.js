const { Interface, ErrorBuilder } = require("atils");

const EventInterface = new Interface({
    name: String,
    description: String,

    scripts: Object,
});

class Event {
    constructor(EventOptions) {
        EventInterface.applyTo(EventOptions);

        Object.keys(EventOptions).forEach(key => {
            this[key] = EventOptions[key];
        });

        if(!this.scripts?.on) {
            throw new ErrorBuilder("Missing Event Script", "An Event Script is required when creating Events.");
        }
    }
}

module.exports = Event;