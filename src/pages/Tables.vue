<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <table-side-bar></table-side-bar>
</template>

<script>
import {mapActions, mapGetters, mapState} from 'vuex';

export default {
  name: 'TablePage',
  methods: {
    searchDocuments() {
      console.log("search tables", arguments);
    },
    ...mapActions(['loadTables'])
  },
  data() {
    return {
      text: '',
      showHelp: false,
      ...mapState([])
    }
  },
  mounted() {
    const that = this;
    this.$q.loadingBar.start();
    that.loadTables().then(function () {
      that.$q.loadingBar.stop()
    });

  },
  computed: {
    ...mapGetters([]),
    ...mapState([])
  },

  watch: {}
}
</script>
