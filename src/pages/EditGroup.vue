<template>
  <q-page-container>

    <q-page v-if="group">

      <div class="row">
        <div class="col-6 col-xs-12 col-sm-12 col-md-6">

          <div class="row">
            <div class="col-12 q-pa-md">
              <span class="text-h5">{{ group.name }}</span>
              <q-btn @click="deleteGroup()" label="Delete group" class="float-right" color="negative"></q-btn>
            </div>
            <div class="col-12 q-pa-md">
              <q-input label="filter relations" v-model="relationFilter"></q-input>
            </div>
          </div>
          <div class="row">
            <div class="col-12 q-pa-md" style="height: 60vh; overflow: scroll">
              <div class="row q-gutter-sm q-pa-md"
                   v-for="table in filteredTables">
                <div class="col-12">
                  <q-card>
                    <q-card-section>
                      {{ table.table_name }} in the group: {{
                        objectsInTheGroup[table.table_name + '_id'] ? objectsInTheGroup[table.table_name + '_id'].length : 0
                      }}
                      <q-btn flat icon="fas fa-plus" size="sm" class="float-right"
                             @click="addObjectType(table.table_name)"
                             :label="'Add new '+table.table_name"></q-btn>
                    </q-card-section>
                    <q-card-actions>

                    </q-card-actions>
                    <q-card-section>
                      <q-markup-table flat>
                        <thead>
                        <tr>
                          <th></th>
                          <th>Read</th>
                          <th>Create</th>
                          <th>Update</th>
                          <th>Delete</th>
                          <th>Execute</th>
                          <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="object in objectsInTheGroup[table.table_name + '_id']">
                          <td><span class="text-bold">{{ object.__label }}</span></td>
                          <td>
                            <q-checkbox @input="toggleObjectPermission(object, permissionStructure.GroupRead)" size="sm"
                                        :value="(object.permission & permissionStructure.GroupRead) === permissionStructure.GroupRead"></q-checkbox>
                          </td>
                          <td>
                            <q-checkbox @input="toggleObjectPermission(object, permissionStructure.GroupCreate)"
                                        size="sm"
                                        :value="(object.permission & permissionStructure.GroupCreate) === permissionStructure.GroupCreate"></q-checkbox>
                          </td>
                          <td>
                            <q-checkbox @input="toggleObjectPermission(object, permissionStructure.GroupUpdate)"
                                        size="sm"
                                        :value="(object.permission & permissionStructure.GroupUpdate) === permissionStructure.GroupUpdate"></q-checkbox>
                          </td>
                          <td>
                            <q-checkbox @input="toggleObjectPermission(object, permissionStructure.GroupDelete)"
                                        size="sm"
                                        :value="(object.permission & permissionStructure.GroupDelete) === permissionStructure.GroupDelete"></q-checkbox>
                          </td>
                          <td>
                            <q-checkbox @input="toggleObjectPermission(object, permissionStructure.GroupExecute)"
                                        size="sm"
                                        :value="(object.permission & permissionStructure.GroupExecute) === permissionStructure.GroupExecute"></q-checkbox>
                          </td>
                          <td class="text-right">
                            <q-btn size="xs" icon="fas fa-trash"
                                   @click="removeObjectFromGroup(table.table_name, object)" flat></q-btn>
                          </td>
                        </tr>

                        </tbody>
                      </q-markup-table>
                    </q-card-section>
                  </q-card>


                </div>

              </div>
            </div>
          </div>
        </div>
      </div>


      <q-dialog v-model="showAddObjectToGroup" persistent>
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Add {{objectTypeToAdd}}</div>
          </q-card-section>

          <q-card-section class="q-pt-none">

            <q-select
              filled
              autofocus
              multiple
              v-model="column.value"
              :label="objectTypeToAdd"
              :options="column.options"
              :loading="column.loading"
              use-input
              @filter="function(x, y, z){onEntitySelectScroll(x, y, z, column)}"
            />

          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn @click="showAddObjectToGroup = false" flat label="Cancel" v-close-popup/>
            <q-btn @click="addObjectToGroup()" flat label="Add" v-close-popup/>
          </q-card-actions>
        </q-card>
      </q-dialog>


    </q-page>
  </q-page-container>
</template>
<script>
import {mapActions, mapGetters} from "vuex";
import Vue from 'vue';

export default {
  name: "EditGroup",
  data: function () {
    return {
      column: {},
      group: null,
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
      labelColumns: {},
      objectTypeToAdd: null,
      relationFilter: null,
      showAddObjectToGroup: false,
      newSelectedObject: null,
      c: {},
      objectsInTheGroup: [],
      ...mapGetters(["tables"])
    }
  },
  computed: {
    filteredTables() {
      const that = this;
      console.log("All tables", that.tables())
      return that.tables().filter(function (e) {
        if (!that.relationFilter) {
          return !e.table_name.startsWith('tab_');
        } else {
          return !e.table_name.startsWith('tab_') && e.table_name.indexOf(that.relationFilter) > -1
        }
      })
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

      console.log("tables", that.tables())
      that.tables().map(function (table) {
        // console.log("load table model", table.table_name)
        that.loadModel(table.table_name).then(function () {
          console.log("load table object", table.table_name)
          that.loadGroupObjects(table.table_name)
        }).catch(function () {
          console.log("Failed to load model", arguments)
        })
      })
    })


    },
    methods: {
      toggleObjectPermission(object, permissionBit) {
        const that = this;
        if ((object.permission & permissionBit) === permissionBit) {
          object.permission = object.permission & ~permissionBit
        } else {
          object.permission = object.permission | permissionBit
        }
        console.log("updated permission", object);
        let tableName = object["__type"];
        var relationTableName = tableName + "_" + tableName + "_id_has_usergroup_usergroup_id"
        that.getTableSchema(relationTableName).then(function () {
          that.updateRow({
            tableName: relationTableName,
            id: object["reference_id"],
            permission: object.permission,
          })
        })
      },
      getLabelColumns(tableName) {
        const that = this;
        return new Promise(function (resolve, reject) {
          if (that.labelColumns[tableName]) {
            resolve(that.labelColumns[tableName])
          }

          that.getTableSchema(tableName).then(function (tableSchema) {
            // console.log("Table schema", tableSchema);
            var labelColumns = Object.values(tableSchema.ColumnModel).filter(function (e) {
              return e.ColumnType === "label" || e.ColumnType === "name";
            }).map(function (e) {
              return e.ColumnName;
            })
            if (labelColumns.length === 0) {
              labelColumns = ["reference_id"]
            }
            that.labelColumns[tableName] = labelColumns;
            resolve(labelColumns)
          }).catch(reject);
        })
      },
      onEntitySelectScroll(filterValue, update, abort, column) {
        console.log("load data for select menu", arguments, column);
        const that = this;
        column.loading = true;

        that.getTableSchema(column.meta.type).then(function (tableSchema) {
          console.log("Table schema", tableSchema);
          var labelColumns = Object.values(tableSchema.ColumnModel).filter(function (e) {
            return e.ColumnType === "label" || e.ColumnType === "name";
          }).map(function (e) {
            return e.ColumnName;
          })
          if (labelColumns.length === 0) {
            labelColumns = ["reference_id"]
          }

          console.log("label columns", labelColumns)

          that.loadData({
            tableName: column.meta.type,
            params: {
              filter: filterValue,
              page: {
                size: 50,
              }
            }
          }).then(function (res) {
            console.log("table entries", column.meta.type, res)

            update(() => {
              column.options = res.data.map(function (e) {
                return {
                  label: labelColumns.map(function (l) {
                    return e[l]
                  }).filter(e => !!e).join(", "),
                  value: e.reference_id
                }
              });
              column.loading = false;
              console.log("updated options for ", column.meta.type, column.options)
            })
          }).catch(function (err) {
            abort();
            column.loading = false;
            console.log("Failed to load options for ", col, err);
            that.$q.notify({
              type: "error",
              message: "Failed to load table entries for entity: " + col.meta.type
            })
          })


        })

      },
      addObjectType(typeName) {
        this.objectTypeToAdd = typeName;
        this.column = {
          options: [],
          loading: false,
          value: null,
          meta: {
            type: typeName
          }
        }
        this.showAddObjectToGroup = true
      },
      removeObjectFromGroup(tableName, object) {
        var relationName = tableName + "_id";
        console.log("remove object from group", object);
        const that = this;
        that.removeRelation({
          tableName: "usergroup",
          id: that.group.reference_id,
          relationName: relationName,
          relationId: object.relation_reference_id
        }).then(function (usersOfGroup) {
          console.log("Removed  " + relationName, usersOfGroup);
          that.loadGroupObjects(tableName);
        }).catch(function (err) {
          that.$q.notify({
            message: "Failed to remove " + relationName + " from group"
          })
        })
      },
      loadGroupObjects(tableName) {
        var relationName = tableName + "_id";

        const that = this;

        that.getLabelColumns(tableName).then(function (labelColumns) {
          that.loadDataRelations({
            tableName: 'usergroup',
            relation: relationName,
            reference_id: that.group.reference_id
          }).then(function (objectsOfGroup) {
            // console.log(relationName, "in this group", objectsOfGroup);
            objectsOfGroup.data = objectsOfGroup.data ? objectsOfGroup.data.map(function (e) {
              e.__label = labelColumns.map(function (r) {
                return e[r]
              }).filter(w => !!w).join(", ");


              return e;
            }) : []
            // that.objectsInTheGroup[relationName] = objectsOfGroup.data;
            Vue.set(that.objectsInTheGroup, relationName, objectsOfGroup.data)
          });

        })


      },
      addObjectToGroup() {
        const that = this;
        console.log("add user to group", this.column);

        if (!(this.column.value instanceof Array)) {
          this.column.value = [this.column.value]
        }

        this.column.value.map(function (value) {
          that.addManyRelation({
            tableName: "usergroup",
            id: that.group.id,
            relationName: that.objectTypeToAdd + "_id",
            relationId: value.value
          }).then(function (res) {
            console.log("Added " + that.objectTypeToAdd + " group", res);
            that.$q.notify({
              message: "Added " + that.objectTypeToAdd + " to group"
            });
            that.showAddUserToGroup = false;
            that.loadGroupObjects(that.objectTypeToAdd)
          }).catch(function (error) {
            that.$q.notify({
              message: JSON.stringify(error)
            })
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
      ...mapActions(['loadData', 'loadModel', 'getTableSchema', 'updateRow', 'deleteRow', 'loadDataRelations', 'addManyRelation', 'removeRelation'])
    }
  }
</script>
