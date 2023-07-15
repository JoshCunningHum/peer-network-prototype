<template>
    <teleport to="#modal-cont">
        <div v-if="open">
            <div id="modal-backdrop" @click="this.$emit('backdrop')">

            </div>
            <component :is="modal" :="$attrs" > </component>
        </div>
    </teleport>
</template>

<script>

    export default {
        name: "ModalManager",
        props: {
            open: {
                type: Boolean,
                default: false
            },
            modal: {
                require: false
            }
        },
        emits: ['backdrop'],
        inheritAttrs: false
    }
</script>

<style lang="scss" scoped>

</style>