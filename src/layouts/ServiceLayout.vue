<template>
  <q-layout>
    <router-view/>
  </q-layout>
</template>

<script>
import {mapGetters, mapActions} from 'vuex';

var jwt = require('jsonwebtoken');

export default {
  name: 'S',
  data() {
    return {
      ...mapGetters(['loggedIn', 'drawerLeft', 'authToken', 'decodedAuthToken']),
    }
  },
  mounted() {
  },
  methods: {
    ...mapActions(['getDefaultCloudStore', 'loadModel', 'executeAction', 'loadData', 'setDecodedAuthToken']),
    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      this.$router.push("/login");
      window.location = window.location;
    }
  }
}
</script>
