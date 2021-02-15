<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <q-page-container>

    <q-page>
      <div class="row q-pa-md q-gutter-sm">

        <div class="col-6">
          <q-input clear-icon="fas fa-times" label="Search" v-model="actionFilter"></q-input>
        </div>
        <div class="col-4">
          <q-btn @click="showCreateAction()" fab icon="add" color="primary"/>
        </div>


      </div>

    </q-page>


  </q-page-container>
</template>

<script>
import {mapActions, mapGetters, mapState} from 'vuex';

const yaml = require('js-yaml');

export default {
  name: 'ActionPage',
  methods: {
    ...mapActions(['loadData', 'getTableSchema', 'createRow', 'deleteRow', 'updateRow', 'executeAction']),
    refresh() {
      const tableName = "action";
      const that = this;
      this.loadData({
        tableName: tableName,
        params: {
          page: {
            size: 1
          }
        }
      }).then(function (data) {
        console.log("Loaded data", data);
        let actions = data.data.map(function (e) {
          try {
            e.action_schema = JSON.parse(e.action_schema)
          } catch (e) {
            e.action_schema = {
              InFields: [],
              OutFields: [],
              Name: e.action_name,
              Label: e.action_name,
            }
          }
          return e;
        });
        actions.sort(function (a, b) {
          return a.action_name < b.action_name;
        })
        that.actions = actions;
      })
      this.loadData({
        tableName: "world",
        params: {
          page: {
            size: 500
          }
        }
      }).then(function (data) {
        // console.log("Loaded tables data", data);
        let tables = data.data.filter(function (e) {
          return e.table_name.indexOf("_has_") === -1;
        });
        tables = tables.sort(function (a, b) {
          return a.table_name > b.table_name;
        });
        that.tables = tables;
      })
    }
  },
  data() {
    return {
      action: null,
      ...mapState([])
    }
  },
  mounted() {
    this.refresh();
  },
  computed: {
    ...mapGetters([]),
    ...mapState([])
  },

  watch: {}
}
</script>
