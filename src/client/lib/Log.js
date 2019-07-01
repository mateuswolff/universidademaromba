export class Log {
    constructor() {
        this.lastlog = [];
    }
    $dolog(level, msg) {
        let rawStack = new Error().stack;
        if (rawStack) {
            let stack = rawStack.split('\n');
            let entry = { id: new Date().getTime(), level: level, when: new Date(), msg: msg, where: stack[3] };
            if (level == 'error' || level == 'fatal') {
                console.error(`${entry.when} [${level}]:${entry.msg}`);
            }
            else {
                console.log(`${entry.when} [${level}]:${entry.msg}`);
            }
            this.lastlog.push(entry);
            if (this.lastlog.length > 1000)
                this.lastlog.shift();
        }
    }
    trace(msg) {
        this.$dolog('trace', msg);
    }
    debug(msg) {
        this.$dolog('debug', msg);
    }
    info(msg) {
        this.$dolog('info', msg);
    }
    warn(msg) {
        this.$dolog('warn', msg);
    }
    fatal(msg) {
        this.$dolog('fatal', msg);
    }
}
export let log = new Log();