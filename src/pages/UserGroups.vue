<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <q-page-container>
    <q-page>

      <div class="row q-gutter-sm q-pa-md">
        <div class="col-4">
          <q-input v-model="filter"  label="search">
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <div class="col-2">
          <q-btn fab icon="add" label="New Group" @click="newGroupDrawer = true"/>
        </div>
      </div>
      <div class="row q-gutter-sm q-pa-md">
        <div class="col-12">
          <q-markup-table>
            <thead>
            <tr>
              <td>Name</td>
              <td>Reference Id</td>
              <td>Created on</td>
            </tr>
            </thead>
            <tbody>
            <tr v-for="group in groups"
                v-if="!filter || filter === '' || group.name.indexOf(filter) > -1"
                style="cursor: pointer" @click="$router.push('/groups/' + group.reference_id)">
              <td>{{ group.name }}</td>
              <td>{{ group.reference_id }}</td>
              <td>{{ group.created_at.split("T")[0] }}</td>
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
      console.log("Filter groups", this.filter)
      this.loadData({
        tableName: tableName,
        params: {
          page: {
            size: 2000
          },
          filter: this.filter,
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
      filter: null,
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
    filter: function () {
      this.refresh()
    }
  }
}
</script>
