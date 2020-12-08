<template>
  <div id="q-app" style="overflow: hidden">
    <router-view/>

  </div>
</template>
<style>
.container-main {
  -ms-overflow-style: none;
  overflow-y: scroll;
  scrollbar-width: none;
}

.container-main::-webkit-scrollbar {
  display: none;
}


</style>
<script>

import {mapGetters, mapActions} from 'vuex';
import "fontsource-source-sans-pro"

export default {
  data() {
    return {
      showLogin: false,
      ...mapGetters(['loggedIn', 'appConnectionStatus'])
    }
  },
  methods: {
    ...mapActions(['initDaptinClient'])
  },
  name: 'App',
  watch: {
    'appConnectionStatus': function () {
      console.log("App connection status changed", arguments)
    }
  },
  mounted() {

    this.initDaptinClient().then(function (){

      let appConnectionStatus = this.appConnectionStatus();
      console.log("Loaded app user is ", this.loggedIn(), appConnectionStatus);

      if (!appConnectionStatus) {
        this.$router.push('/backend')
        return
      }

      if (!this.loggedIn()) {
        this.$router.push("/login")
      }
    })


  }
}
</script>
