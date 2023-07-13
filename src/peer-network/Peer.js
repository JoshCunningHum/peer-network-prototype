/* eslint-disable no-unused-vars */
import PeerNetwork from "./PeerNetwork";
import SimplePeer from "simple-peer";
import { peeruuid, Utf8ArrayToStr } from "./PeerUtil";
import PeerSignal from "./PeerSignal";
import { parse, stringify } from "zipson/lib";

class Peer{

    /**
     * Different lifecycle stages of a peer
     */
    static State = {
        /**
         * Beggining state of the peer. Used to handle cases where WebRTC is not supported
         */
        INIT_PEER: Symbol(),

        /**
         * Initiator Peer: After creating an offer signal
         */
        WAIT_ANSWER: Symbol(),
        /**
         * Joiner Peer: After instantiating the peer
         */
        WAIT_OFFER: Symbol(),
        /**
         * Initiator Peer: After confirming but not yet connected.
         * 
         * Joiner Peer: After creating an answer signal on answer call and waiting to be connected.
         */
        WAIT_CONNECT: Symbol(),
        /**
         * Initiator Peer: When created by a reoffer event. Will wait for an answer. This is used to identify which peers are a result of reoffers.
         */
        WAIT_REANSWER: Symbol(),
        
        /**
         * Connected State
         */
        CONNECTED: Symbol(),
        /**
         * After initializing a peer but got destroyed before getting to a connected state. Used for debugging purposes only.
         */
        CANCELLED: Symbol(),
        /**
         * After connecting and got disconnected. Used for debugging purposes only.
         */
        DISCONNECTED: Symbol()
    }

    uuid = peeruuid();
    /**
     * @type {PeerNetwork}
     */
    network;
    /**
     * @type {SimplePeer.Instance}
     */
    peer;
    /**
     * @type {Symbol}
     * @private
     */
    _state;
    /**
     * @type {PeerSignal}
     */
    signalData;
    /**
     * Peer uuid at the other end of the peer connection. Used for creating PeerSignal.
     * @type {String}
     */
    partner;
    /**
     * @type {Number} the setinterval id for pinging (for closing)
     */
    pingInterval;
    /**
     * @type {Number} the exact time when the recording of ping started. Set to 0 when ping end signal arrives.
     */
    pingStart = null;
    /**
     * @type {Number} amount of latency (ping) measured in ms
     */
    pingms;

    get state(){
        return this._state;
    }

    get stateName(){
        return Object.entries(Peer.State).find(([n, s]) => s === this._state)[0];
    }

    get connected(){
        return this.state === Peer.State.CONNECTED;
    }

    /**
     * @param {(Symbol | String)} state
     */
    set state(state){
        if(typeof state === "string"){
            // Check if value matches with any pre written states above
            const appropriate = Object.entries(Peer.State).some(([n, s]) => {
                if(n === state.toUpperCase()){
                    this._state = s;
                    return true;
                }
                return false;
            });

            if(!appropriate) return;
        }else this._state = state;

        // TODO: Initiate events based on what state on this peer
        this.network.handle(this);
    }

    /**
     * 
     * @param {PeerNetwork} network 
     * @param {String} [reofferFrom=null] identifies if this peer is a reoffer event creation 
     */
    constructor(network, reofferFrom = null){
        this.network = network;
        this.state = Peer.State.INIT_PEER;
        this.partner = reofferFrom;
        this.init(reofferFrom);
    }

    get isHost(){
        return this.network?.host;
    }

    /**
     * 
     * @param {String} reofferFrom 
     */
    init(reofferFrom = null){
        const p = this.peer = new SimplePeer({
            initiator: this.isHost,
            trickle: false,
            channelName: this.uuid,
            config: {
                iceServers: [
                    { urls: 'stun:stun2.l.google.com:19302' }, 
                    { urls: 'stun:stun3.l.google.com:19302' }, 
                    { urls: 'stun:stun4.l.google.com:19302' }, 
                    { urls: 'stun:global.stun.twilio.com:3478?transport=udp' }
                ]
            }
        });

        // To lock the current state of the network
        const host = this.isHost;

        if(!host) this.state = Peer.State.WAIT_OFFER;


        p.on("signal", data => {
            if(this.signalData != null){
                // If signal is already created, do something here

                // This part is a guaranteed initiator peer only because only an initiator peer can signal when a signal data is already created when doing confirming
                // A joiner peer is only emitting signal when creating an answer signal, thus it won't emit signal when there is already an answer signal

                this.state = Peer.State.WAIT_CONNECT;
            }else{
                // signal is not yet created so...

                // Build the parameter for the peer signal
                const signalParam = [this.uuid];
                if(!host) signalParam.unshift(this.partner);
                else if(reofferFrom !== null) signalParam.push(this.partner);

                this.signalData = new PeerSignal(data, ...signalParam);

                // its confusing I know. Basically sets the state of the current peer
                // If this is a joiner then its waiting for the connected state
                // If this is a initiator:
                //  If this is not a reoffer initiator, then set it waiting for an answer
                //  If this is created as a reoffer, then set it waiting for a reanswer
                this.state = this.isHost ? 
                    reofferFrom === null ? Peer.State.WAIT_ANSWER : Peer.State.WAIT_REANSWER 
                : Peer.State.WAIT_CONNECT;
            }
        })

        p.on("connect", () => {
            this.state = Peer.State.CONNECTED;
            this.setup();
        })

        p.on("data", data => {
            // Exlusive for ping
            if(ArrayBuffer.isView(data)) data = Utf8ArrayToStr(data);

            // ping signal
            if(data === '§'){
                this.peer.send('¨'); // send an ping end signal
            }else if(data === '¨'){
                this.pingArrive();
            }else{

                // Do normal stuff here

            }
        })

        p.on("close", () => {
            this.state = this.state === Peer.State.CONNECTED ? Peer.State.DISCONNECTED : Peer.State.CANCELLED;
            this.network = null;
        })
    }

    /**
     * Invoke right after the peer is connected. Will perform essential preparations like ping handling, network participant view etc
     * @private
     */
    setup(){
        // Ping Handling
        if(this.network?.pinging){
            this.ping();
            this.pingInterval = setInterval(() => this.ping(), this.network.ping_interval);
        }
        

        // TODO: Participant Acquisition
    }

    /**
     * Pings the other side to measure the latency
     */
    ping(){
        // Uses JS 'magic' casting to let 0, undefined, and null to start a ping and any number not 0 cant
        if(this.pingStart) return; // Do not send another ping signal if the last ping signal didn't arrive
        this.pingStart = Date.now();
        this.peer.send('§');
    }

    /**
     * Invoked when a ping end signal is received through the data channel
     */
    pingArrive(){
        this.pingms = Date.now() - this.pingStart;
        this.pingStart = 0;
    }

    /**
     * 
     * @param {PeerSignal | String} data PeerSignal Data that is sent through a signaling mechanism. Can be the raw compressed string or the processed Peer Signal Data
     */
    signal(data){
        try {
            if(typeof data === "string") data = parse(data);
            this.partner = this.isHost ? data.joiner : data.sender;
            
            this.peer.signal(data);
            
            
            if(this.isHost){
                // A signalling initiator is in its confirming process
            }else{
                // A signalling joiner is in its answering process
            }

        }catch(err){
            console.error(`Error when signaling peer [${this.uuid}]: `, err);
        }
    }

    /**
     * Sends data to the peer
     * @param {Object} data Will always be an object
     */
    send(data){
        const d = stringify(data);
        this.peer.send(d);
    }

    /**
     * Sends data to the peer but buffers it until its ready to be sent
     * @param {Object} data Will always be an object
     */
    write(data){
        const d = stringify(data);
        this.peer.write(d);
    }

    /**
     * 
     * @param {Peer} peer 
     * @returns {Boolean}
     */
    equals(peer){
        if(!(peer instanceof Peer)) return false;
        return peer.uuid === this.uuid;
    }

    destroy(){
        try {
            clearInterval(this.pingInterval);
            this.peer.destroy();
        }catch(err){
            console.error(`Error when destroying Peer ${this.uuid}`, err);
        }
    }
}

export default Peer;