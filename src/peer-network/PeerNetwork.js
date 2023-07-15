// eslint-disable-next-line no-unused-vars
import PeerSignal from "./PeerSignal";
import Peer from "./Peer";
import PeerArray from "./PeerArray";
import { parse } from "zipson/lib";
import { invokeIfAvailable } from "./PeerUtil";

//#region Event Definitions

/**
 * @callback DataEventCallback
 * @param {Array} data  The data that was sent. Already decrypted.
 * @param {Peer} sender The peer instance that relates to the callback.
 * @param {PeerNetwork} network Network instance.
 */

/**
 * @callback SignalProcessCallback
 * @param {PeerSignal} signal The signal detail
 * @param {Peer} peer The peer instance that relates to the callback
 * @param {PeerNetwork} network Network instance
 */

/**
 * @callback SignalConclusionCallback
 * @param {Peer} peer the peer instance that relates to the callback
 * @param {PeerNetwork} network Network instance
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

    //#endregion

    //#region Events

    /**
     * When an initiator peer created an offer.
     * @type {SignalProcessCallback}
     */
    _onOffer;
    /**
     * When a joiner peer created an answer to an offer
     * @type {SignalProcessCallback}
     */
    _onAnswer;
    /**
     * When an initiator peer received an answer to its own offer, but not connected yet.
     * @type {SignalProcessCallback}
     */
    _onConfirm;
    /**
     * When a peer is finally connected. Fired on both sides.
     * @type {SignalConclusionCallback}
     */
    _onConnect;

    /**
     * When an answer signal is received but the receiving initiator is not in its receiving state or the initiator is not yet existing. This will create a new initiator and sends back a brand new offer to the said joiner.
     *
     * This requires a specific logic when implimenting a signalling mechanism to identify which "client" contains the specific joiner.
     * @type {SignalProcessCallback}
     */
    _onReoffer;
    /**
     * When an initiated peer that is not yet connected is destroyed, it will call this event
     * @type {SignalConclusionCallback}
     */
    _onCancel;
    /**
     * When a peer that is connected got disconnected.
     * @type {SignalConclusionCallback}
     */
    _onDisconnect;

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
                this[`_on${event.charAt(0).toUpperCase() + event.slice(1)}`] =
                    cb;
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

    emit(event, ...args){
        if(!this._events[event]) return;
        this._events[event].forEach(ev => ev(...args));
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
            handler: null,
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
                callbackInfo.handler = this._onOffer;
                break;
            case WAIT_CONNECT:
                this.initialized.remove(peer);
                this.processing.add(peer);

                // Create another initiator peer when the initialized array is empty of non-reofffer initialized peer
                if (!this.hasAvailableInitiators) this.offer();

                callbackInfo.handler = this.host
                    ? this._onConfirm
                    : this._onAnswer;
                break;
            case CONNECTED:
                this.initialized.remove(peer); // Looks unnecessary but for some reason some times peer remains on initialized
                this.processing.remove(peer);
                this.active.add(peer);

                // Create another initiator peer when the initialized array is empty of non-reofffer initialized peer
                if (!this.hasAvailableInitiators) this.offer();

                callbackInfo.handler = this._onConnect;
                callbackInfo.args = [peer];
                break;
            case WAIT_REANSWER:
                if (!this.host) return;
                this.initialized.add(peer);
                callbackInfo.handler = this._onReoffer;
                break;
            case CANCELLED:
                this.initialized.remove(peer);
                this.processing.remove(peer);

                // Create another initiator peer when the initialized array is empty of non-reofffer initialized peer
                if (!this.hasAvailableInitiators) this.offer();

                callbackInfo.handler = this._onCancel;
                break;
            case DISCONNECTED:
                this.active.remove(peer);
                callbackInfo.handler = this._onDisconnect;
                break;
            default:
                // Does not do anything
                return;
        }

        invokeIfAvailable(
            callbackInfo.handler,
            ...callbackInfo.args,
            this
        );
    }

    /**
     * Invoked by peers when a data event happens
     * @param {String} data the raw data sent through WebRTC
     */
    data(data) {
        /**
         * @type {Object[]}
         */
        const processed = parse(data),
            ev = processed.shift();

        invokeIfAvailable(this._events.get(ev), ...processed);
    }

    // /**
    //  * Disconnect from the network if joiner, or removes a single peer if initiator
    //  * @param {(Peer | String)} peer  
    //  */
    // disconnect(peer){
    //     // TODO: Perform transfer here
    //     this.active.clean();
    //     this.processing.clean();
    //     this.initialized.clean();
    // }
}
