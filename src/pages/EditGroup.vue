<template>
  <q-page-container>
    <q-page>
      <div class="row q-gutter-sm q-pa-md" v-if="group">
        <div class="col-12">
          <span class="text-h5">{{ group.name }}</span>
        </div>
        <div class="col-12">
          Users in the group: {{ usersInTheGroup.length }}
        </div>
        <div class="col-6 col-xl-4 col-lg-4 col-xs-12 col-sm-12 col-md-6">
          <q-markup-table flat>
            <tbody>
            <tr v-for="user in usersInTheGroup">
              <td><span class="text-bold">{{ user.email }}</span></td>
              <td class="text-right">
                <q-btn size="xs" icon="fas fa-trash" @click="removeUserFromGroup(user)" flat></q-btn>
              </td>
            </tr>
            </tbody>
          </q-markup-table>
        </div>

      </div>
      <div class="row q-gutter-sm q-pa-md">
        <div class="col-6 col-xl-4 col-lg-4 col-xs-12 col-sm-12 col-md-6">
          <q-btn @click="deleteGroup()" label="Delete group" color="negative"></q-btn>
          <q-btn class="float-right" @click="showAddUserToGroup  = true" label="Add user to group"></q-btn>
        </div>
      </div>


      <q-dialog v-model="showAddUserToGroup" persistent>
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Add user</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-select :options="allUsers" v-model="newSelectedUser" option-label="email" option-value="reference_id"
                      autofocus/>
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn @click="showAddUserToGroup = false" flat label="Cancel" v-close-popup/>
            <q-btn @click="addUserToGroup()" flat label="Add user" v-close-popup/>
          </q-card-actions>
        </q-card>
      </q-dialog>


    </q-page>
  </q-page-container>
</template>
<script>
  import {mapActions} from "vuex";

  export default {
    name: "EditGroup",
    data: function () {
      return {
        group: null,
        showAddUserToGroup: false,
        newSelectedUser: null,
        allUsers: [],
        usersInTheGroup: [],
      }
    },
    mounted() {

      const that = this;
      that.loadData({
        tableName: "usergroup",
        params: {
          query: JSON.stringify([
            {
              column: 'reference_id',
              operator: 'is',
              value: this.$route.params.groupId
            }
          ])
        }
      }).then(function (res) {
        console.log("Loaded group", res);
        if (!res.data || res.data.length === 0) {
          that.$q.notify({
            message: "Group not found"
          });
          that.$router.back();
          return
        }
        that.group = res.data[0];

        that.loadData({
          tableName: "user_account",
          params: {
            page: {
              size: 500
            }
          }
        }).then(function (res) {
          that.allUsers = res.data;
        }).catch(function (res) {
          that.$q.notify({
            message: "Failed to get uses"
          })
        })

        that.loadGroupUsers()
      })


    },
    methods: {
      removeUserFromGroup(user) {
        console.log("remove user from group", user);
        const that = this;
        that.removeRelation({
          tableName: "usergroup",
          id: that.group.reference_id,
          relationName: "user_account_id",
          relationId: user.relation_reference_id
        }).then(function (usersOfGroup) {
          console.log("Removed user ", usersOfGroup);
          that.loadGroupUsers();
        }).catch(function (err) {
          that.$q.notify({
            message: "Failed to remove user from group"
          })
        })
      },
      loadGroupUsers() {
        const that = this;
        that.loadDataRelations({
          tableName: 'usergroup',
          relation: 'user_account_id',
          reference_id: that.group.reference_id
        }).then(function (usersOfGroup) {
          console.log("Users in this group", usersOfGroup);
          that.usersInTheGroup = usersOfGroup.data;
        })
      },
      addUserToGroup() {
        const that = this;
        console.log("add user to group", this.newSelectedUser);
        that.addManyRelation({
          tableName: "usergroup",
          id: that.group.id,
          relationName: "user_account_id",
          relationId: this.newSelectedUser.reference_id
        }).then(function (res) {
          console.log("Added user group", res);
          that.$q.notify({
            message: "Added user to group"
          });
          that.showAddUserToGroup = false;
          that.loadGroupUsers()
        }).catch(function (error) {
          that.$q.notify({
            message: JSON.stringify(error)
          })
        })
      },
      deleteGroup() {
        const that = this;
        that.deleteRow({
          tableName: "usergroup",
          reference_id: that.group.id
        }).then(function (res) {
          console.log("Deleted group", res);
          that.$q.notify({
            message: "Deleted group"
          });
          that.$router.back();
        }).catch(function (error) {
          that.$q.notify({
            message: JSON.stringify(error)
          })
        })
      },
      ...mapActions(['loadData', 'deleteRow', 'loadDataRelations', 'addManyRelation', 'removeRelation'])
    }
  }
</script>
