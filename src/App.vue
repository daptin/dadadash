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

    const that = this;
    that.initDaptinClient().then(function () {

      let appConnectionStatus = that.appConnectionStatus();
      console.log("Loaded app user is ", that.loggedIn(), appConnectionStatus);

      if (!appConnectionStatus) {
        that.$router.push('/backend')
        return
      }

      if (!that.loggedIn()) {
        that.$router.push("/login")
      }
    }).catch(function (err) {
      console.log("Daptin client initialization failed, we are offline", err)
      that.$router.push('/backend')
    })


  }
}
</script>
