<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <q-page-container>
    <q-page>

      <div class="row q-gutter-sm q-pa-md">
        <div class="col-4">
          <q-input dense v-model="tableNameFilter" icon="search" label="search">
            <template v-slot:prepend>
              <q-icon name="search"/>
            </template>
          </q-input>
        </div>
      </div>
      <div class="row" style="border-top: 1px solid black; border-bottom: 1px solid black">
        <div class="col-1">
          <q-btn-group flat size="sm">
            <q-btn icon="add" flat @click="$router.push('/tables/create')"/>
            <q-btn icon="delete" disable flat @click="$router.push('/tables/create')"/>
          </q-btn-group>
        </div>
      </div>

      <div class="row">
        <div class="col-12">
          <q-markup-table flat style="text-align: left">
            <thead>
            <tr>
              <th style="width: 300px">Tables</th>
              <th></th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="table in tablesFiltered.filter((e) => {
                      if (!tableNameFilter) {
                        return true
                      } else{
                        return e.table_name.indexOf(tableNameFilter) > -1;
                      }
                    })" style="cursor: pointer"
                @click="$router.push('/tables/data/' + table.table_name)">
              <td style="width: 300px">{{ table.table_name }}</td>
              <td style="text-align: left" class="q-gutter-xs q-pa-xs">
                <q-btn-group size="sm">
                  <q-btn icon="edit" @click.stop="$router.push('/tables/edit/' + table.table_name)"></q-btn>
                  <q-btn icon="search" @click.stop="$router.push('/tables/data/' + table.table_name)"></q-btn>
                </q-btn-group>

              </td>
            </tr>
            </tbody>
          </q-markup-table>
        </div>
      </div>


      <!--    <q-page-sticky v-if="!showHelp" position="top-right" :offset="[0, 0]">-->
      <!--      <q-btn flat @click="showHelp = true" fab icon="fas fa-question"/>-->
      <!--    </q-page-sticky>-->

      <q-drawer v-model="showHelp" :width="400" overlay side="right">
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
import {mapActions, mapGetters} from 'vuex';

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
      tableNameFilter: null,
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
