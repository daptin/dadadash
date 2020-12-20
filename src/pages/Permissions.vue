<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">

  <div>
    <div class="col-12 q-pa-md">
      <span class="text-h5">Table permissions</span>
    </div>

    <div class="col-12">
      <div>


        <div class="row">

          <div class="col-12 q-pa-md q-gutter-md">

            <q-card flat class="bg-grey-3">

              <q-card-section>
                <q-select
                  @popup-hide="saveTablePermissionModel()"
                  option-value="value"
                  multiple
                  map-options emit-value
                  option-label="label"
                  use-input
                  input-debounce="0"
                  v-model="selectedPermissionOption"
                  :options="simplePermissionOptions"></q-select>

              </q-card-section>
            </q-card>


          </div>

          <div class="col-12 q-pa-md items-start q-gutter-md">
            <q-card>
              <q-card-section>
                <div class="text-h6">Table owner</div>
              </q-card-section>

              <q-card-section class="q-pt-none">
                {{ selectedTable.user_account_id ? selectedTable.user_account_id.email : 'n/a' }}
              </q-card-section>


              <q-card-actions>
                <q-btn @click="showOwnerSelectionBox()" flat>Change owner</q-btn>
              </q-card-actions>
            </q-card>

            <q-card>
              <q-card-section>
                <div class="text-h6">Table groups</div>
              </q-card-section>
              <q-card-section class="q-pt-none">
                <q-markup-table flat>
                  <tbody>
                  <tr v-for="group in tableGroups">
                    <td>{{ group.name }}</td>
                    <td class="text-right">
                      <q-btn icon="fas fa-trash" flat size="xs" @click="removeTableFromGroup(group)"></q-btn>
                    </td>
                  </tr>
                  </tbody>
                </q-markup-table>
              </q-card-section>
              <q-card-actions>
                <div class="row">
                  <q-btn class="float-right" flat label="Add group" @click="groupChangeForTableGroups()"></q-btn>
                </div>
              </q-card-actions>
            </q-card>

            <q-card>
              <q-card-section>
                <div class="text-h6">New row to be added to following groups</div>
              </q-card-section>
              <q-card-section class="q-pt-none">
                <q-markup-table flat>
                  <tbody>
                  <tr v-for="group in tableSchema.DefaultGroups">
                    <td>{{ group }}</td>
                    <td class="text-right">
                      <q-btn icon="fas fa-trash" flat size="xs" @click="removeGroupFromDefaultGroups(group)"></q-btn>
                    </td>
                  </tr>
                  </tbody>
                </q-markup-table>

              </q-card-section>
              <q-card-actions>
                <q-btn flat label="Add group" @click="groupChangeForNewRowGroups()"></q-btn>
              </q-card-actions>
            </q-card>

          </div>

        </div>

        <q-dialog v-model="addToGroup">
          <q-card>
            <q-card-section>
              <div class="text-h6">Add table to new group</div>
            </q-card-section>


            <q-card-section class="q-pt-none">
              <q-select flat :options="userGroups" option-label="name" option-value="reference_id"
                        v-model="addToGroupId"></q-select>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="Cancel" color="warning" v-close-popup/>
              <q-btn @click="updateTableGroups()" flat label="Add" color="primary" v-close-popup/>
            </q-card-actions>
          </q-card>
        </q-dialog>

        <q-dialog v-model="ownerSelectionBox">
          <q-card style="width: 600px">
            <q-card-section>
              <div class="text-h6">Set new owner</div>

            </q-card-section>

            <q-card-section class="q-pt-none">
              <q-select flat :options="userAccounts" option-label="email" option-value="reference_id"
                        v-model="newOwnerId"></q-select>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="Cancel" color="warning" v-close-popup/>
              <q-btn @click="setOwner(newOwnerId)" flat label="Set" color="primary" v-close-popup/>
            </q-card-actions>
          </q-card>
        </q-dialog>


      </div>

    </div>
    <q-page-sticky position="top-right" :offset="[5, -10]">
      <q-btn @click="$emit('close')" flat size="sm" icon="fas fa-times"></q-btn>
    </q-page-sticky>
  </div>


</template>

<script>
import {mapActions, mapGetters, mapState} from 'vuex';

export default {
  name: 'TablePermissions',
  props: {
    selectedTable: Object
  },
  methods: {
    removeGroupFromDefaultGroups(group) {
      const that = this;
      var currentGroups = that.tableSchema.DefaultGroups;
      console.log("Current groups", group);
      var toRemove = currentGroups.indexOf(group);
      if (toRemove === -1) {
        return
      }
      currentGroups.splice(toRemove, 1)


      that.updateRow({
        tableName: "world",
        id: that.selectedTable.reference_id,
        world_schema_json: JSON.stringify(that.tableSchema),
      }).then(function () {
        that.$q.notify({
          message: "Saved"
        });
      }).catch(function (e) {
        console.log("Failed to remove group from default groups", e);
        that.$q.notify({
          message: "Failed to save"
        });
      });
    },
    saveTablePermissionModel() {
      const that = this;
      var newPermission = 1;
      for (var i in that.selectedPermissionOption) {
        console.log("new permission", newPermission, that.selectedPermissionOption[i]);
        newPermission = newPermission | that.selectedPermissionOption[i].value;
        console.log(newPermission)
      }
      console.log("new table permission", this.selectedPermissionOption, newPermission);
      that.updateRow({
        tableName: "world",
        id: that.selectedTable.reference_id,
        permission: newPermission,
        default_permission: newPermission
      }).then(function (usersOfGroup) {
        console.log("Updated table permission", usersOfGroup);
        that.loadTableGroups();
        that.executeAction({
          tableName: "world",
          actionName: "restart_daptin"
        }).then(function () {
          console.log("reconfig complete")
        }).catch(function (err) {
          console.log("configuration resync failed", err)
          that.$q.notify({
            message: "Reconfiguration failed, changes will not take effect until next config re-sync"
          })
        })
      }).catch(function (err) {
        console.log("Failed to update table permission")
        that.$q.notify({
          message: "Failed to update table permission"
        })
      })
    },
    removeTableFromGroup(group) {
      console.log("removeTableFromGroup", group);

      const that = this;
      that.removeRelation({
        tableName: "usergroup",
        id: group.relation_reference_id,
        relationName: "world_id",
        relationId: that.selectedTable.reference_id
      }).then(function (usersOfGroup) {
        console.log("Removed user ", usersOfGroup);
        that.loadTableGroups();
      }).catch(function (err) {
        that.$q.notify({
          message: "Failed to remove table from group"
        })
      })

    },
    updateTableGroups() {
      const that = this;
      console.log("Add groups", this.groupChangeFor, this.addToGroupId);
      switch (this.groupChangeFor) {
        case 'tableGroups':

          that.addManyRelation({
            tableName: "world",
            id: that.selectedTable.reference_id,
            relationId: this.addToGroupId.id,
            relationName: 'usergroup_id',
          }).then(function () {
            that.$q.notify({
              message: "Added group"
            });
            that.loadTableGroups()
          }).catch(function (e) {
            console.log("Failed to add group", e);
            that.$q.notify({
              message: "Failed to save"
            });
          });


          break;
        case 'newRowGroups':
          var currentGroups = that.tableSchema.DefaultGroups;
          console.log("Current groups", currentGroups);
          currentGroups.push(this.addToGroupId.name);


          that.updateRow({
            tableName: "world",
            id: that.selectedTable.reference_id,
            world_schema_json: JSON.stringify(that.tableSchema),
          }).then(function () {
            that.$q.notify({
              message: "Saved"
            });
          }).catch(function (e) {
            console.log("Failed to add new group", e);
            that.$q.notify({
              message: "Failed to save"
            });
          });

          break;

      }
    },
    setOwner(user) {
      const that = this;
      console.log("set new owner id", user, that.selectedTable);
      if (user != null) {
        that.selectedTable.user_account_id = user.reference_id;
        that.addRelation({
          tableName: "world",
          id: that.selectedTable.reference_id,
          relationId: that.selectedTable.user_account_id,
          relationName: 'user_account_id',
        }).then(function () {
          that.$q.notify({
            message: "Saved"
          });
          that.selectedTable.user_account_id = user;
        }).catch(function (e) {
          console.log("Failed to save new owner", e);
          that.$q.notify({
            message: "Failed to save"
          });
        });
      } else {
        that.removeRelation({
          tableName: "world",
          id: that.selectedTable.reference_id,
          relationName: 'user_account_id',
          relationId: that.selectedTable.user_account_id,
        }).then(function () {
          that.selectedTable.user_account_id = null;
          that.$q.notify({
            message: "Removed owner"
          });
        }).catch(function (e) {
          console.log("Failed to remove owner", e);
          that.$q.notify({
            message: "Failed to save"
          });
        });
      }


    },
    showOwnerSelectionBox() {
      this.ownerSelectionBox = true;
    },
    groupChangeForTableGroups() {
      this.groupChangeFor = 'tableGroups';
      this.addToGroup = true
    },
    groupChangeForNewRowGroups() {
      this.groupChangeFor = 'newRowGroups';
      this.addToGroup = true
    },
    ...mapActions(['loadData', 'loadModel', 'loadDataRelations',
      'updateRow', 'removeRelation', 'addRelation',
      'addManyRelation', 'loadDataRelations', 'executeAction']),
    refresh() {
      const that = this;
      console.log("Table schema json", that.selectedTable);
      that.selectedPermissionOption = [];
      var tablePermission = that.selectedTable.permission;
      for (var i = 0; i < that.simplePermissionOptions.length; i++) {
        var permission = that.simplePermissionOptions[i];
        if ((tablePermission & permission.value) === permission.value) {
          that.selectedPermissionOption.push(permission);
        }
      }

      that.tableSchema = JSON.parse(that.selectedTable.world_schema_json);

      var permissionValue = that.selectedTable.permission;
      this.loadTableGroups();
    },
    loadTableGroups() {
      const that = this;
      that.loadDataRelations({
        tableName: 'world',
        relation: 'usergroup_id',
        reference_id: that.selectedTable.reference_id,
      }).then(function (res) {
        console.log("Loaded groups of table", that.selectedTable.table_name, res);
        that.tableGroups = res.data;
      }).catch(function (err) {
        that.$q.notify({
          message: "Failed to load usergroups: " + JSON.stringify(err)
        })
      })
    }
  },
  data() {
    return {
      text: '',
      selectedPermissionOption: [],
      simplePermissionOptions: [
        {
          label: 'Guests can read',
          value: 1 << 1
        },
        {
          label: 'Guests can create',
          value: 1 << 2
        },
        {
          label: 'Guests can update',
          value: 1 << 3
        },
        {
          label: 'Guests can delete',
          value: 1 << 4
        },
        {
          label: 'Guests can execute actions',
          value: 1 << 5
        },
        {
          label: 'Owner can read',
          value: 1 << 8
        },
        {
          label: 'Owner can create',
          value: 1 << 9
        },
        {
          label: 'Owner can update',
          value: 1 << 10
        },
        {
          label: 'Owner can delete',
          value: 1 << 11
        },
        {
          label: 'Owner can execute actions',
          value: 1 << 12
        },
      ],
      permissionTypeTab: 'basic',
      newOwnerId: null,
      ownerSelectionBox: false,
      newGroupName: '',
      groupChangeFor: null,
      addToGroupId: null,
      tableSchema: {},
      addToGroup: false,
      addToGroupSwitch: 'addExisting',
      tableGroups: [],
      selectedTab: 'tablePermissions',
      ...mapState([]),
      permissionStructure: {
        None: 0,
        GuestPeek: 1 << 0,
        GuestRead: 1 << 1,
        GuestCreate: 1 << 2,
        GuestUpdate: 1 << 3,
        GuestDelete: 1 << 4,
        GuestExecute: 1 << 5,
        GuestRefer: 1 << 6,
        UserPeek: 1 << 7,
        UserRead: 1 << 8,
        UserCreate: 1 << 9,
        UserUpdate: 1 << 10,
        UserDelete: 1 << 11,
        UserExecute: 1 << 12,
        UserRefer: 1 << 13,
        GroupPeek: 1 << 14,
        GroupRead: 1 << 15,
        GroupCreate: 1 << 16,
        GroupUpdate: 1 << 17,
        GroupDelete: 1 << 18,
        GroupExecute: 1 << 19,
        GroupRefer: 1 << 20,
      },
      parsedGuestPermission: {
        canPeek: false,
        canRead: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        canRefer: false,
        canExecute: false,
      },
      parsedOwnerPermission: {
        canPeek: false,
        canRead: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        canRefer: false,
        canExecute: false,
      },
      parsedGroupPermission: {
        canPeek: false,
        canRead: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        canRefer: false,
        canExecute: false,
      },
      userAccounts: [],
      userGroups: [],
    }
  },
  mounted() {
    const that = this;
    this.loadData({
      tableName: "user_account",
      params: {
        page: 1,
        size: 500
      }
    }).then(function (res) {
      that.userAccounts = res.data;
    }).catch(function (err) {
      that.$q.notify({
        message: "Failed to load users list: " + JSON.stringify(err)
      })
    });

    that.loadData({
      tableName: "usergroup",
      params: {
        page: 1,
        size: 500
      }
    }).then(function (res) {
      that.userGroups = res.data;
    }).catch(function (err) {
      that.$q.notify({
        message: "Failed to load usergroups list: " + JSON.stringify(err)
      })
    });


    this.refresh();
  },
  computed: {
    ...mapGetters(['tables']),
    ...mapState([])
  },

  watch: {
    'selectedTable': function (newTable, oldTable) {
      const that = this;
      this.refresh()
    },
    'parsedOwnerPermission': function (newPermission, currentPermission) {
      console.log("Permission changed", newPermission, currentPermission)
    }
  }
}
</script>
