
/**
 * 
 * @param {Number} [len = 8] the length of the id
 * @returns {String} 
 */
function peeruuid(len = 8){
    // generates a unique id for a peer
    return Math.random().toString(36).slice(2, 2 + len);
}

export {
    peeruuid
}