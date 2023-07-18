<template>
    <div v-for="peer in list" :key="peer.uuid" :class="`peer btn btn-${getStateTheme(peer)} w-100 ${peer.equals(highlight) ? 'active' : ''}`">
        <div class="d-flex justify-content-between align-items-center" @click="showPeer(peer)">
            
            <span v-if="peer.connected">
                <PeerPing :peer="peer" />
            </span>
            <span v-else class="loading">
                {{ getStateDescription(peer)}}
            </span>

            <span class="badge bg-light text-light-emphasis" style="top: 0;">{{  peer.uuid }}</span> 
            <!-- <br> <small class="small">{{  peer.stateName }}</small> -->

        </div>
    </div>
    <template v-if="connectedList && !network.host && list.length > 0">
        <hr class="my-1">

        <!-- Add Participants Here -->
        <template v-for="peer in participants" :key="peer">

            <div v-if="peer !== network.active[0].uuid" :class="`peer btn d-flex justify-content-end btn-success w-100`">
                <span></span>
                <span class="badge bg-light text-light-emphasis" style="top: 0;">
                    {{  peer }}
                </span>
            </div>

        </template>
    </template>
</template>

<script>
import PeerPing from './PeerPing.vue';

    export default {
        name: "PeerList",
        components: {
            PeerPing
        },
        data(){
            return {
                active: null,
                participants: []
            }
        },
        props: {
            list: {
                type: Array,
                required: true,
            },
            highlight: {
                required: false
            },
            connectedList: {
                type: Boolean,
                default: false
            }
        },
        methods: {
            getStateTheme(peer){
                switch(peer.stateName){
                    case "WAIT_CONNECT":
                        return "warning";

                    case "WAIT_REANSWER":
                        return "danger";

                    case "CONNECTED":
                        return "success";

                    default:
                        return "outline-secondary";
                }
            },
            getStateDescription(peer){
                const p = "Waiting for ";

                switch(peer.stateName){
                    case "WAIT_CONNECT":
                        return p + "connection";

                    case "WAIT_OFFER":
                        return p + "an offer";

                    case "WAIT_ANSWER":
                    case "WAIT_REANSWER":
                        return p + "an answer";

                    case "CONNECTED":
                        return "";

                    default:
                        return "something";
                }
            },
            showPeer(peer){
                this.active = peer;
                this.$emit("showPeer", peer);
            },
            updateParticpants(){
                this.participants.splice(0);
                this.participants.push(...this.network.participants);
            }
        },
        created(){
            this.network.on("participant-init-data", this.updateParticpants);
            this.network.on("participant-modify", this.updateParticpants);
            this.network.on("disconnect", this.updateParticpants);
        },
        emits: ['showPeer'],
        inject: ['network']
    }
</script>

<style lang="scss" scoped>
.peer {

}
</style>