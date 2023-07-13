
/**
 * 
 * @param {Number} [len = 8] the length of the id
 * @returns {String} 
 */
function peeruuid(len = 8){
    // generates a unique id for a peer
    return Math.random().toString(36).slice(2, 2 + len);
}

/**
 * simple-peer sends data as an array of numbers, this is copied from stackoverflow to convert that array to string
 * @param {Array} array Array of unsigned 8-bit integer to string
 * @returns {String}
 */
function Utf8ArrayToStr(array) {
    var out, i, len, c;
    var char2, char3;

    out = "";
    len = array.length;
    i = 0;
    while(i < len) {
    c = array[i++];
    switch(c >> 4)
    { 
      case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
        // 0xxxxxxx
        out += String.fromCharCode(c);
        break;
      case 12: case 13:
        // 110x xxxx   10xx xxxx
        char2 = array[i++];
        out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
        break;
      case 14:
        // 1110 xxxx  10xx xxxx  10xx xxxx
        char2 = array[i++];
        char3 = array[i++];
        out += String.fromCharCode(((c & 0x0F) << 12) |
                       ((char2 & 0x3F) << 6) |
                       ((char3 & 0x3F) << 0));
        break;
    }
    }

    return out;
}

function invokeIfAvailable(cb, ...args) {
    if (typeof cb === "function") cb(...args);
}

export {
    peeruuid,
    Utf8ArrayToStr,
    invokeIfAvailable
}