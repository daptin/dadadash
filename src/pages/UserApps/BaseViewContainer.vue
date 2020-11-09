<template>
  <q-layout class="user-area-pattern" view="lHh Lpr lFf">

    <q-page-container>
      <q-page>

        <div class="row">

          <div class="col-12">
            <q-bar style="height: 50px" dark>
              <q-tabs
                class="text-black"
                inline-label
              >
                <q-route-tab
                  :key="item.reference_id"
                  v-if="item.type !== 'summary'" v-for="item in baseConfig.items"
                  :to="'/apps/workspace/' + workspaceName + '/' + baseName + '/' + item.label" exact replace
                >
                  <span><q-icon :name="itemIconMap[item.type]"></q-icon> &nbsp;&nbsp;&nbsp;</span>{{ item.label }}
                  <!--                  <span>&nbsp; &nbsp; &nbsp;-->
                  <!--                    <q-icon name="fas fa-cog"></q-icon>-->

                  <!--                  </span>-->
                  <q-menu context-menu style="min-width: 300px">
                    <q-list>

                      <q-item clickable>
                        <q-item-section>
                          <q-item-label>Customise item</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item clickable @click="renameBaseItem(item)">
                        <q-item-section>
                          <q-item-label>Rename item</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item clickable @click="deleteBaseItem(item)">
                        <q-item-section>
                          <q-item-label>Delete item</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-route-tab>


              </q-tabs>
              <q-btn flat class="text-primary" id="newTableButton" icon="fas fa-plus">
                <q-menu>
                  <q-list style="min-width: 280px">

                    <q-item clickable @click="addBaseItem(item)" v-close-popup v-for="item in baseItemTypes"
                            :key="item.label">
                      <q-item-section>{{ item.label }}</q-item-section>
                      <q-item-section avatar>
                        <q-icon :name="item.icon"></q-icon>
                      </q-item-section>
                    </q-item>
                    <q-separator/>

                  </q-list>
                </q-menu>
              </q-btn>

            </q-bar>
          </div>

          <q-separator></q-separator>
        </div>

        <base-view-router v-if="baseLoaded && selectedBaseItem" :base-config="baseConfig"
                          :baseItem="selectedBaseItem"></base-view-router>


      </q-page>

    </q-page-container>

    <user-header-bar @delete-base="deleteBase"
                     style="border-bottom: 1px solid black"
                     @search="searchDocuments"
                     @reload-bases="refreshBaseData"
                     :buttons="{
        before: [
            {icon: 'fas fa-search', event: 'search'},
          ],
        after: [
            {icon: 'fas fa-sync-alt', event: 'reload-bases'},
            {icon: 'fas fa-trash', event: 'delete-base'},
          ],
        }" :onBack="() => {$router.push('/apps/workspace/' + $route.params.workspaceName)}"
                     :title='"[Workspace] " + $route.params.workspaceName
                     + "&nbsp;&nbsp; › &nbsp;&nbsp;" + ($route.params.baseName)
                     + ( $route.params.itemName ? "&nbsp;&nbsp; › &nbsp;&nbsp;" + ($route.params.itemName) : "" )  '
    ></user-header-bar>


    <q-dialog v-model="confirmDeleteBaseMessage">
      <q-card style="background: white">
        <q-card-section>
          <q-item>
            <q-item-label>
              <span class="text-h5">Delete {{ baseName }}</span>
            </q-item-label>
          </q-item>
        </q-card-section>
        <q-card-section class="q-pa-md">
          <span>Are you sure you want to delete this base ?</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn @click="confirmDeleteBaseMessage = false" class="float-left" label="Cancel"></q-btn>
          <q-btn @click="deleteBaseConfirm()" color="warning" class="float-right" label="Yes"></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showRenameBaseViewModel">
      <q-card style="background: white">
        <q-card-section>
          <span class="h5">Rename</span>
        </q-card-section>
        <q-card-section>
          <q-input v-model="newName"></q-input>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Update" @click="renameBaseItem"></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showDeleteConfirmDialog">
      <q-card style="background: white">
        <q-card-section>
          <span class="h5">Delete</span>
        </q-card-section>
        <q-card-section>
          Are you sure you want to delete this item
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Update" @click="deleteBaseItem"></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>


  </q-layout>

</template>
<style>


#newTableButton i {
  border: 1px solid #DDDBDA;
  font-size: 14px;
  color: #5034A4;
  border-radius: 4px;
}


</style>

<script>
import {mapActions, mapGetters} from 'vuex';
import BaseViewRouter from "pages/UserApps/BaseViewRouter";
import {v4 as uuidv4} from 'uuid';


function makeid(length) {
  var result = '';
  var characters = 'abcdefghijklmnopqrstuvwxyz';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

window.XLSX = XLSX;


export default {
  name: "BaseData",
  components: {BaseViewRouter},
  meta() {
    return {
      // this accesses the "title" property in your Vue "data";
      // whenever "title" prop changes, your meta will automatically update
      title: ('[' + this.$route.params.baseName + "] " + this.$route.params.itemName) + " - " + this.$route.params.workspaceName
    }
  },

  methods: {
    deleteBaseItem(item) {
      console.log("Delete base item", item, this.itemBeingEdited)
      if (!this.showDeleteConfirmDialog) {
        this.showDeleteConfirmDialog = true;
        this.itemBeingEdited = item;
        return
      }
      this.showDeleteConfirmDialog = false;

      const that = this;
      that.deleteRow({
        tableName: "document",
        reference_id: that.itemBeingEdited.reference_id
      }).then(function (res) {
        that.$q.notify({
          message: "Item deleted"
        });
        delete that.baseItemMap[that.itemBeingEdited.label];
        var indexToDelete = -1;
        for (var i = 0; i < that.baseConfig.items.length; i++) {
          if (that.baseConfig.items[i].label === that.itemBeingEdited.label) {
            indexToDelete = i;
            break
          }
        }
        console.log("Item to remove from base config", indexToDelete)
        if (indexToDelete > -1) {
          that.baseConfig.items.splice(indexToDelete, 1);
        }
      })
    },
    renameBaseItem(item) {
      const that = this;
      console.log("Rename base item", this.itemBeingEdited);
      if (this.showRenameBaseViewModel !== true) {
        this.itemBeingEdited = item;
        this.newName = this.itemBeingEdited.label;
        this.showRenameBaseViewModel = true;
        return
      }
      console.log("Updated name", this.newName)
      if (this.newName !== this.itemBeingEdited.label) {
        console.log("Update item");
        const originalTitle = this.itemBeingEdited.label;
        this.itemBeingEdited.label = this.newName;
        that.updateRow({
          tableName: "document",
          id: that.itemBeingEdited.reference_id,
          document_name: that.newName,
        }).then(function (res) {
          console.log("Updated item name", res);
          that.baseItemMap[that.newName] = that.baseItemMap[originalTitle];
          delete that.baseItemMap[originalTitle];
          if (originalTitle === that.selectedItem) {
            that.$router.push('/apps/workspace/' + that.workspaceName + "/" + that.baseName + "/" + that.newName)
          }
          // that.refreshData()
        }).catch(function (err) {
          console.log("Failed to update item name", err)
        })
      }
      this.showRenameBaseViewModel = false;
    },
    addBaseItem(item) {
      const that = this;
      console.log("Add new item to base", item);
      let newItem = {
        type: item.type,
        label: "New " + item.type
      };


      var newRow = null;

      newRow = {
        document_name: "New " + item.type,
        tableName: "document",
        document_extension: item.type,
        mime_type: 'workspace/' + item.type,
        document_path: "/" + that.workspaceName + "/" + that.baseName,
        document_content: [{
          name: item.type + "-" + uuidv4() + ".json",
          type: "workspace/" + item.type,
          path: "/" + that.workspaceName + "/" + that.baseName,
          contents: "workspace/" + item.type + "," + btoa(JSON.stringify(item))
        }],
      }


      console.log("Create base request", newRow)

      that.createRow(newRow).then(function (res) {
        console.log("New workspace item created", res)
        newItem.reference_id = res.data.reference_id;
        that.baseConfig.items.push(newItem);
        that.baseItemMap[newItem.label] = res.data
      }).catch(function (err) {
        that.$q.notify({
          message: "Failed to create new item - " + JSON.stringify(err)
        })
      })


    },
    deleteBaseConfirm() {
      // TODO: more things need to be deleted here - tables, documents and other attachments
      console.log("Delete base", this.baseName);
      const that = this;
      that.confirmDeleteBaseMessage = false;
      var baseItems = that.loadData({
        tableName: "document",
        params: {
          query: JSON.stringify([{
            column: "document_path",
            operator: "is",
            value: "/" + that.workspaceName + "/" + that.baseName
          }]),
          page: {
            size: 100,
          }
        }
      }).then(function (res) {
        console.log("base items to be deleted", res);
        var promises = [];
        for (var i = 0; i < res.data.length; i++) {
          var item = res.data[i];
          console.log("Delete item", item);
          promises.push(that.deleteRow({
            tableName: "document",
            reference_id: item.id
          }))
        }
        for (var i = 0; i < that.baseConfig.items.length; i++) {
          var item = that.baseConfig.items[i];
          if (item.type === "table") {
            console.log("target table details,", item)
            // promises.push(that.executeAction({
            //   tableName: "world",
            //   actionName: "remove_table",
            //   params: {
            //     world_id: ""
            //   }
            // }))
          }
        }
        Promise.all(promises).then(function (res) {
          console.log("All child item deleted", res, "delete base", that.baseRow);
          that.deleteRow({
            tableName: "document",
            reference_id: that.baseRow.id,
          }).then(function (res) {
            console.log("Base deleted");
            that.$router.push('/apps/workspace/' + that.workspaceName)
          }).catch(function (err) {
            console.log("Failed to delete base", err);
            that.$q.notify({
              message: "Failed to delete base please try again later"
            })
          })
        }).catch(function (err) {
          console.log("Failed to delete a child item", err)
        })
      })
    },
    deleteBase() {
      console.log("Delete base", this.baseName);
      const that = this;
      that.confirmDeleteBaseMessage = true;
    },
    searchDocuments(searchQuery) {
      console.log("search data", arguments)
      // this.refreshBaseData();
      this.searchQuery = searchQuery;
      this.refreshData();
    },
    showUploadData() {

    },
    ...mapActions(['loadData', 'getTableSchema', 'updateRow', 'createRow', 'deleteRow', 'executeAction', 'loadModel']),
    refreshBaseData() {
      const that = this;
      that.baseItemMap = [];

      const workspaceName = this.$route.params.workspaceName;
      const baseName = this.$route.params.baseName;
      that.selectedItem = this.$route.params.itemName;
      that.baseName = baseName;
      that.baseConfig = {name: baseName};

      that.workspaceName = workspaceName;

      that.$q.notify({
        message: "Refreshing base"
      });


      let queryPayload = {
        tableName: "document",
        params: {
          query: JSON.stringify([{
            column: "document_path",
            operator: "is",
            value: "/" + workspaceName
          }, {
            column: "mime_type",
            operator: "is",
            value: "workspace/base"
          }, {
            column: "document_name",
            operator: "is",
            value: baseName
          }]),
          page: {
            size: 1,
          },
          included_relations: "document_content"
        }
      };

      that.files = [];
      console.log("Query data")
      var promises = [];

      that.loadData(queryPayload).then(function (res) {
        console.log("base load complete", res)
        var baseRow = res.data[0];
        if (!baseRow.document_content) {
          alert("Base configuration is empty - " + baseRow)
          return
        }
        that.baseRow = baseRow
        var baseConfigString = baseRow.document_content[0].contents;
        that.baseConfig = JSON.parse(atob(baseConfigString));
        that.baseConfig.name = that.baseName;
        console.log("selected base item 1", that.selectedItem, that.baseConfig, that.baseItemMap, that.selectedBaseItem)


        queryPayload = {
          tableName: "document",
          params: {
            query: JSON.stringify([{
              column: "document_path",
              operator: "is",
              value: "/" + workspaceName + "/" + baseName
            }, {
              column: "mime_type",
              operator: "like",
              value: "workspace/%"
            }]),
            page: {
              size: 100,
            },
            included_relations: "document_content"
          }
        };
        that.baseConfig.items = [];


        that.loadData(queryPayload).then(function (res) {
          console.log("base items", res);
          for (var i = 0; i < res.data.length; i++) {
            try {
              var item = res.data[i];
              var itemConfig = JSON.parse(atob(item.document_content[0].contents))
              itemConfig.type = item.document_extension;
              itemConfig.label = item.document_name;
              itemConfig.reference_id = item.reference_id;
              that.baseItemMap[item.document_name] = item;
              that.baseConfig.items.push(itemConfig);
            } catch (e) {
              console.log("failed to parse item data", e)
            }
          }
          that.selectedBaseItem = that.baseItemMap[that.selectedItem];
          that.ensureBaseTables()
        });

      })


      return Promise.all(promises).then(function () {
        console.log("Base reload complete")
      }).catch(function (err) {
        console.log("Failed to refresh base data", err)
      })


    },
    ensureBaseTables() {
      const that = this;
      console.log("Ensure base tables", this.baseConfig)

      var promises = [];
      var updateSchema = {
        Tables: [],
      };


      for (var i = 0; i < that.baseConfig.items.length; i++) {
        var item = that.baseConfig.items[i];
        if (item.type === "table") {
          console.log("Table item", item, item.targetTable);
          var targetTable = item.targetTable;
          if (!targetTable) {
            var targetTableConfig = item.attributes;
            targetTableConfig.TableName = "tab_" + makeid(7)

            for (var j = 0; j < targetTableConfig.Columns.length; j++) {
              var column = targetTableConfig.Columns[j];
              if (column.ColumnType.startsWith("file.")) {
                column.DataType = "blob"
                column.IsForeignKey = true
                column.ForeignKeyData = {
                  DataSource: "cloud_store",
                  Namespace: "localstore",
                  KeyName: column.ColumnName,
                }
              }
            }

            console.log("No target table exists for this item, creating one", item.label, targetTableConfig.TableName);
            updateSchema.Tables.push(targetTableConfig);
            item.targetTable = targetTableConfig;

            that.baseItemMap[item.label].document_content[0].contents = btoa(JSON.stringify(item))
            console.log("Update base request", that.baseItemMap[item.label])
            that.baseItemMap[item.label].tableName = "document";
            promises.push(that.updateRow(that.baseItemMap[item.label]))
          }
        }
      }


      return Promise.all(promises).then(function () {
        if (updateSchema.Tables.length > 0) {

          that.$q.notify({
            message: "Creating " + updateSchema.Tables.length + " tables"
          });

          that.executeAction({
            tableName: "world",
            actionName: "upload_system_schema",
            params: {
              schema_file: [{
                contents: "application/json," + btoa(JSON.stringify(updateSchema)),
                name: that.baseName + ".json"
              }]
            }
          }).then(function (res) {
            console.log("Tables created", res);
            that.$q.notify({
              message: "Base created"
            });

            setTimeout(function () {
              console.log("Try to create random data for the new base");
              that.$q.notify({
                message: "Generating random data for " + updateSchema.Tables.length + " tables"
              });


              updateSchema.Tables.map(function (table) {
                console.log("Create random data for ", table.TableName);

                that.executeAction({
                  tableName: "world",
                  actionName: "generate_random_data",
                  params: {
                    "table_name": table.TableName,
                    "count": 10,
                  }
                }).then(function (res) {
                  console.log("Random data generated for table", table.TableName)
                }).catch(function (err) {
                  console.log("Failed to generate random data for ", table.TableName, err)
                })
              })
            }, 6000)

          }).catch(function (err) {
            console.log("Failed to create table", err)
            that.$q.notify({
              message: "Failed to create tables for the base"
            });

          })
        } else {
        }
      })


    },
    refreshData() {
      const that = this;
      that.newRowData = [];
      that.sourceMap = {};
      console.log("Selected base item", that.selectedItem, that.baseItemMap);
      that.selectedItem = that.$route.params.itemName;
      that.baseName = that.$route.params.baseName;
      that.selectedBaseItem = that.baseItemMap[that.selectedItem]
      console.log("Updated base ", that.selectedItem, that.baseName, that.selectedBaseItem);

      that.baseLoaded = true;
      return Promise.resolve();

    },
  },
  props: ["baseConfiguration"],
  data() {
    return {
      baseItemMap: {},
      showRenameBaseViewModel: false,
      showDeleteConfirmDialog: false,
      itemBeingEdited: null,
      newName: null,
      baseLoaded: false,
      dataUploadFile: null,
      selectedBaseItem: null,
      baseItemTypes: {
        "table": {
          label: "Data table",
          type: "table",
          icon: 'fas fa-table'
        },
        "view": {
          label: "View",
          type: "view",
          icon: 'fas fa-eye'
        },
        "spreadsheet": {
          label: "Spreadsheet",
          type: "spreadsheet",
          icon: 'table_view'
        },
        "document": {
          label: "Document",
          type: "document",
          icon: 'fas fa-file-alt'
        },
        "folder": {
          label: "Folder",
          type: "folder",
          icon: 'folder_open'
        },
        "calendar": {
          label: "Calendar",
          type: "calendar",
          icon: 'fas fa-table'
        },
        "mailbox": {
          label: "Mailbox",
          type: "mailbox",
          icon: 'all_inbox'
        },

      },
      itemIconMap: {
        'table': 'fas fa-table',
        'view': 'fas fa-eye',
        'spreadsheet': 'table_view',
        'document': 'fas fa-file-alt',
        'folder': 'folder_open',
        'calendar': 'calendar_today',
        'mailbox': 'all_inbox',
      },
      baseRow: null,
      confirmDeleteBaseMessage: false,
      searchQuery: null,
      baseConfig: {items: []},
      workspaceDocument: null,
      selectedItem: null,
      workspaceName: null,
      baseName: null,
      itemName: null,
      tablePermissionDrawer: false,
      currentPage: 1,
      tabulatorOptions: {
        headerFilter: false,
      },
      currentPagination: {},
      defaultColumns: ['updated_at', 'created_at', 'reference_id', 'permission'],
      tableSchema: {ColumnModel: []},
      rows: [],
      tableData: null,
      newRowDrawer: false,
      newRowData: [],
      selectedRows: [],
    }
  },
  computed: {
    ...mapGetters(['endpoint', 'authToken', 'tables'])
  },
  mounted() {
    const that = this;
    this.refreshBaseData().then(function () {
      console.log("base load complete return");
      that.refreshData();
    }).catch(function (err) {
      console.log("Failed to complete base data refresh", err)
    });
  },
  watch: {
    '$route.params.baseName': function () {
      const that = this;
      that.baseLoaded = false;
      console.log("base name changed", arguments)
      this.refreshData();
    },
    '$route.params.itemName': function () {
      const that = this;
      that.baseLoaded = false;
      console.log("item name changed", arguments)
      this.refreshData();
    }
  },
}
</script>

<style scoped>

</style>
