<template>
    <div class="d-flex flex-column gap-2">
        <div class="flex-fill">
            
        </div>
        <div class="form-control">

        </div>
    </div>
</template>

<script>
    export default {
        name: "ChatModal",
        data(){
            return {
                /**
                 * {
                 *      message: String
                 *      sender: String
                 *      messageID: String
                 * }
                 */
                data: [
                    {
                        message: "hey yo",
                        sender: "test"
                    },
                    {
                        message: "yo whats up",
                        sender: "own",
                    },
                    {
                        message: "nah just checkin",
                        sender: "test"
                    }
                ],
                /**
                 *  Contains message IDs that are generated using the add chat. These pendings will be displayed as if it is not yet sent.
                 *  Only when verifyChat with the corresponding messageID will this be verified
                 */
                pending: [],
                input: ""
            }
        },
        props: {
            initialData: {
                type: Array,
                default: () => []
            },
            ownId: {
                type: String,
                require: true
            },
            verifySend: {
                type: Boolean,
                default: false
            }
        },
        methods: {
            addChat(message, sender, messageID = null){
                this.data.push({sender, message, messageID});
            },
            sendChat(){
                const gen = this.generateID();
                this.addChat(this.input, this.ownId, gen);
                if(this.verifySend) this.pending.push(gen);
            },
            isPending(chat){
                return this.pending.some(p => chat.messageID === p);
            },
            generateID(){
                return Math.random().toString(36).slice(2, 10);
            },
            verify(messageID){
                const index = this.pending.findIndex(id => messageID === id);
                if(index === -1) return;
                this.pending.splice(index, 1);
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>