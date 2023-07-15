// Used for emit/listen events between different parts of the whole app

export default class Event{

    constructor(){
        /**
         * @private
         */
        this.e = {};
    }


    /**
     * @private
     * @param {String} event 
     * @returns {Boolean}
     */
    has(event){
        return this.e[event] !== undefined;
    }

    on(event, cb){
        this.e[event] = this.e[event] || [];
        this.e[event].push(cb);
    }

    off(event, cb){
        if(!this.has(event)) return;
        const i  = this.e[event].findIndex(ev => ev === cb);
        if(i === -1) return;
        this.e[event].splice(i, 1);
    }

    emit(event, ...args){
        if(!this.has(event)) return;
        this.e[event].forEach(ev => ev(...args));
    }
}