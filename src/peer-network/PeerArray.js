import Peer from "./Peer";

/**
 * @typedef PeerArray
 * @extends {Array<Peer>}
 */
export default class PeerArray extends Array{
    

    /**
     * 
     * @param {(String | Number)} peer gets the peer object using the id or the index
     * @returns 
     */
    get(peer){
        if(peer instanceof Peer) return peer;
        const index = (typeof peer === "number") ? peer : this.findIndex(peer);
        if(index == -1) return null;
        return this[index];
    }

    /**
     * 
     * @param {(String | Peer)} peer 
     * @returns {Boolean}
     */
    has(peer){
        return this.index(peer) !== -1;
    }

    /**
     * 
     * @param {(String | Peer)} peer can accept id or the peer object
     * @returns 
     */
    index(peer){
        return this.findIndex(p => {
            return peer instanceof Peer ? p.equals(peer) :
                typeof peer === "string" ? p.uuid === peer : false;
        })
    }

    /**
     * return the length of the peer array
     * @returns {Number}
     */
    size(){
        return this.length;
    }

    /**
     * Returns a boolean wether the add operation is succesful or not
     * @param {Peer} peer 
     * @returns {Boolean}
     */
    add(peer){
        if(this.has(peer) || !(peer instanceof Peer)) return false;
        this.push(peer);
        return true;
    }

    /**
     * 
     * @param {Peer} peer 
     * @returns {(Peer | null)}
     */
    remove(peer){
        const index = this.index(peer);
        if(index == -1) return null;
        return this.slice(index, 1)[0];
    }

    clean(){
        this.forEach(p => p.destroy());
        this.length = 0;
    }
}