<template>
    <span>
        {{ ping }}ms
    </span>
</template>

<script>
    export default {
        name: "PeerPing",
        data(){
            return {
                ping: 0,
                i: null,
            }
        },
        props: {
            peer: {
                required: true
            }
        },
        inject: ['network'],
        mounted(){
            if(!this.network?.pinging) return;
            this.i = setInterval(() => {
                this.ping = this.peer.pingms;
            }, this.network.ping_interval)

        },
        unmounted(){
            clearInterval(this.i);
        }
    }
</script>

<style lang="scss" scoped>

</style>