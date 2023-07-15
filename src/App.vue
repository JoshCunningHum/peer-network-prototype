<template>
  <div id="app" class="container-fluid d-flex flex-column">

    <div class="row">
      <div class="col p-2 d-flex align-items-center justify-content-between gap-2">

        <div class="btn-group">
          <input type="radio" name="mode" class="btn-check" id="mode-host-btn" :value="true" v-model="host">
          <label for="mode-host-btn" class="px-4 btn btn-outline-dark">Host</label>

          <input type="radio" name="mode" class="btn-check" id="mode-join-btn" :value="false" v-model="host" checked>
          <label for="mode-join-btn" class="px-4 btn btn-outline-dark">Join</label>
        </div>

        <button class="btn btn-primary">Chat</button>
      </div>
    </div>

    <div class="flex-grow-1 row border-top border-secondary">
      <div class="d-flex flex-column col-3 border-end py-2">
        <!-- Pending Connections -->
        <div class="flex-fill d-flex flex-column gap-1">
          <PeerList @showPeer="showPeerOptions" :list="pending" :highlight="activePeer" />
        </div>

        <!-- Peer Initializer -->
        <button v-if="host" class="btn btn-secondary w-100" @click="createOffer">Create Offer</button>

      </div>
      <div class="d-flex flex-column col border-end p-0">
        <!-- Peer Options and Operations -->

        <div class="d-flex flex-column flex-fill">
          <PeerView v-if="activePeer !== null" :peer="activePeer" ref="peerview"/>
          <div v-else
            class="h5 text-secondary text-uppercase d-flex justify-content-center align-items-center w-100 h-100 flex-fill">
            No Peer Selected
          </div>
        </div>
        
        
          <div class="border-top p-3">

            <div v-if="host">
              <small>Immediate Offer Signal</small>
              <CopyReadonly :text="network.availableInitiator?.signalData" />
            </div>
            <div>
              <PeerSignaller :initiator="host" @showPeer="showPeerOptions" />
            </div>

          </div>


      </div>
      <div class="d-flex flex-column col-3 py-2 gap-1">
        <!-- Active Connections -->
        <PeerList  @showPeer="showPeerOptions" :list="active" />
      </div>
    </div>

    <!-- Modals -->
    <ModalManager 
    :open="modalOpen" 
    :modal="modal" 
    
    
    />

  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import { computed } from 'vue';

// Peer Network Classes
import PeerNetwork from './peer-network/PeerNetwork';
import PeerList from './components/PeerList.vue';
import Peer from './peer-network/Peer';

// Utility Classes
import EventBus from './util/Event';

// Components
import PeerView from './components/PeerView.vue';
import CopyReadonly from './components/CopyReadonly.vue';
import PeerSignaller from './components/PeerSignaller.vue';
import ChatComponent from './components/ChatComponent.vue';
import ModalManager from './components/ModalManager.vue';

const bus = new EventBus();

const network = new PeerNetwork();
window.network = network;
window.Peer = Peer;

export default {
  name: "App",
  components: {
    PeerList,
    PeerView,
    CopyReadonly,
    PeerSignaller,
    ModalManager
  },
  data() {
    return {
      network,
      activePeer: null,
      modalOpen: false,
      modal: ChatComponent
    }
  },
  created(){
    // Setup Listeners here


    network.on("connect", () => {
      this.activePeer = null;
      this.$forceUpdate();
    })

    // 
  },
  computed: {
    host: {
      get() {
        return this.network.host;
      },
      set(value, old) {
        this.network.restart(value);
        if(value !== old) this.activePeer = null;
      }
    },
    pending() {
      return [...this.network.initialized, ...this.network.processing]
    },
    active() {
      return this.network.active;
    }
  },
  methods: {
    createOffer() {
      this.network.offer();
    },
    showPeerOptions(peer) {
      this.activePeer = peer;
    }
  },
  watch: {
    activePeer: {
      handler(peer) {
        if (peer === null || peer === undefined) return;
        if (peer.state === Peer.State.CANCELLED || peer.state === Peer.State.DISCONNECTED) {
          this.activePeer = null;
        }
      },
      deep: true
    }
  },
  provide() {
    return {
      network: this.network,
      bus: computed(() => bus)
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

<style>
.loading::after {
  display: inline-block;
  animation: dotty steps(1, end) 1s infinite;
  content: '';
}

@keyframes dotty {
  0% { content: ''; }
  25% { content: '.'; }
  50% { content: '..'; }
  75% { content: '...'; }
  100% { content: ''; }
}</style>