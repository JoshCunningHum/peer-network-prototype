import { parse, stringify } from "zipson/lib";

export default class PeerSignal{
    /**
     * @type {String}
     */
    type;
    /**
     * @type {String}
     */
    sdp;
    /**
     * @type {String} uuid of the initiator peer
     */
    sender;
    /**
     * @type {String} uuid of the joiner peer
     */
    joiner;

    /**
     * 
     * @param {RTCLocalSessionDescriptionInit} simpleSignal 
     * @param {String} sender uuid of the initiator peer
     * @param {String} joiner uuid of the joiner peer
     */
    constructor(simpleSignal, sender, joiner = null){
        this.type = simpleSignal.type;
        this.sdp = simpleSignal.sdp;
        this.sender = sender;
        this.joiner = joiner;
    }

    toString(){
        return stringify(this);
    }

    /**
     * Validates a string or an object if it is a valid PeerSignal
     * @param {(String | Object)} signal 
     * @returns {Object}
     */
    static validate(signal){
        try {
            if(typeof signal === "string") signal = parse(signal);
        }catch(err){
            return false;
        }

        return {
            value: ["type", "sdp", "sender"].every(v => {
                return Object.hasOwn(signal, v);
            }),
            type: signal?.type,
            parsed: signal
        }
    }
}