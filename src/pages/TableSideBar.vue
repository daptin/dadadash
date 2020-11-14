<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <q-page-container>
    <q-page>


      <user-header-bar @new-table="$router.push('/tables/create')" :buttons="{
        after: [{
          icon: 'fas fa-plus', event: 'new-table'
        }]
      }">

      </user-header-bar>
      <q-card>
        <q-card-section>
          <q-markup-table flat>
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
