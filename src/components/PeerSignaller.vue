<template>
    <div>

        <label for="inp-answer" class="form-label"><small>{{ initiator ? 'Confirm' : 'Answer' }} Here: </small></label>
        <textarea id="inp-answer" class="form-control" v-model="response" @click="response = ''"></textarea>
        <div class="form-text" ref="notification"></div>

    </div>
</template>

<script>
import PeerSignal from '@/peer-network/PeerSignal';

    export default {
        name: "PeerSignaller",
        data(){
            return {
                response: null
            }
        },
        props: {
            initiator: {
                type: Boolean,
                require: false,
                default: false
            }
        },
        computed: {
            notif(){
                return this.$refs.notification
            }
        },
        methods: {
            reset(){
                this.notif.innerHTML = "";
            }
        },
        watch: {
            response(value){
                if(value === "") return;
                // validate the input if it was a valid answer
                const validity = PeerSignal.validate(value),
                    types = ["answer", "offer"],
                    [opposite, required] = this.initiator ? types.reverse() : types;

                if(validity.value && validity.type === required){
                    this.notif.innerHTML = "";

                    // Invoke Network Method
                    const peer = this.network.signal(validity.parsed);

                    // Auto highlight the lone joiner peer
                    if(!this.initiator) this.$emit("showPeer", peer);



                }else if(validity.value){
                    this.notif.innerHTML = `The text that was pasted is a valid <strong>${opposite} signal</strong> but not the required <strong> ${required} signal </strong>`;
                    this.response = "";
                }else{
                    this.notif.innerHTML = `Please paste a valid <strong> ${required} signal </strong>.`;
                    this.response = "";
                }
            }
        },
        inject: ['network'],
        emits: ["showPeer"]
    }
</script>

<style lang="scss" scoped>

</style>
