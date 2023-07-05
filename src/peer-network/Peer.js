// eslint-disable-next-line no-unused-vars
import PeerNetwork from "./PeerNetwork";
import { peeruuid } from "./PeerUtil";

export default class Peer{
    
    uuid = peeruuid();
    /**
     * @type {PeerNetwork}
     */
    network;

    /**
     * 
     * @param {PeerNetwork} network 
     */
    constructor(network){
        this.network = network;
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
}