<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <q-page-container>
    <q-page>


      <div class="row">
        <div class="col-4">
          <q-input dense v-model="nameFilter" icon="search" label="search">
            <template v-slot:prepend>
              <q-icon name="search"/>
            </template>
          </q-input>
        </div>
      </div>
      <div class="row" style="border-top: 1px solid black; border-bottom: 1px solid black">
        <div class="col-1">
          <q-btn-group flat size="sm">
            <q-btn icon="add" flat @click="newGroupDrawer = true"/>
            <q-btn icon="delete" disable flat @click="$router.push('/tables/create')"/>
          </q-btn-group>
        </div>
      </div>


      <div class="row">
        <div class="col-12">
          <q-markup-table flat>
            <thead>
            <tr class="text-left">
              <th>User groups</th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="group in groups"
                v-if="!nameFilter || nameFilter === '' || group.name.indexOf(nameFilter) > -1"
                style="cursor: pointer" @click="$router.push('/groups/' + group.reference_id)">
              <td>{{ group.name }}</td>
              <td>{{ group.reference_id }}</td>
              <td>{{ group.created_at.split("T")[0] }}</td>
              <td class="text-right">
                <q-btn color="black" flat icon="fas fa-wrench"></q-btn>
              </td>
            </tr>
            </tbody>
          </q-markup-table>

        </div>
      </div>

      <q-drawer v-model="newGroupDrawer" :width="500" content-class="bg-grey-3" overlay side="right">
        <q-scroll-area class="fit row">
          <div class="q-pa-md">
            <span class="text-h6">Create group</span>
            <q-form class="q-gutter-md">
              <q-input v-model="group.name" label="Name"></q-input>
              <q-btn color="primary" @click="createGroup()">Create</q-btn>
              <q-btn @click="newGroupDrawer = false">Cancel</q-btn>
            </q-form>
          </div>
        </q-scroll-area>
      </q-drawer>

    </q-page>


  </q-page-container>
</template>

<script>
import {mapActions, mapGetters, mapState} from 'vuex';

export default {
  name: 'UserGroupsPage',
  methods: {
    editGroup(evt, group) {
      console.log("Edit group", group)
    },
    createGroup() {
      const that = this;
      console.log("new group", this.group);
      this.group.tableName = "usergroup";
      that.createRow(that.group).then(function (res) {
        that.user = {};
        that.$q.notify({
          message: "Group created"
        });
        that.refresh();
        that.newGroupDrawer = false;
      }).catch(function (e) {
        if (e instanceof Array) {
          that.$q.notify({
            message: e[0].title
          })
        } else {
          that.$q.notify({
            message: "Failed to create group"
          })
        }
      });
    },
    ...mapActions(['loadData', 'getTableSchema', 'createRow']),
    refresh() {
      var tableName = "usergroup";
      const that = this;
      console.log("Filter groups", this.nameFilter)
      this.loadData({
        tableName: tableName,
        params: {
          page: {
            size: 2000
          },
          filter: this.nameFilter,
          sort: "name"
        }
      }).then(function (data) {
        console.log("Loaded data", data);
        that.groups = data.data;
      })
    }
  },
  data() {
    return {
      text: '',
      showHelp: false,
      group: {},
      nameFilter: null,
      newGroupDrawer: false,
      groups: [],
      columns: [
        {
          name: 'name',
          field: 'name',
          label: 'Group name',
          align: 'left',
          sortable: true,
        }
      ],
      ...mapState([])
    }
  },
  mounted() {
    this.refresh();
  },
  computed: {
    ...mapGetters(['selectedTable']),
    ...mapState([])
  },

  watch: {
    nameFilter: function () {
      this.refresh()
    }
  }
}
</script>
