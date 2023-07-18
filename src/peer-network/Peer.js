/* eslint-disable no-unreachable */
/* eslint-disable no-unused-vars */
import PeerNetwork from "./PeerNetwork";
import SimplePeer from "simple-peer";
import { peeruuid, Utf8ArrayToStr } from "./PeerUtil";
import PeerSignal from "./PeerSignal";
import { parse, stringify } from "zipson/lib";

class Peer{

    static PING_START = '%';
    static PING_END = '&';

    /**
     * Different lifecycle stages of a peer
     */
    static State = {
        /**
         * Beggining state of the peer. Used to handle cases where WebRTC is not supported
         */
        INIT_PEER: Symbol(),

        /**
         * Initiator Peer: For reoffer event created peers, instead of using INIT_PEER
         */
        INIT_REOFFER: Symbol(),
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
     * @type {RTCPeerConnection}
     */
    pc;
    /**
     * @type {RTCDataChannel}
     */
    dc;
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
        this.state = !reofferFrom ? Peer.State.INIT_PEER : Peer.State.INIT_REOFFER;
        this.partner = reofferFrom;
        this.init(reofferFrom);
    }

    get isHost(){
        return this.network?.host;
    }

    async offer(reoffer = null){
        const offer = await this.pc.createOffer();
        // offer.sdp = Peer.filterTrickle(offer.sdp);
        await this.pc.setLocalDescription(offer);
        // Create signal data
        this.signalData = new PeerSignal(offer, this.uuid, reoffer ? reoffer : null);
        // Then wait for ice gathering to finish to send the offer signal
        this.wait_ice();
    }

    /**
     * 
     * @param {PeerSignal} signal 
     */
    async answer(signal){
        // Set the remote description of the other peer
        // Can be applied on both initiator and joiner
        this.pc.setRemoteDescription(new RTCSessionDescription(signal));
        if(this.isHost) return;
        // Create an answer signal
        const answer = await this.pc.createAnswer();
        // answer.sdp = Peer.filterTrickle(answer.sdp);
        await this.pc.setLocalDescription(answer);
        this.signalData = new PeerSignal(answer, this.partner, this.uuid);
        // Then wait for ice to finish gathering to send the answer signal
        this.wait_ice();
    }

    wait_ice(){
        const icestatechange = async (ev) => {
            console.log(`Current Ice state: ${this.pc.iceGatheringState}`);
            if(this.pc.iceGatheringState === 'complete'){
                // Change local description
                this.signalData.sdp = this.pc.localDescription.sdp; 

                // Perform state change
                this.state = this.isHost ? 
                    this.state !== Peer.State.INIT_REOFFER ? 
                        Peer.State.WAIT_ANSWER : Peer.State.WAIT_REANSWER 
                : Peer.State.WAIT_CONNECT;
            }
        }

        this.pc.addEventListener('icegatheringstatechange', icestatechange);
    }

    /**
     * 
     * @param {String} reofferFrom 
     */
    async init(reofferFrom = null){
        const pc = this.pc = new RTCPeerConnection(this.network.RTC_Config);
        const dc = this.dc = pc.createDataChannel('data', {
            reliable: true
        });

        // To lock the current state of the network
        if(this.isHost) this.offer()
        else this.state =  Peer.State.WAIT_OFFER;

        // Event Listeners Here
        let con = false, dat = false;

        pc.addEventListener('connectionstatechange', ev => {
            console.log(`Connection state change [${this.uuid}]: ${pc.connectionState}`);
            switch(pc.connectionState){
                case 'connected':
                    con = true;
                    if(con && dat) this.state = Peer.State.CONNECTED;
                    break;
                case 'failed':
                    console.error(`Failed when establishing connection`);
                    break;
                case 'disconnected':
                case 'closed':
                    console.log(`Disconnedted Peer`);
                    this.destroy();
                    break;
            }
        })

        pc.addEventListener('datachannel', (ev) => {
            this.dc = ev.channel;

            this.dc.onopen = (ev) => {
                dat = true;
                if(con && dat) this.state = Peer.State.CONNECTED;
                dc.addEventListener('message', (data) => this._onMessage(data));
                this.setup();
            }

        })
    }

    _onMessage(event){
        const data = event.data;

        // ping signal
        if(data === Peer.PING_START){
            this.send(Peer.PING_END); // send a ping end signal
        }else if(data === Peer.PING_END){
            this.pingArrive();
        }else{
            // Parse the compressed string
            let processed = data;
            try {
                processed = parse(data);

                // Emit any attached custom events
                if(!Array.isArray(processed)) throw new Error("No-Type Data");
                this.network?.data(processed, this);
                return;
            }catch(err){
                console.warn(err === "No-Type Data" ? 
                "Received data without type" : 
                `Uncompressed data received: `, data);
            }

            this.network?.data(processed, this);
        }
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
        try {
            this.send(Peer.PING_START);
        }catch(err){
            console.log(`Error pinging: `, err);
        }
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
            this.answer(data);
            // this.peer.signal(data);
        }catch(err){
            console.error(`Error when signaling peer [${this.uuid}]: `, err);
        }
    }

    /**
     * Sends data to the peer
     * @param {Object} data Will always be an object
     */
    send(data){
        const d = typeof data === "string" ? data : stringify(data);
        try{
            // console.log(`Trying to send data: ${data}`);
            this.dc.send(d);
        }catch(err){
            console.log(`Error when sending: `, data, err);
        }
    }

    /**
     * 
     * @param {(Peer | String)} peer 
     * @returns {Boolean}
     */
    equals(peer){
        if(!(typeof peer === "string" || peer instanceof Peer)) return false;
        const other = typeof peer === "string" ? peer : peer.uuid;
        return other === this.uuid || other === this.partner;
    }

    destroy(){
        try {
            clearInterval(this.pingInterval);
            this.dc.close();
            this.pc.close();
            this.state = Peer.State.DISCONNECTED;
        }catch(err){
            console.error(`Error when destroying Peer ${this.uuid}`, err);
        }
    }
}

export default Peer;