<template>
  <div id="app" class="container-fluid d-flex flex-column">

    <div class="row">
      <div class="col p-2 d-flex align-items-center gap-2">
        <div class="btn-group">
          <input type="radio" name="mode" class="btn-check" id="mode-host-btn" :value="true" v-model="host">
          <label for="mode-host-btn" class="px-4 btn btn-outline-dark">Host</label>

          <input type="radio" name="mode" class="btn-check" id="mode-join-btn" :value="false" v-model="host" checked>
          <label for="mode-join-btn" class="px-4 btn btn-outline-dark">Join</label>
        </div>
      </div>
    </div>

    <div class="flex-grow-1 row border-top border-secondary">
      <div class=" col-3 border-end">
        <!-- Pending Connections -->
        <PeerList :list="pending" />
      </div>
      <div class=" col border-end">
        
      </div>
      <div class=" col-3">
        <!-- Active Connections -->
        <PeerList :list="active" />
      </div>
    </div>

  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import PeerNetwork from './peer-network/PeerNetwork';
import PeerList from './components/PeerList.vue';

  const network = new PeerNetwork();
  window.network = network;
  
  export default {
    name: "App",
    components: {
      PeerList
    },
    data(){
      return {
        network
      }
    },
    computed: {
      host: {
        get(){
          return this.network.host;
        },
        set(value){
          this.network.restart(value);
        }
      },
      pending(){
        return [...this.network.initialized, ...this.network.processing]
      },
      active(){
        return this.network.active;
      }
    }
  }
</script>

<style lang="scss" scoped>
#app {
  height: 100vh;
  width: 100vw;
}
</style>