<template>
    <div>
        <!-- Peer <span class="badge bg-secondary">{{  uuid }}</span> -->
    </div>
</template>

<script>
import { reactive, toRef } from 'vue';
import Peer from '../peer-network/Peer';

    export default {
        name: "PeerDiv",
        setup(){
            const peer = reactive(this.peer || {});

            return {
                ...toRef(peer)
            }
        },
        props: {
            peer: Peer
        }
    }
</script>

<style lang="scss" scoped>

</style>