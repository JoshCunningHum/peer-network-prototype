<template>
    <div v-for="peer in list" :key="peer.uuid" class="peer">
        <PeerDiv :peer="peer" />
    </div>
</template>

<script>
    import PeerDiv from './PeerDiv.vue';    

    export default {
        name: "PeerList",
        components: {
            PeerDiv
        },
        props: {
            list: {
                type: Array,
                required: true,
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>