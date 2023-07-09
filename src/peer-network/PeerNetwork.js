import Peer from "./Peer";
import PeerArray from "./PeerArray";

class PeerNetworkConfig{
    host = false;
    transfer_enabled = true;
    is_transferring = false;
    transfer_timeout = 2000;

    // More Options in the future
    // reconnect = false;
}

// haha lol, too lazy to do redundant assignments
export default class PeerNetwork extends PeerNetworkConfig{

    //#region PeerArrays

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

    //#endregion PeerArrays

    //#region Events
    //#endregion Events

    /**
     * 
     * @param {PeerNetworkConfig} opts Peer Network Configuration
     */
    constructor(opts){
        super();

        // apply options
        Object.assign(this, opts);

        // start network
        this.restart(this.host);
    }

    /**
     * 
     * @param {Boolean} host 
     */
    restart(host = false){
        this.host = host;

        // Remove all dangling webrtc connection
        // this.active.clean();
        // this.initialized.clean();
        // this.processing.clean();

        // If host then create an initiator peer
        if(this.host) this.offer();
    }


    offer(){
        if(!this.host) return;
        const peer = new Peer(this);

        const success = this.initialized.add(peer);
        if(!success) throw new Error("Failed to add peer on initialization");
    }

    answer(){

    }
    
}