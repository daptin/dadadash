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
            <q-btn icon="add" flat @click="newUserDrawer = true"/>
            <q-btn icon="delete" disable flat @click="$router.push('/tables/create')"/>
          </q-btn-group>
        </div>
      </div>

      <div class="row">
        <div class="col-12">
          <q-markup-table flat>
            <thead>
            <tr style="text-align: left">
              <th>Users</th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="user in usersFiltered" style="cursor: pointer" @click="$router.push('/user/' + user.email)">
              <td>{{ user.email }}</td>
              <td>{{ user.name }}</td>
              <td>{{ user.created_at.split('.')[0].split('T')[0] }}</td>
              <td class="text-right">
                <q-btn color="black" flat icon="fas fa-wrench"></q-btn>
              </td>
            </tr>
            </tbody>
          </q-markup-table>
        </div>
      </div>


    </q-page>

    <q-drawer v-model="newUserDrawer" :width="500" content-class="bg-grey-3" overlay side="right">
      <q-scroll-area class="fit row">
        <div class="q-pa-md">
          <span class="text-h6">Create user</span>
          <q-form class="q-gutter-md">
            <q-input v-model="user.name" label="Name"></q-input>
            <q-input v-model="user.email" label="Email"></q-input>
            <q-input v-model="user.password" label="Password" type="password"></q-input>
            <q-btn color="primary" @click="createUser()">Create</q-btn>
            <q-btn @click="newUserDrawer = false">Cancel</q-btn>
          </q-form>
        </div>
      </q-scroll-area>
    </q-drawer>

    <q-drawer v-model="showHelp" :width="400" overlay side="right">
      <q-scroll-area class="fit">
        <help-page @closeHelp="showHelp = false">
          <template v-slot:help-content>
            <q-markdown src="::: tip
You can add users to your instance here. You can also send the sign up link where users can signup themselves.
:::"></q-markdown>
          </template>
        </help-page>
      </q-scroll-area>
    </q-drawer>

  </q-page-container>
</template>

<script>
import {mapActions, mapGetters, mapState} from 'vuex';

export default {
  name: 'UsersPage',

  methods: {
    createUser() {
      const that = this;
      console.log("new user", this.user);
      this.user.tableName = "user_account";
      that.createRow(that.user).then(function (res) {
        that.user = {};
        that.$q.notify({
          message: "User created"
        });
        that.refresh();
        that.newUserDrawer = false;
      }).catch(function (e) {
        if (e instanceof Array) {
          that.$q.notify({
            message: e[0].title
          })
        } else {
          that.$q.notify({
            message: "Failed to create user"
          })
        }
      });
    },
    ...mapActions(['loadData', 'getTableSchema', 'createRow']),
    refresh() {
      const that = this;
      var tableName = "user_account";
      this.loadData({
        tableName: tableName, params: {
          page: {
            size: 500,
          }
        }
      }).then(function (data) {
        console.log("Loaded data", data);
        that.users = data.data;
      })
    },
  },
  data() {
    return {
      text: '',
      nameFilter: null,
      user: {},
      showHelp: false,
      newUserDrawer: false,
      users: [],
      filter: null,
      columns: [
        {
          name: 'email',
          field: 'email',
          label: 'Email',
          align: 'left',
          sortable: true,
        }, {
          name: 'name',
          field: 'name',
          label: 'Name',
          align: 'left',
        },
        {
          name: '',
          format: function () {
            return "<span>hi</span>"
          }
        }
      ],
      ...mapState([])
    }
  },
  mounted() {
    this.refresh();
  },
  computed: {
    usersFiltered() {
      const that = this;
      return this.nameFilter == null ? this.users : this.users.filter(function (e) {
        return e.email.indexOf(that.userFilter) > -1 || e.name.indexOf(that.userFilter) > -1
      })
    },
    ...mapGetters(['selectedTable']),
    ...mapState([])
  },

  watch: {}
}
</script>
