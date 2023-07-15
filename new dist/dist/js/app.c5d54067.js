(function(){"use strict";var e={6136:function(e,t,n){var i=n(9242),s=n(3396);const r=e=>((0,s.dD)("data-v-742a4501"),e=e(),(0,s.Cn)(),e),a={id:"app",class:"container-fluid d-flex flex-column"},o={class:"row"},l={class:"col p-2 d-flex align-items-center justify-content-between gap-2"},h={class:"btn-group"},c=r((()=>(0,s._)("label",{for:"mode-host-btn",class:"px-4 btn btn-outline-dark"},"Host",-1))),d=r((()=>(0,s._)("label",{for:"mode-join-btn",class:"px-4 btn btn-outline-dark"},"Join",-1))),u=r((()=>(0,s._)("button",{class:"btn btn-primary"},"Chat",-1))),p={class:"flex-grow-1 row border-top border-secondary"},g={class:"d-flex flex-column col-3 border-end py-2"},f={class:"flex-fill d-flex flex-column gap-1"},v={class:"d-flex flex-column col border-end p-0"},m={class:"d-flex flex-column flex-fill"},w={key:1,class:"h5 text-secondary text-uppercase d-flex justify-content-center align-items-center w-100 h-100 flex-fill"},y={class:"border-top p-3"},b={key:0},_=r((()=>(0,s._)("small",null,"Immediate Offer Signal",-1))),C={class:"d-flex flex-column col-3 py-2 gap-1"};function k(e,t,n,r,k,S){const E=(0,s.up)("PeerList"),x=(0,s.up)("PeerView"),D=(0,s.up)("CopyReadonly"),I=(0,s.up)("PeerSignaller"),N=(0,s.up)("ModalManager");return(0,s.wg)(),(0,s.iD)("div",a,[(0,s._)("div",o,[(0,s._)("div",l,[(0,s._)("div",h,[(0,s.wy)((0,s._)("input",{type:"radio",name:"mode",class:"btn-check",id:"mode-host-btn",value:!0,"onUpdate:modelValue":t[0]||(t[0]=e=>S.host=e)},null,512),[[i.G2,S.host]]),c,(0,s.wy)((0,s._)("input",{type:"radio",name:"mode",class:"btn-check",id:"mode-join-btn",value:!1,"onUpdate:modelValue":t[1]||(t[1]=e=>S.host=e),checked:""},null,512),[[i.G2,S.host]]),d]),u])]),(0,s._)("div",p,[(0,s._)("div",g,[(0,s._)("div",f,[(0,s.Wm)(E,{onShowPeer:S.showPeerOptions,list:S.pending,highlight:k.activePeer},null,8,["onShowPeer","list","highlight"])]),S.host?((0,s.wg)(),(0,s.iD)("button",{key:0,class:"btn btn-secondary w-100",onClick:t[2]||(t[2]=(...e)=>S.createOffer&&S.createOffer(...e))},"Create Offer")):(0,s.kq)("",!0)]),(0,s._)("div",v,[(0,s._)("div",m,[null!==k.activePeer?((0,s.wg)(),(0,s.j4)(x,{key:0,peer:k.activePeer,ref:"peerview"},null,8,["peer"])):((0,s.wg)(),(0,s.iD)("div",w," No Peer Selected "))]),(0,s._)("div",y,[S.host?((0,s.wg)(),(0,s.iD)("div",b,[_,(0,s.Wm)(D,{text:k.network.availableInitiator?.signalData},null,8,["text"])])):(0,s.kq)("",!0),(0,s._)("div",null,[(0,s.Wm)(I,{initiator:S.host,onShowPeer:S.showPeerOptions},null,8,["initiator","onShowPeer"])])])]),(0,s._)("div",C,[(0,s.Wm)(E,{onShowPeer:S.showPeerOptions,list:S.active},null,8,["onShowPeer","list"])])]),(0,s.Wm)(N,{open:k.modalOpen,modal:k.modal},null,8,["open","modal"])])}var S=n(7327),E=(n(7658),n(6314),n(348));class x{constructor(e,t,n=null){(0,S.Z)(this,"type",void 0),(0,S.Z)(this,"sdp",void 0),(0,S.Z)(this,"sender",void 0),(0,S.Z)(this,"joiner",void 0),this.type=e.type,this.sdp=e.sdp,this.sender=t,this.joiner=n}toString(){return(0,E.stringify)(this)}static validate(e){try{"string"===typeof e&&(e=(0,E.parse)(e))}catch(t){return!1}return{value:["type","sdp","sender"].every((t=>Object.hasOwn(e,t))),type:e?.type,parsed:e}}}var D=n(8955),I=n.n(D);function N(e=8){return Math.random().toString(36).slice(2,2+e)}function P(e){var t,n,i,s,r,a;t="",i=e.length,n=0;while(n<i)switch(s=e[n++],s>>4){case 0:case 1:case 2:case 3:case 4:case 5:case 6:case 7:t+=String.fromCharCode(s);break;case 12:case 13:r=e[n++],t+=String.fromCharCode((31&s)<<6|63&r);break;case 14:r=e[n++],a=e[n++],t+=String.fromCharCode((15&s)<<12|(63&r)<<6|(63&a)<<0);break}return t}function T(e,...t){"function"===typeof e&&e(...t)}class A{get state(){return this._state}get stateName(){return Object.entries(A.State).find((([e,t])=>t===this._state))[0]}get connected(){return this.state===A.State.CONNECTED}set state(e){if("string"===typeof e){const t=Object.entries(A.State).some((([t,n])=>t===e.toUpperCase()&&(this._state=n,!0)));if(!t)return}else this._state=e;this.network.handle(this)}constructor(e,t=null){(0,S.Z)(this,"uuid",N()),(0,S.Z)(this,"network",void 0),(0,S.Z)(this,"peer",void 0),(0,S.Z)(this,"_state",void 0),(0,S.Z)(this,"signalData",void 0),(0,S.Z)(this,"partner",void 0),(0,S.Z)(this,"pingInterval",void 0),(0,S.Z)(this,"pingStart",null),(0,S.Z)(this,"pingms",void 0),this.network=e,this.state=A.State.INIT_PEER,this.partner=t,this.init(t)}get isHost(){return this.network?.host}init(e=null){const t=this.peer=new(I())({initiator:this.isHost,trickle:!1,channelName:this.uuid,config:{iceServers:[{urls:"stun:stun2.l.google.com:19302"},{urls:"stun:stun3.l.google.com:19302"}]}}),n=this.isHost;n||(this.state=A.State.WAIT_OFFER),t.on("signal",(t=>{if(null!=this.signalData)this.state=A.State.WAIT_CONNECT;else{const i=[this.uuid];n?null!==e&&i.push(this.partner):i.unshift(this.partner),this.signalData=new x(t,...i),this.state=this.isHost?null===e?A.State.WAIT_ANSWER:A.State.WAIT_REANSWER:A.State.WAIT_CONNECT}})),t.on("connect",(()=>{this.state=A.State.CONNECTED,this.setup()})),t.on("data",(e=>{ArrayBuffer.isView(e)&&(e=P(e)),"§"===e?this.peer.send("¨"):"¨"===e&&this.pingArrive()})),t.on("close",(()=>{this.state=this.state===A.State.CONNECTED?A.State.DISCONNECTED:A.State.CANCELLED,this.network=null}))}setup(){this.network?.pinging&&(this.ping(),this.pingInterval=setInterval((()=>this.ping()),this.network.ping_interval))}ping(){if(!this.pingStart){this.pingStart=Date.now();try{this.peer.send("§")}catch(e){}}}pingArrive(){this.pingms=Date.now()-this.pingStart,this.pingStart=0}signal(e){try{"string"===typeof e&&(e=(0,E.parse)(e)),this.partner=this.isHost?e.joiner:e.sender,this.peer.signal(e),this.isHost}catch(t){console.error(`Error when signaling peer [${this.uuid}]: `,t)}}send(e){const t=(0,E.stringify)(e);try{this.peer.send(t)}catch(n){console.log("Error when sending: ",e,n)}}write(e){const t=(0,E.stringify)(e);try{this.peer.write(t)}catch(n){console.log("Error when sending: ",e,n)}}equals(e){return e instanceof A&&e.uuid===this.uuid}destroy(){try{clearInterval(this.pingInterval),this.peer.destroy()}catch(e){console.error(`Error when destroying Peer ${this.uuid}`,e)}}}(0,S.Z)(A,"State",{INIT_PEER:Symbol(),WAIT_ANSWER:Symbol(),WAIT_OFFER:Symbol(),WAIT_CONNECT:Symbol(),WAIT_REANSWER:Symbol(),CONNECTED:Symbol(),CANCELLED:Symbol(),DISCONNECTED:Symbol()});var O=A;class W extends Array{get(e){if(e instanceof O)return e;const t="number"===typeof e?e:this.findIndex((t=>t.uuid===e));return-1==t?null:this[t]}has(e){return-1!==this.index(e)}index(e){return this.findIndex((t=>e instanceof O?t.equals(e):"string"===typeof e&&t.uuid===e))}size(){return this.length}add(e){return!this.has(e)&&e instanceof O&&(this.push(e),!0)}remove(e){const t=this.index(e);return-1==t?null:this.splice(t,1)[0]}isEmpty(){return 0===this.length}clean(){this.forEach((e=>e.destroy())),this.length=0}}class Z{constructor(){(0,S.Z)(this,"host",!1),(0,S.Z)(this,"transfer_enabled",!0),(0,S.Z)(this,"is_transferring",!1),(0,S.Z)(this,"transfer_timeout",2e3),(0,S.Z)(this,"save_history",!1),(0,S.Z)(this,"pinging",!0),(0,S.Z)(this,"ping_interval",1e3),(0,S.Z)(this,"RTC_Config",{iceServers:[{urls:"stun:stun2.l.google.com:19302"},{urls:"stun:stun3.l.google.com:19302"},{urls:"stun:stun4.l.google.com:19302"},{urls:"stun:global.stun.twilio.com:3478?transport=udp"}]})}}class j extends Z{constructor(e){super(),(0,S.Z)(this,"active",new W),(0,S.Z)(this,"initialized",new W),(0,S.Z)(this,"processing",new W),(0,S.Z)(this,"history",new W),(0,S.Z)(this,"_onOffer",void 0),(0,S.Z)(this,"_onAnswer",void 0),(0,S.Z)(this,"_onConfirm",void 0),(0,S.Z)(this,"_onConnect",void 0),(0,S.Z)(this,"_onReoffer",void 0),(0,S.Z)(this,"_onCancel",void 0),(0,S.Z)(this,"_onDisconnect",void 0),(0,S.Z)(this,"_events",void 0),Object.assign(this,e),this.restart(this.host)}restart(e=!1){this.host=e,this.active.clean(),this.initialized.clean(),this.processing.clean(),this.host&&this.offer()}offer(e=null){return this.host?new O(this,e):null}answer(e){if(this.host||!this.active.isEmpty())return null;if("string"===typeof e&&(e=(0,E.parse)(e)),this.processing.isEmpty()){const t=new O(this);return t.signal(e),t}return this.processing.clean(),this.answer(e)}confirm(e){"string"===typeof e&&(e=(0,E.parse)(e));const{sender:t}=e,n=this.initialized.get(t);return console.log(`Confirming offer from sender ${t}`),null===n?this.offer(!0):(n.signal(e),n)}signal(e){return this.host?this.confirm(e):this.answer(e)}on(e,t){switch(e){case"offer":case"answer":case"confirm":case"connect":case"reoffer":case"cancel":case"disconnect":this[`_on${e.charAt(0).toUpperCase()+e.slice(1)}`]=t;break;default:this._events.set(`_${e}`,t),this._event_names.push(e)}}get hasAvailableInitiators(){return!!this.host&&this.initialized.some((e=>e.state===O.State.WAIT_ANSWER))}get availableInitiator(){return this.initialized.find((e=>e.state===O.State.WAIT_ANSWER))}handle(e){const t=e.state,{INIT_PEER:n,WAIT_ANSWER:i,WAIT_CONNECT:s,WAIT_REANSWER:r,CONNECTED:a,CANCELLED:o,DISCONNECTED:l}=O.State,h={handler:null,args:[e.signalData,e]};switch(t){case n:return this.save_history&&this.history.add(e),void(this.host||this.initialized.add(e));case i:if(!this.host)return;this.initialized.add(e),h.handler=this._onOffer;break;case s:this.initialized.remove(e),this.processing.add(e),this.hasAvailableInitiators||this.offer(),h.handler=this.host?this._onConfirm:this._onAnswer;break;case a:this.initialized.remove(e),this.processing.remove(e),this.active.add(e),this.hasAvailableInitiators||this.offer(),h.handler=this._onConnect,h.args=[e];break;case r:if(!this.host)return;this.initialized.add(e),h.handler=this._onReoffer;break;case o:this.initialized.remove(e),this.processing.remove(e),this.hasAvailableInitiators||this.offer(),h.handler=this._onCancel;break;case l:this.active.remove(e),h.handler=this._onDisconnect;break;default:return}T(h.handler,...h.args,this)}data(e){const t=(0,E.parse)(e),n=t.shift();T(this._events.get(n),...t)}}var R=n(7139);const L=["onClick"],z={key:0},H={key:1,class:"loading"},$={class:"badge bg-light text-light-emphasis",style:{top:"0"}};function q(e,t,n,i,r,a){const o=(0,s.up)("PeerPing");return(0,s.wg)(!0),(0,s.iD)(s.HY,null,(0,s.Ko)(n.list,(e=>((0,s.wg)(),(0,s.iD)("div",{key:e.uuid,class:(0,R.C_)(`peer btn btn-${a.getStateTheme(e)} w-100 ${e.equals(n.highlight)?"active":""}`)},[(0,s._)("div",{class:"d-flex justify-content-between align-items-center",onClick:t=>a.showPeer(e)},[e.connected?((0,s.wg)(),(0,s.iD)("span",z,[(0,s.Wm)(o,{peer:e},null,8,["peer"])])):((0,s.wg)(),(0,s.iD)("span",H,(0,R.zw)(a.getStateDescription(e)),1)),(0,s._)("span",$,(0,R.zw)(e.uuid),1)],8,L)],2)))),128)}function M(e,t,n,i,r,a){return(0,s.wg)(),(0,s.iD)("span",null,(0,R.zw)(r.ping)+"ms ",1)}var F={name:"PeerPing",data(){return{ping:0,i:null}},props:{peer:{required:!0}},inject:["network"],mounted(){this.network?.pinging&&(this.i=setInterval((()=>{this.ping=this.peer.pingms}),this.network.ping_interval))},unmounted(){clearInterval(this.i)}},U=n(89);const V=(0,U.Z)(F,[["render",M]]);var B=V,G={name:"PeerList",components:{PeerPing:B},data(){return{active:null}},props:{list:{type:Array,required:!0},highlight:{required:!1}},methods:{getStateTheme(e){switch(e.stateName){case"WAIT_CONNECT":return"warning";case"WAIT_REANSWER":return"danger";case"CONNECTED":return"success";default:return"outline-secondary"}},getStateDescription(e){const t="Waiting for ";switch(e.stateName){case"WAIT_CONNECT":return t+"connection";case"WAIT_OFFER":return t+"an offer";case"WAIT_ANSWER":case"WAIT_REANSWER":return t+"an answer";case"CONNECTED":return"";default:return"something"}},showPeer(e){this.active=e,this.$emit("showPeer",e)}},emits:["showPeer"]};const J=(0,U.Z)(G,[["render",q],["__scopeId","data-v-76e21178"]]);var K=J;class Y{constructor(){this.e={}}has(e){return void 0!==this.e[e]}on(e,t){this.e[e]=this.e[e]||[],this.e[e].push(t)}off(e,t){if(!this.has(e))return;const n=this.e[e].findIndex((e=>e===t));-1!==n&&this.e[e].splice(n,1)}emit(e,...t){this.has(e)&&this.e[e].forEach((e=>e(...t)))}}const Q=e=>((0,s.dD)("data-v-88b560e0"),e=e(),(0,s.Cn)(),e),X={class:"p-3"},ee={key:0,class:"h4 d-flex justify-content-between"},te={class:"badge bg-secondary"},ne={key:0},ie={class:"badge bg-secondary"},se={key:1},re={class:"flex-fill"},ae=Q((()=>(0,s._)("h4",null,"Ping History",-1))),oe=Q((()=>(0,s._)("div",{class:"d-flex justify-content-end mt-2"},[(0,s._)("button",{class:"btn btn-danger px-3"},"Disconnect")],-1))),le={key:2},he=Q((()=>(0,s._)("small",null,"Signal Data",-1)));function ce(e,t,n,i,r,a){const o=(0,s.up)("Line"),l=(0,s.up)("CopyReadonly");return(0,s.wg)(),(0,s.iD)("div",X,[a.isPeerAvailable?((0,s.wg)(),(0,s.iD)("div",ee,[(0,s._)("span",null,(0,R.zw)(n.peer.isHost?"Initiator":"Joiner"),1),(0,s._)("span",null,[(0,s._)("span",te,(0,R.zw)(n.peer.uuid),1),n.peer.connected?((0,s.wg)(),(0,s.iD)("span",ne,[(0,s.Uk)(" 🔛 "),(0,s._)("span",ie,(0,R.zw)(n.peer.partner),1)])):(0,s.kq)("",!0)])])):(0,s.kq)("",!0),n.peer.connected?((0,s.wg)(),(0,s.iD)("div",se,[(0,s._)("div",re,[ae,(0,s.Wm)(o,{data:a.pingChartData,options:r.chartOptions},null,8,["data","options"])]),oe])):((0,s.wg)(),(0,s.iD)("div",le,[(0,s._)("div",null,[he,a.isPeerAvailable?((0,s.wg)(),(0,s.j4)(l,{key:0,text:n.peer.signalData},null,8,["text"])):(0,s.kq)("",!0)])]))])}const de={class:"input-group"},ue=["value"];function pe(e,t,n,i,r,a){return(0,s.wg)(),(0,s.iD)("div",de,[(0,s._)("input",{type:"text",value:n.text,readonly:"",class:"form-control form-control-sm",style:{cursor:"pointer"},onClick:t[0]||(t[0]=(...e)=>a.copy&&a.copy(...e))},null,8,ue),(0,s._)("button",{class:"input-group-text",ref:"button",onClick:t[1]||(t[1]=(...e)=>a.copy&&a.copy(...e))},"Copy",512)])}var ge={name:"CopyReadonly",props:{text:{required:!0}},computed:{btn(){return this.$refs.button}},methods:{copy(){""!==this.text&&null!==this.text&&void 0!==this.text&&(this.btn.innerText="✅ Copied",this.btn.classList.add("text-success"),navigator.clipboard.writeText(this.text))},reset(){this.btn.classList.remove("text-success"),this.btn.innerText="Copy"}},updated(){this.reset()}};const fe=(0,U.Z)(ge,[["render",pe]]);var ve=fe,me=n(4618),we=n(5866);me.kL.register(me.Dx,me.u,me.De,me.jn,me.uw,me.f$,me.od);var ye={name:"PeerView",data(){return{pingHistory:[{time:0,value:0}],chartOptions:{responsive:!0,plugins:{legend:{display:!1}},scales:{x:{ticks:{callback:(e,t,n)=>{const i=n.length,s=this.network.ping_interval,r=i-t-1,a=s*r;return a/1e3+"s ago"}}},y:{ticks:{callback:function(e){return e+" ms"},stepSize:1},scaleLabel:{display:!0,labelString:"1s = 1000ms"}}},animation:{duration:0},datasets:{line:{tension:.2}}},pingWatchInterval:0}},components:{CopyReadonly:ve,Line:we.x1},props:{peer:{required:!1}},computed:{isPeerAvailable(){return void 0!==this.peer||null!==this.peer},pingChartData(){return{labels:this.pingHistory.map((e=>e.time)),datasets:[{data:this.pingHistory.map((e=>e.value))}]}}},watch:{peer:{handler(){this.$forceUpdate(),this.$refs.signaller?.reset(),this.peer.connected||(this.pingHistory=[])},deep:!0}},mounted(){this.peer.connected&&(this.pingWatchInterval=setInterval((()=>{this.pingHistory.push({time:Date.now(),value:this.peer.pingms})}),this.network.ping_interval))},unmounted(){clearInterval(this.pingWatchInterval),this.pingHistory=[]},inject:["network"]};const be=(0,U.Z)(ye,[["render",ce],["__scopeId","data-v-88b560e0"]]);var _e=be;const Ce={for:"inp-answer",class:"form-label"},ke={class:"form-text",ref:"notification"};function Se(e,t,n,r,a,o){return(0,s.wg)(),(0,s.iD)("div",null,[(0,s._)("label",Ce,[(0,s._)("small",null,(0,R.zw)(n.initiator?"Confirm":"Answer")+" Here: ",1)]),(0,s.wy)((0,s._)("textarea",{id:"inp-answer",class:"form-control","onUpdate:modelValue":t[0]||(t[0]=e=>a.response=e),onClick:t[1]||(t[1]=e=>a.response="")},null,512),[[i.nr,a.response]]),(0,s._)("div",ke,null,512)])}var Ee={name:"PeerSignaller",data(){return{response:null}},props:{initiator:{type:Boolean,require:!1,default:!1}},computed:{notif(){return this.$refs.notification}},methods:{reset(){this.notif.innerHTML=""}},watch:{response(e){if(""===e)return;const t=x.validate(e),n=["answer","offer"],[i,s]=this.initiator?n.reverse():n;if(t.value&&t.type===s){this.notif.innerHTML="";const e=this.network.signal(t.parsed);this.initiator||this.$emit("showPeer",e)}else t.value?(this.notif.innerHTML=`The text that was pasted is a valid <strong>${i} signal</strong> but not the required <strong> ${s} signal </strong>`,this.response=""):(this.notif.innerHTML=`Please paste a valid <strong> ${s} signal </strong>.`,this.response="")}},inject:["network"],emits:["showPeer"]};const xe=(0,U.Z)(Ee,[["render",Se]]);var De=xe;const Ie={class:"d-flex flex-column gap-2"},Ne=(0,s._)("div",{class:"flex-fill"},null,-1),Pe=(0,s._)("div",{class:"form-control"},null,-1),Te=[Ne,Pe];function Ae(e,t,n,i,r,a){return(0,s.wg)(),(0,s.iD)("div",Ie,Te)}var Oe={name:"ChatModal",data(){return{data:[{message:"hey yo",sender:"test"},{message:"yo whats up",sender:"own"},{message:"nah just checkin",sender:"test"}],pending:[],input:""}},props:{initialData:{type:Array,default:()=>[]},ownId:{type:String,require:!0},verifySend:{type:Boolean,default:!1}},methods:{addChat(e,t,n=null){this.data.push({sender:t,message:e,messageID:n})},sendChat(){const e=this.generateID();this.addChat(this.input,this.ownId,e),this.verifySend&&this.pending.push(e)},isPending(e){return this.pending.some((t=>e.messageID===t))},generateID(){return Math.random().toString(36).slice(2,10)},verify(e){const t=this.pending.findIndex((t=>e===t));-1!==t&&this.pending.splice(t,1)}}};const We=(0,U.Z)(Oe,[["render",Ae]]);var Ze=We;const je={key:0};function Re(e,t,n,i,r,a){return(0,s.wg)(),(0,s.j4)(s.lR,{to:"#modal-cont"},[n.open?((0,s.wg)(),(0,s.iD)("div",je,[(0,s._)("div",{id:"modal-backdrop",onClick:t[0]||(t[0]=e=>this.$emit("backdrop"))}),((0,s.wg)(),(0,s.j4)((0,s.LL)(n.modal),(0,R.vs)((0,s.F4)(e.$attrs)),null,16))])):(0,s.kq)("",!0)])}var Le={name:"ModalManager",props:{open:{type:Boolean,default:!1},modal:{require:!1}},emits:["backdrop"],inheritAttrs:!1};const ze=(0,U.Z)(Le,[["render",Re]]);var He=ze;const $e=new Y,qe=new j;window.network=qe,window.Peer=O;var Me={name:"App",components:{PeerList:K,PeerView:_e,CopyReadonly:ve,PeerSignaller:De,ModalManager:He},data(){return{network:qe,activePeer:null,modalOpen:!1,modal:Ze}},created(){qe.on("connect",(()=>{this.activePeer=null,this.$forceUpdate()}))},computed:{host:{get(){return this.network.host},set(e,t){this.network.restart(e),e!==t&&(this.activePeer=null)}},pending(){return[...this.network.initialized,...this.network.processing]},active(){return this.network.active}},methods:{createOffer(){this.network.offer()},showPeerOptions(e){this.activePeer=e}},watch:{activePeer:{handler(e){null!==e&&void 0!==e&&(e.state!==O.State.CANCELLED&&e.state!==O.State.DISCONNECTED||(this.activePeer=null))},deep:!0}},provide(){return{network:this.network,bus:(0,s.Fl)((()=>$e))}}};const Fe=(0,U.Z)(Me,[["render",k],["__scopeId","data-v-742a4501"]]);var Ue=Fe;n(2166);(0,i.ri)(Ue).mount("#app")}},t={};function n(i){var s=t[i];if(void 0!==s)return s.exports;var r=t[i]={exports:{}};return e[i].call(r.exports,r,r.exports,n),r.exports}n.m=e,function(){var e=[];n.O=function(t,i,s,r){if(!i){var a=1/0;for(c=0;c<e.length;c++){i=e[c][0],s=e[c][1],r=e[c][2];for(var o=!0,l=0;l<i.length;l++)(!1&r||a>=r)&&Object.keys(n.O).every((function(e){return n.O[e](i[l])}))?i.splice(l--,1):(o=!1,r<a&&(a=r));if(o){e.splice(c--,1);var h=s();void 0!==h&&(t=h)}}return t}r=r||0;for(var c=e.length;c>0&&e[c-1][2]>r;c--)e[c]=e[c-1];e[c]=[i,s,r]}}(),function(){n.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return n.d(t,{a:t}),t}}(),function(){n.d=function(e,t){for(var i in t)n.o(t,i)&&!n.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:t[i]})}}(),function(){n.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()}(),function(){n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)}}(),function(){n.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}}(),function(){var e={143:0};n.O.j=function(t){return 0===e[t]};var t=function(t,i){var s,r,a=i[0],o=i[1],l=i[2],h=0;if(a.some((function(t){return 0!==e[t]}))){for(s in o)n.o(o,s)&&(n.m[s]=o[s]);if(l)var c=l(n)}for(t&&t(i);h<a.length;h++)r=a[h],n.o(e,r)&&e[r]&&e[r][0](),e[r]=0;return n.O(c)},i=self["webpackChunkpeer_network_prototype"]=self["webpackChunkpeer_network_prototype"]||[];i.forEach(t.bind(null,0)),i.push=t.bind(null,i.push.bind(i))}();var i=n.O(void 0,[998],(function(){return n(6136)}));i=n.O(i)})();
//# sourceMappingURL=app.c5d54067.js.map