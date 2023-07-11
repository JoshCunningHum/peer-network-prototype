<template>
    <div class="input-group">
        <input type="text" :value="text" readonly class="form-control form-control-sm" style="cursor: pointer;" @click="copy">
        <button class="input-group-text" ref="button" @click="copy">Copy</button>
    </div>
</template>

<script>
    export default {
        name: "CopyReadonly",
        props: {
            text: {
                required: true
            }
        },
        computed: {
            btn(){
                return this.$refs.button;
            }
        },
        methods: {
            copy(){
                if(this.text === "" || this.text === null || this.text === undefined) return;
                this.btn.innerText = "✅ Copied";
                this.btn.classList.add("text-success");
                navigator.clipboard.writeText(this.text);
            },
            reset(){
                this.btn.classList.remove("text-success");
                this.btn.innerText = "Copy";
            }
        },
        updated(){  
            this.reset();
        }
    }
</script>

<style lang="scss" scoped>

</style>