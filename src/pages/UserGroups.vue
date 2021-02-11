<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <q-page-container>
    <q-page>

    <div class="row q-gutter-sm">
      <div class="col-8 q-pa-md">
        <q-btn @click="newGroupDrawer = true" label="Add Group" fab icon="add" color="primary"/>
      </div>
      <div class="col-12 q-pa-md">
        <q-markup-table>
          <tbody>
          <tr style="cursor: pointer" @click="$router.push('/groups/' + group.reference_id)" v-for="group in groups">
            <td>{{group.name}}</td>
          </tr>
          </tbody>
        </q-markup-table>

      </div>
    </div>

    <q-drawer overlay :width="500" content-class="bg-grey-3" side="right" v-model="newGroupDrawer">
      <q-scroll-area class="fit row">
        <div class="q-pa-md">
          <span class="text-h6">Create group</span>
          <q-form class="q-gutter-md">
            <q-input label="Name" v-model="group.name"></q-input>
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
        this.loadData({
          tableName: tableName,
          params: {
            page: {
              size: 500
            }
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

    watch: {}
  }
</script>
