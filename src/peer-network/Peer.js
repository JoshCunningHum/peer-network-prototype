/* eslint-disable no-unused-vars */
import PeerNetwork from "./PeerNetwork";
import SimplePeer from "simple-peer";
import { peeruuid } from "./PeerUtil";

export default class Peer{
    
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

    destroy(){

    }
}