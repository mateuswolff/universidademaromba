import { guid } from "./Util.js";
import { log } from "./Log.js";
let counter = 0;
export class DefaultEventEmitterImpl {
    constructor() {
        this.events = {};
        this.evtcounter = 0;
        setTimeout(() => {
            this.evtcounter = 0;
        }, 1000);
    }
    on(evt, handler) {
        if (!this.events[evt])
            this.events[evt] = {};
        let id = guid();
        this.events[evt][id] = handler;
        return id;
    }
    once(evt, handler) {
        if (!this.events[evt])
            this.events[evt] = {};
        if (this.events[evt].$immediate) {
            handler();
        }
        let id = guid();
        let self = this;
        function nHandler(...params) {
            handler(...params);
            self.remove(evt, id);
        }
        this.events[evt][id] = nHandler;
        return id;
    }
    emit(evt, ...params) {
        log.debug('EVENT:' + evt);
        //TODO: Damn bassfish code, fix ASAP!
        // let nparams=[]
        // for(let i=1;i<params.length;i++){
        //     nparams.push(params);
        // }
        if (this.evtcounter > 50000) {
            throw new Error('Event Burst Detected - please review your code!');
        }
        this.evtcounter++;
        if (this.events[evt]) {
            for (let k of Object.keys(this.events[evt])) {
                if (!k.startsWith('$')) {
                    let h = this.events[evt][k];
                    h(...params);
                }
            }
        }
    }
    remove(evt, id) {
        delete this.events[evt][id];
    }
    /**
     * Sets event to be immediate, in other words, whoever attaches a once to this event
     * will be promptly triggered. No params are allowed;
     * @param evt - event name
     * @param val - if it should or not be immediate
     */
    setImmediate(evt, val = true) {
        if (!this.events[evt])
            this.events[evt] = {};
        this.events[evt].$immediate = val;
    }
}