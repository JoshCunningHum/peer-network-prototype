<template>
    <div class="p-3">

        <div class="h4 d-flex justify-content-between" v-if="isPeerAvailable">
            <span>{{ peer.isHost ? 'Initiator' : 'Joiner' }}</span>

            <span>
                <span class="badge bg-secondary">{{ peer.uuid }}</span>
                <span v-if="peer.connected"> 🔛 <span class="badge bg-secondary">{{ peer.partner }}</span></span>
            </span>

        </div>
        <div v-if="peer.connected" >

            <div class="flex-fill">
                <PeerPing :peer="peer" />
            </div>
            
            <div class="d-flex justify-content-end mt-2">
                <button class="btn btn-danger px-3">Disconnect</button>
            </div>

        </div>
        <div v-else>
        
            <div>
                <small>Signal Data</small>
                <CopyReadonly v-if="isPeerAvailable" :text="peer.signalData" />
            </div>
        </div>

    </div>
</template>

<script>
import CopyReadonly from './CopyReadonly.vue';
import PeerPing from './PeerPing.vue';

    export default {
        name: "PeerView",
        components: {
            CopyReadonly,
            PeerPing
        },
        props: {
            peer: {
                required: false
            }
        },
        computed: {
            isPeerAvailable(){
                return this.peer !== undefined || this.peer !== null;
            }
        },
        watch: {
            peer: {
                handler(){
                    this.$forceUpdate();
                    this.$refs.signaller?.reset();
                },
                deep: true
            }
        }
    }
</script>

<style lang="scss" scoped>
textarea {
    font-size: 12px;
    min-height: 200px;
}
</style>