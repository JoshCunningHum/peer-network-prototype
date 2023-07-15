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
                <h4>Ping History</h4>
                <Line :data="pingChartData" :options="chartOptions" />
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
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

    export default {
        name: "PeerView",
        data(){
            return {
                /**
                 * {
                 *  time: (Number | String) (get from Date.now() when updating ping)
                 *  
                 * }
                 */
                pingHistory: [{
                    time: 0,
                    value: 0
                }],
                chartOptions: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            
                            // display: false,
                            ticks: {
                                // eslint-disable-next-line no-unused-vars
                                callback: (v, i, arr) => {
                                    const length = arr.length,
                                          gap = this.network.ping_interval,
                                          diff = (length - i) - 1,
                                          elapsed = gap * diff;

                                    return `${elapsed / 1000}s ago`;
                                }
                            }
                        },
                        y: {
                                ticks: {
                                    callback: function(label) {
                                        return label + ' ms';
                                    },
                                    stepSize: 1
                                },
                                scaleLabel: {
                                    display: true,
                                    labelString: '1s = 1000ms'
                                }
                            }
                    },
                    animation: {
                        duration: 0
                    },
                    datasets: {
                        line: {
                            tension: 0.2
                        }
                    }
                },
                pingWatchInterval: 0
            }
        },
        components: {
            CopyReadonly,
            Line
        },
        props: {
            peer: {
                required: false
            }
        },
        computed: {
            isPeerAvailable(){
                return this.peer !== undefined || this.peer !== null;
            },
            pingChartData(){
                return {
                    labels: this.pingHistory.map(p => p.time),
                    datasets: [ {data: this.pingHistory.map(p => p.value) }]
                }
            }
        },
        watch: {
            peer: {
                handler(){
                    this.$forceUpdate();
                    this.$refs.signaller?.reset();
                    if(!this.peer.connected) this.pingHistory = [];
                },
                deep: true
            }
        },
        mounted(){
            if(!this.peer.connected) return;

            this.pingWatchInterval = setInterval(() => {
                this.pingHistory.push({
                    time: Date.now(),
                    value: this.peer.pingms
                })
            }, this.network.ping_interval)
            
        },
        unmounted(){
            clearInterval(this.pingWatchInterval);
            this.pingHistory = [];
        },
        inject: ['network']
    }
</script>

<style lang="scss" scoped>
textarea {
    font-size: 12px;
    min-height: 200px;
}
</style>