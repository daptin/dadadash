<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <q-page-container>

    <user-header-bar style="border-bottom: 1px solid black" @search="searchDocuments"
                     :buttons="{
        before: [
            {icon: 'fas fa-search', event: 'search'},
          ],
        after: [
            {icon: 'fas fa-sync-alt', event: 'search'},
            {icon: 'fas fa-question' , click: () => {showHelp = !showHelp}},
          ],
        }" title="Files"></user-header-bar>


    <q-page>
      <table-side-bar></table-side-bar>

      <q-drawer overlay :width="400" side="right" v-model="showHelp">
        <q-scroll-area class="fit">
          <help-page @closeHelp="showHelp = false">
            <template v-slot:help-content>
              <q-markdown src="::: tip
Daptin creates **user_account** table automatically. You can create new tables and edit existing tables, or view table data.
:::"></q-markdown>
            </template>
          </help-page>
        </q-scroll-area>
      </q-drawer>

    </q-page>
  </q-page-container>
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
