<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <q-page-container>
    <q-page>

      <div class="row ">
        <div class="col-12 q-pa-xs">
          <q-btn color="primary" label="New table" icon="fas fa-plus" @click="$router.push('/tables/create')"></q-btn>
        </div>
        <div class="col-12">
          <q-card flat>
            <q-card-section>
              <q-markup-table flat>
                <thead>
                <tr style="text-align: left">
                  <th>Table</th>
                  <th>Edit Schema</th>
                  <th>Data</th>
                </tr>
                </thead>
                <tbody>
                <tr style="cursor: pointer" @click="$router.push('/tables/data/' + table.table_name)"
                    v-for="table in tablesFiltered">
                  <td>{{ table.table_name }}</td>
                  <td style="text-align: left">
                    <q-btn @click.stop="$router.push('/tables/edit/' + table.table_name)" flat icon="fas fa-wrench"></q-btn>
                  </td>
                  <td style="text-align: left">
                    <q-btn @click.stop="$router.push('/tables/data/' + table.table_name)" flat icon="fas fa-list"></q-btn>
                  </td>
                </tr>
                </tbody>
              </q-markup-table>
            </q-card-section>
          </q-card>
        </div>
      </div>



      <!--    <q-page-sticky v-if="!showHelp" position="top-right" :offset="[0, 0]">-->
      <!--      <q-btn flat @click="showHelp = true" fab icon="fas fa-question"/>-->
      <!--    </q-page-sticky>-->

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
  name: 'TableSideBar',
  methods: {
    setTable(tableName) {
      console.log("set table", tableName);
      this.setSelectedTable(tableName)
    },
    ...mapActions(['setSelectedTable'])
  },
  data() {
    return {
      text: '',
      showHelp: false,
      selectedTable: null
    }
  },
  mounted() {
  },
  computed: {
    tableOptions() {
      console.log(this.tablesFiltered);
      return this.tablesFiltered.map(function (e) {
        return {
          label: e.table_name,
          value: e.table_name
        }
      })
    },
    tablesFiltered() {
      const that = this;
      console.log("Get tables filtered", that.tables);
      if (that.text && that.text.length > 0) {
        return that.tables.filter(function (e) {
          return e.table_name.indexOf(that.text) > -1 && !e.is_hidden;
        })
      } else {
        return that.tables.filter(function (e) {
          return !e.is_hidden;
        });
      }
    },
    ...mapGetters(['tables'])
  },
  watch: {
    tables() {
      console.log("updated tables  in watch ", this.tables, this.tablesFiltered)
    }
  }
}
</script>
