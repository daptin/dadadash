<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <q-page-container>

    <q-page>
      <q-card flat style="width: 100%">
        <q-card-section>
          <div class="row" v-if="user">
            <div class="col-1 col-xl-2 col-lg-2 col-xs-6 col-sm-4 q-pa-md">
              <q-img :src="decodedAuthToken.picture"></q-img>
            </div>
            <div class="col-6 col-xs-6 col-sm-6 q-pa-md">
              <span class="text-h6">{{ user.name }}</span> <br/>
              <span class="text-bold">{{ user.email }}</span>
            </div>
            <div class="col-5">
              <q-btn color="warning" class="float-right text-black" label="Reset password"></q-btn>

            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-page>


  </q-page-container>
</template>

<script>
import {mapActions, mapGetters, mapState} from 'vuex';

export default {
  name: 'UserProfile',
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
    ...mapActions(['loadData', 'getTableSchema', 'createRow', 'loadOneData']),
    refresh() {
      const that = this;
      var tableName = "user_account";
      this.loadOneData({
        tableName: tableName,
        referenceId: 'mine'
      }).then(function (data) {
        console.log("Loaded data", data);
        that.user = data.data;
      });
      console.log("Token", that.authToken)
    },
  },
  data() {
    return {
      text: '',
      user: null,
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
      ],
      ...mapState([])
    }
  },
  mounted() {
    this.refresh();
  },
  computed: {
    ...mapGetters(['selectedTable', 'authToken', 'decodedAuthToken']),
    ...mapState([])
  },

  watch: {}
}
</script>
