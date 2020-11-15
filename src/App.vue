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
      ...mapGetters(['loggedIn'])
    }
  },
  methods: {
    ...mapActions([])
  },
  name: 'App',
  mounted() {
    console.log("Loaded app user is ", this.loggedIn());
    if (!this.loggedIn()) {
      this.$router.push("/login")
    }

  }
}
</script>
