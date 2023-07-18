// eslint-disable-next-line no-unused-vars
import PeerSignal from "./PeerSignal";
import Peer from "./Peer";
import PeerArray from "./PeerArray";
import { parse } from "zipson/lib";

//#region Event Definitions

/**
 * @callback DataEventCallback
 * @param {...Object} data  The data that was sent. Already decrypted.
 * @param {Peer} sender The peer instance that relates to the callback.
 */

/**
 * @callback SignalProcessCallback
 * @param {PeerSignal} signal The signal detail
 * @param {Peer} peer The peer instance that relates to the callback
 */

/**
 * @callback SignalConclusionCallback
 * @param {Peer} peer the peer instance that relates to the callback
 */

//#endregion

class PeerNetworkConfig {
    host = false;
    transfer_enabled = true;
    is_transferring = false;
    transfer_timeout = 2000;
    /**
     * Saves all instance of peers even if it is destroyed.
     */
    save_history = false;
    pinging = true;
    ping_interval = 1000; // ms

    /**
     * Default RTCPeerConnection configuration when instantiating peers
     * @type {RTCConfiguration}
     */
    RTC_Config = {
        iceServers: [  
            {
                urls: [
                    'stun:stun1.l.google.com:19302',
                    'stun:stun2.l.google.com:19302'
                ]
            }
        ]
    }

    // More Options in the future
    // reconnect = false; // Requires a signal handler
}

// haha lol, too lazy to do redundant assignments
export default class PeerNetwork extends PeerNetworkConfig {
    //#region Peer Containers

    /**
     * All active connections.
     * Only 1 for non-host (Joining Peer).
     */
    active = new PeerArray();
    /**
     * All initialized peers.
     * Host: All offering initiators (not confirming).
     * Joiner: Joining peer waiting for offer.
     */
    initialized = new PeerArray();
    /**
     * All processing peers.
     * Host: All initiators after confirming.
     * Joiner: Joining peer after answering an offer.
     */
    processing = new PeerArray();
    /**
     * All created instance of peers. Only works when save_history is enabled;
     */
    history = new PeerArray();

    /**
     * Contains the ids of the any other particpants in the network.
     * @readonly
     * @type {String[]}
     */
    _participants = [];

    /**
     * @readonly
     */
    get participants(){
        if(this.host) return this.active.map(p => p.partner);
        return this._participants;
    }

    //#endregion

    //#region Events
    // Why? To document all of these. The workflow of this thing gets confusing.

    /**
     * When an initiator peer created an offer.
     * @type {SignalProcessCallback[]}
     */
    _onOffer = [];
    /**
     * When a joiner peer created an answer to an offer
     * @type {SignalProcessCallback[]}
     */
    _onAnswer = [];
    /**
     * When an initiator peer received an answer to its own offer, but not connected yet.
     * @type {SignalProcessCallback[]}
     */
    _onConfirm = [];
    /**
     * When a peer is finally connected. Fired on both sides.
     * @type {SignalConclusionCallback[]}
     */
    _onConnect = [];

    /**
     * When an answer signal is received but the receiving initiator is not in its receiving state or the initiator is not yet existing. This will create a new initiator and sends back a brand new offer to the said joiner.
     *
     * This requires a specific logic when implimenting a signalling mechanism to identify which "client" contains the specific joiner.
     * @type {SignalProcessCallback[]}
     */
    _onReoffer = [];
    /**
     * When an initiated peer that is not yet connected is destroyed, it will call this event
     * @type {SignalConclusionCallback[]}
     */
    _onCancel = [];
    /**
     * When a peer that is connected got disconnected.
     * @type {SignalConclusionCallback[]}
     */
    _onDisconnect = [];

    /**
     * @type {Object}
     */
    _events = {};

    //#endregion

    /**
     *
     * @param {PeerNetworkConfig} opts Peer Network Configuration
     */
    constructor(opts) {
        super();

        // apply options
        Object.assign(this, opts);

        // start network
        this.restart(this.host);

        // In Built Events

        // Only arrive in joiner peer
        this.on('participant-init-data', data => {
            console.log(`Participant Data Arrived: `, data);
            this._participants = data;
        })

        // Only arrive in joiner peer
        this.on('participant-modify', (data, state) => {
            console.log(`Participant Modify: ${data}[${state ? "ADD" : "REMOVE"}]`)
            const i = this.participants.findIndex(uid => uid === data);
            if(i === -1 && state) this.participants.push(data);
            else if(!state) this.participants.splice(i, 1);
        })
    }

    /**
     * Re-start the network and removes all peer connections. Allows changing roles.
     * @param {Boolean} host
     */
    restart(host = false) {
        this.host = host;

        // Remove all dangling webrtc connection
        this.active.clean();
        this.initialized.clean();
        this.processing.clean();

        // If host then create an initiator peer
        if (this.host) this.offer();
    }

    /**
     * Creates an initiator peer and returns it.
     * @param {String} [reofferFrom = null]
     * @returns {Peer}
     */
    offer(reofferFrom = null) {
        if (!this.host) return null;
        // Creates a initiator peer, when an offer signal is created, it will be added in the initialized array
        return new Peer(this, reofferFrom);
    }

    /**
     * Creates a joiner peer and answers an offer signal. If a joiner peer is already created and a its already processing, then perform a re-answer event where the existing joiner peer is destroyed and re-invoke the offer signal
     * @param {(String | PeerSignal)} offerSignal
     * @returns {Peer}
     */
    answer(offerSignal) {
        // Do not continue when not a host or already connected (You have to use restart)
        if (this.host || !this.active.isEmpty()) return null;
        if (typeof offerSignal === "string") offerSignal = parse(offerSignal);

        if (this.processing.isEmpty()) {
            // Create a joiner peer and signal the offer
            const peer = new Peer(this);
            peer.signal(offerSignal);
            return peer;
        } else {
            // If the joiner peer is already processing, then this is a result of a reoffer.
            // Remove the peer waiting for connection in processing and re invoke this method
            this.processing.clean();
            return this.answer(offerSignal);
        }
    }

    /**
     *
     * @param {(PeerSignal | String)} answerSignal
     * @returns {Peer} returns the specified initiator or the recent instanciated initiator peer created from a reoffer event
     */
    confirm(answerSignal) {
        if (typeof answerSignal === "string")
            answerSignal = parse(answerSignal);
        const { sender } = answerSignal;

        // Find the initiator specified in the initalized array
        const initiator = this.initialized.get(sender);
        console.log(`Confirming offer from sender ${sender}`);
        /* 
            If initiator is not found because
                - already connected (in the active)
                - already confirming (in the processing)
                - not found because not generated
            Emit a re-offer event
        */
        if (initiator === null) {
            return this.offer(true);
        }

        initiator.signal(answerSignal);
        return initiator;
    }

    /**
     * Chooses what to invoke base on the current role.
     * @param {(PeerSignal | String)} signal
     */
    signal(signal) {
        return this.host ? this.confirm(signal) : this.answer(signal);
    }

    /**
     *
     * @param {String} event
     * @param {(SignalProcessCallback | DataEventCallback)} cb
     */
    on(event, cb) {
        switch (event) {
            case "offer":
            case "answer":
            case "confirm":
            case "connect":
            case "reoffer":
            case "cancel":
            case "disconnect":
                // Tinapulan, ye I know, stfu
                // All description and details of each events are documented above
                this[`_on${event.charAt(0).toUpperCase() + event.slice(1)}`].push(cb);
                break;
            default:
                this._events[event] = this._events[event] || [];
                this._events[event].push(cb);
        }
    }

    off(event, cb){
        if(!this._event[event]) return;
        const i = this._events[event].findIndex(ev => ev === cb);
        if(i === -1) return;
        this._events[event].splice(i, 1);
    }

    get hasAvailableInitiators() {
        if (!this.host) return false;
        return this.initialized.some((p) => p.state === Peer.State.WAIT_ANSWER); // since reoffers have WAIT_REANSWER
    }

    get availableInitiator() {
        return this.initialized.find((p) => p.state === Peer.State.WAIT_ANSWER);
    }

    /**
     * Handles peer state changes
     * @param {Peer} peer
     * @param  {...any} data
     * @private
     */
    handle(peer) {
        const state = peer.state;

        // TODO: Make sure peer is aligned with the current role of the network. Remove it if not.

        const {
            INIT_PEER,
            WAIT_ANSWER,
            WAIT_CONNECT,
            WAIT_REANSWER,
            CONNECTED,
            CANCELLED,
            DISCONNECTED,
        } = Peer.State;

        const callbackInfo = {
            event: null,
            args: [peer.signalData, peer],
        };

        switch (state) {
            case INIT_PEER:
                // TODO: Do some reactive updates for vue and other things
                if (this.save_history) this.history.add(peer);
                if (!this.host) this.initialized.add(peer);
                return;
            case WAIT_ANSWER:
                // Do not execute when current network is not host
                if (!this.host) return;
                this.initialized.add(peer);
                callbackInfo.event = this._onOffer;
                break;
            case WAIT_CONNECT:
                this.initialized.remove(peer);
                this.processing.add(peer);

                // Create another initiator peer when the initialized array is empty of non-reofffer initialized peer
                if (!this.hasAvailableInitiators) this.offer();

                callbackInfo.event = this.host
                    ? this._onConfirm
                    : this._onAnswer;
                break;
            case CONNECTED:

                this.initialized.remove(peer); // Looks unnecessary but for some reason some times peer remains on initialized
                this.processing.remove(peer);
                this.active.add(peer);

                // For sending participants data on connect
                if(this.host){
                    // Send all current participants, exluding self
                    this.whisper('participant-init-data', peer, this.participants.flat());
                    // Send the new joiner to all other peers
                    this.exclude('participant-modify', peer, peer.partner, true);
                }

                // Create another initiator peer when the initialized array is empty of non-reofffer initialized peer
                if (!this.hasAvailableInitiators) this.offer();


                callbackInfo.event = this._onConnect;
                callbackInfo.args = [peer];
                break;
            case WAIT_REANSWER:
                if (!this.host) return;
                this.initialized.add(peer);
                callbackInfo.event = this._onReoffer;
                break;
            case CANCELLED:
                this.initialized.remove(peer);
                this.processing.remove(peer);

                // Create another initiator peer when the initialized array is empty of non-reofffer initialized peer
                if (!this.hasAvailableInitiators) this.offer();

                callbackInfo.event = this._onCancel;
                break;
            case DISCONNECTED:
                this.active.remove(peer);
                // Send the removal of this participant
                if(this.host) this.broadcast('participant-modify', peer.partner, false);
                else this.participants.splice(0);

                callbackInfo.event = this._onDisconnect;
                break;
            default:
                // Does not do anything
                return;
        }

        callbackInfo.event.forEach(fn => fn(...callbackInfo.args, this));
    }

    /**
     * Invoked by peers when a data event happens
     * @param {Object[]} data the processed data
     * @param {Peer} sender the peer who sent the data
     */
    data(data, sender) {
        /**
         * @type {Object[]}
         */
        const ev = Array.isArray(data) ? data.shift().split(':') : null;
        data = Array.isArray(data) ? data : [data];

        // Relay of data to other peers
        if(this.host){
            if(ev && ev[0] !== ""){
                // This is a whisper event
                const targets = ev.slice(0, -1);

                // Relay the data to specified targets
                this.active.filter(p => {
                    // Do not include the sender
                    return !sender.equals(p) && 
                    // If the peer matches with any of specified targets
                    targets.some(uid => p.equals(uid));
                }).forEach(p => {
                    p.send(data);
                })

                // Do not execute the function if the host is not included
                if(!targets.some(uid => sender.equals(uid))) return;
                
            }else{
                // A broadcast event
                this.active.forEach(p => {
                    // Do not include the sender
                    if(!sender.equals(p)) return;
                    p.send(data);
                })
            }
        }

        if(this._events[ev.at(-1)]){
            this._events[ev.at(-1)].forEach(fn => {
                fn(...data, sender)
            })
        }
    }

    /**
     * Sends data to all clients
     * @param {String} event The event type to emit 
     * @param {Object[]} data The data to send to all clients in the network
     */
    broadcast(event,...data){
        // Add broadcast signature
        data.unshift(`:${event}`);
        this.active.forEach(p => p.send(data));
    }

    /**
     * Sends data to a specified group of peers
     * @param {String} event the event type to emit
     * @param {(String[] | Object[])} targets the peers to send the data to
     * @param  {...any} data The data to send to those specified peers
     */
    distribute(event, targets, ...data){
        if(!Array.isArray(targets)) targets = [targets];
        targets = targets.map(t => typeof t === "string" ? t : t.partner);
        data.unshift(`${targets.join(':')}:${event}`);
        // if host, just find said targets
        if(this.host){
            this.active.forEach(p => {
                if(!targets.some(t => p.equals(t))) return;
                p.send(data);
            })
        }else this.active[0].send(data);
    }

    /**
     * Sends data to all peers except to specified targets. Only works for hosts
     * @param {String} event the event type to emit
     * @param {String[] | Object[]} targets the peers that are excluded
     * @param  {...any} data The data to send 
     */
    exclude(event, targets, ...data){
        if(!this.host) return;
        if(!Array.isArray(targets)) targets = [targets];
        targets = targets.map(t => typeof t === 'string' ? t : t.partner);
        data.unshift(event);
        this.active.forEach(p => {
            if(targets.some(t => p.equals(t))) return;
            p.send(data);
        })
    }

    /**
     * Sends data to a specific client
     * @param {String} event The event type to emit
     * @param {(Peer | String)} peer The peer object to send to or the id
     * @param  {Object[]} data The data to send to a specific client
     */
    whisper(event, peer, ...data){
        if(!(peer instanceof Peer || typeof peer === 'string')) throw new Error("Whisper only accepts string or Peer Instance");
        this.distribute(event, [peer], ...data);
    }

    /**
     * Disconnect from the network if joiner, or removes a single peer if initiator
     * @param {(Peer | String)} peer  
     */
    disconnect(peer){
        this.active.remove(peer);
        this.processing.remove(peer);
        this.initialized.remove(peer);
        peer.destroy();
    }
}
