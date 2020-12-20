<template>
  <q-layout class="user-area-pattern" view="lHh Lpr lFf">

    <q-page-container>
      <q-page>
        <div class="row" style="width: 100vw; height: 40px;">

          <q-btn flat class="text-primary tabMenuButton" id="listTableButton" icon="fas fa-bars">
            <q-menu>
              <q-list style="min-width: 280px">
                <q-item clickable v-close-popup
                        @click="$router.push('/workspace/' + workspaceName + '/' + baseName + '/' + item.document_name)"
                        v-for="item in baseConfig.items"
                        :key="item.document_name">
                  <q-item-section>{{ item.document_name }}</q-item-section>
                  <q-item-section avatar>
                    <q-icon :name="baseItemTypes[item.document_extension] ? baseItemTypes[item.document_extension].icon : item.document_extension"></q-icon>
                  </q-item-section>
                </q-item>
                <q-separator/>

              </q-list>
            </q-menu>
          </q-btn>

          <q-tabs style="max-width: calc(100vw - 150px); height: 40px"
                  class="text-black"
                  inline-label
                  shrink
                  outside-arrows

          >
            <q-route-tab style="border: 1px solid black; border-radius: 4px"
              :key="item.reference_id"
              v-if="item.type !== 'summary'" v-for="item in baseConfig.items"
              :to="'/workspace/' + workspaceName + '/' + baseName + '/' + item.document_name" exact replace
            >
              <span><q-icon :name="baseItemTypes[item.document_extension] ? baseItemTypes[item.document_extension].icon : item.document_extension"></q-icon> &nbsp;&nbsp;&nbsp;</span>{{
                item.document_name
              }}
              <q-menu context-menu
                      style="min-width: 300px">
                <q-list>
                  <q-item clickable>
                    <q-item-section @click="configureBaseItem(item)">
                      <q-item-label>Configure</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable @click="renameBaseItem(item)">
                    <q-item-section>
                      <q-item-label>Rename</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable @click="deleteBaseItem(item)">
                    <q-item-section>
                      <q-item-label>Delete</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-route-tab>


          </q-tabs>
          <q-btn flat class="text-primary tabMenuButton" id="newTableButton" icon="fas fa-plus">
            <q-menu>
              <q-list style="min-width: 280px">

                <q-item :disable="item.disabled" clickable @click="addBaseItem(item)" v-close-popup
                        v-for="item in baseItemTypes"
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

        </div>

        <q-separator></q-separator>

        <base-view-router ref="viewRouter" v-if="baseLoaded && selectedBaseItem" :base-config="baseConfig"
                          :baseItem="selectedBaseItem"></base-view-router>


      </q-page>

    </q-page-container>

    <user-header-bar @delete-base="deleteBase"
                     style="border-bottom: 1px solid black"
                     @search="searchDocuments"
                     @reload-bases="refreshBaseData"
                     :buttons="{
        before: [
            // {icon: 'fas fa-search', event: 'search'},
          ],
        after: [
            {icon: 'fas fa-sync-alt', event: 'reload-bases'},
            {icon: 'fas fa-trash', event: 'delete-base'},
          ],
        }" :onBack="() => {$router.push('/workspace/' + $route.params.workspaceName)}"
                     :title='$route.params.workspaceName
                     + "&nbsp;&nbsp; › &nbsp;&nbsp;" + ($route.params.baseName)
                     + ( $route.params.itemName ? "&nbsp;&nbsp; › &nbsp;&nbsp;" + ($route.params.itemName) : "" )  '
    ></user-header-bar>


    <q-dialog v-model="confirmDeleteBaseMessage">
      <q-card style="background: white">
        <q-card-section>
          <q-item>
            <q-item-label>
              <span class="text-h4">Delete</span>
            </q-item-label>
          </q-item>
        </q-card-section>
        <q-card-section class="q-pa-md">
          <span>Are you sure you want to delete all the items in this base ?</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn @click="deleteBaseConfirm()" color="negative" class="float-right" label="Delete"></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showRenameBaseViewModel">
      <q-card style="background: white; min-width: 400px;">
        <q-card-section>
          <span class="text-h5">Rename item</span>
        </q-card-section>
        <q-card-section>
          <q-input id="newBaseNameField" v-model="newName"></q-input>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Update" @click="renameBaseItem" color="primary"></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showDeleteConfirmDialog">
      <q-card style="background: white">
        <q-card-section>
          <span class="text-h5">Delete</span>
        </q-card-section>
        <q-card-section>
          Are you sure you want to delete this item
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Delete" color="negative" @click="deleteBaseItem"></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-drawer overlay :width="450" side="right" v-model="showBaseConfigurationModel">
      <q-list class="q-pa-md">
        <q-item>
          <q-item-section>
            <span class="text-bold">Configure</span>
            <span class="text-h6">{{ itemConfiguration.document_name }}</span>
          </q-item-section>

        </q-item>
        <q-item>
          <q-item-section>
            <div class="row">
              <div class="col-12">
                <span class="text-bold">Read access</span>
              </div>
              <div class="col-12">
                <div class="row">
                  <div class="col-12">
                    <q-checkbox label="Allow guests to see this item"
                                v-model="itemConfiguration.allowGuests"></q-checkbox>
                  </div>
<!--                  <div class="col-12">-->
<!--                    <q-checkbox label="Show this on frontpage"-->
<!--                                v-model="itemConfiguration.showOnFrontpage"></q-checkbox>-->
<!--                  </div>-->
                </div>
              </div>
            </div>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <div class="row">
              <div class="col-12">
                <q-btn class="float-right" @click="saveItemPermissions" color="primary" label="Save"></q-btn>
              </div>
            </div>
          </q-item-section>
        </q-item>

      </q-list>

    </q-drawer>


  </q-layout>

</template>
<style scoped>

/*.q-tab {*/
/*  border: 1px solid black;*/
/*  border-radius: 4px;*/
/*  height: 39px;*/
/*  top: 4px;*/
/*  margin-left: 2px;*/
/*  margin-right: 2px;*/

/*}*/

/*.q-tab .q-tab__content {*/
/*  left: -20px;*/
/*  margin-top: -4px;*/
/*}*/

.q-tab span i.q-icon {
  margin-top: -5px;
  left: 12px;
}

.tabMenuButton i {
  border: 1px solid #DDDBDA;
  font-size: 1em !important;
  color: #5034A4;
  border-radius: 4px;
  margin-top: -5px;
  width: 35px;
  height: 20px;
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

const DEFAULT_ITEM_MAP = {
  "table": {
    "attributes": {
      "TableName": "New table",
      "Columns": [
        {
          "Name": "name",
          "ColumnType": "label"
        }
      ]
    }
  }
}


export default {
  name: "BaseViewContainer",
  components: {BaseViewRouter},
  meta() {
    return {
      // this accesses the "title" property in your Vue "data";
      // whenever "title" prop changes, your meta will automatically update
      title: ('[' + this.$route.params.baseName + "] " + this.$route.params.itemName) + " - " + this.$route.params.workspaceName
    }
  },

  methods: {
    saveItemPermissions() {
      const that = this;
      this.showBaseConfigurationModel = false;
      console.log("save config", this.itemConfiguration);
      if (this.itemConfiguration.allowGuests) {
        that.updateRow({
          tableName: "document",
          id: this.itemBeingEdited.reference_id,
          permission: 2097059
        }).then(function (res) {
          that.$q.notify({
            message: "Updated permission for document"
          })
        }).catch(function (res) {
          that.$q.notify({
            message: "Failed to update document permission: " + JSON.stringify(res.data)
          });
          this.showBaseConfigurationModel = true;
        })
      } else {
        that.updateRow({
          tableName: "document",
          id: this.itemBeingEdited.reference_id,
          permission: 2097025
        }).then(function (res) {
          that.$q.notify({
            message: "Updated permission for document"
          })
        }).catch(function (res) {
          that.$q.notify({
            message: "Failed to update document permission: " + JSON.stringify(res.data)
          });
          this.showBaseConfigurationModel = true;
        })
      }
    },
    configureBaseItem(item) {
      this.itemBeingEdited = item;
      this.showBaseConfigurationModel = true;
      this.itemConfiguration = {
        permission: item.permission,
        allowGuests: false,
        document_name: item.document_name,
        usersWithWriteAccess: [],
        showOnFrontpage: false,
      };
    },
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
        delete that.baseItemMap[that.itemBeingEdited.document_name];
        var indexToDelete = -1;
        for (var i = 0; i < that.baseConfig.items.length; i++) {
          if (that.baseConfig.items[i].document_name === that.itemBeingEdited.document_name) {
            indexToDelete = i;
            break
          }

        }
        console.log("Item to remove from base config", indexToDelete)
        if (indexToDelete > -1) {
          var item = that.baseConfig.items[indexToDelete]
          if (item.type === "table") {
            console.log("target table details,", item);
            that.deleteTableByName(item.targetTable.TableName)
          }
          that.baseConfig.items.splice(indexToDelete, 1);
        }
      })
    },
    renameBaseItem(item) {
      const that = this;
      console.log("Rename base item", this.itemBeingEdited);
      if (this.showRenameBaseViewModel !== true) {
        this.itemBeingEdited = item;
        this.newName = this.itemBeingEdited.document_name;
        this.showRenameBaseViewModel = true;
        that.$nextTick().then(function () {
          // document.getElementById("newBaseNameField").focus();
          // document.getElementById("newBaseNameField").
        })
        return
      }
      console.log("Updated name", this.newName)
      if (this.newName !== this.itemBeingEdited.document_name) {
        console.log("Update item");
        const originalTitle = this.itemBeingEdited.document_name;
        this.itemBeingEdited.document_name = this.newName;
        that.updateRow({
          tableName: "document",
          id: that.itemBeingEdited.reference_id,
          document_name: that.newName,
        }).then(function (res) {
          console.log("Updated item name", res);
          that.baseItemMap[that.newName] = that.baseItemMap[originalTitle];
          // that.$refs.viewRouter.reloadBaseItem()
          delete that.baseItemMap[originalTitle];
          if (originalTitle === that.selectedItem) {
            that.$router.push('/workspace/' + that.workspaceName + "/" + that.baseName + "/" + that.newName)
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
      let newItemLabel = "New " + item.type + " - " + Math.floor(Math.random() * 90 + 10);
      let newItem = {
        type: item.type,
        label: newItemLabel
      };
      if (DEFAULT_ITEM_MAP[item.type]) {
        newItem = DEFAULT_ITEM_MAP[item.type]
        newItem.document_extension = item.type;
        newItem.document_name = newItemLabel;
      }


      var newRow = null;

      newRow = {
        document_name: newItemLabel,
        tableName: "document",
        document_extension: item.type,
        mime_type: 'workspace/' + item.type,
        document_path: "/" + that.workspaceName + "/" + that.baseName,
        document_content: [{
          name: item.type + "-" + uuidv4() + ".json",
          type: "workspace/" + item.type,
          path: "/" + that.workspaceName + "/" + that.baseName,
          contents: "workspace/" + item.type + "," + btoa(JSON.stringify(newItem))
        }],
      }


      console.log("Create base request", newRow)

      that.createRow(newRow).then(function (res) {
        console.log("New workspace item created", res)
        newItem.reference_id = res.data.reference_id;
        var finalNewItem = {...newItem, ...res.data}
        that.baseConfig.items.push(finalNewItem);
        that.baseItemMap[newItem.label] = finalNewItem;

        that.ensureBaseTables();

        that.selectedBaseItem = finalNewItem;
        that.$nextTick().then(function () {
          that.$refs.viewRouter.reloadBaseItem()
          that.renameBaseItem(finalNewItem);
        })
      }).catch(function (err) {
        console.log("Failed to create new item", err)
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
      that.loadData({
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
        if (that.baseConfig.items) {


          for (var i = 0; i < that.baseConfig.items.length; i++) {
            var item = that.baseConfig.items[i];
            if (item.type === "table") {
              console.log("target table details,", item);
              that.deleteTableByName(item.targetTable.TableName)
            }
          }
        }
        Promise.all(promises).then(function (res) {
          console.log("All child item deleted", res, "delete base", that.baseRow);
          that.deleteRow({
            tableName: "document",
            reference_id: that.baseRow.id,
          }).then(function (res) {
            console.log("Base deleted");
            that.$router.push('/workspace/' + that.workspaceName)
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
    ...mapActions(['loadData', 'getTableSchema', 'updateRow', 'createRow', 'deleteRow', 'executeAction', 'loadModel', 'deleteTableByName']),
    refreshBaseData() {
      const that = this;
      that.baseItemMap = {};

      return new Promise(function (resolve, reject) {


        const workspaceName = that.$route.params.workspaceName;
        const baseName = that.$route.params.baseName;
        that.selectedItem = that.$route.params.itemName;
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
        console.log("Query base content document")

        that.loadData(queryPayload).then(function (res) {
          console.log("loaded base document", res)
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
            console.log("loaded base item documents", res);
            for (var i = 0; i < res.data.length; i++) {
              try {
                var item = res.data[i];
                var itemConfig = JSON.parse(atob(item.document_content[0].contents))
                item = {...item, ...itemConfig}
                that.baseItemMap[item.document_name] = item;
                that.baseConfig.items.push(item);
              } catch (e) {
                console.log("failed to parse item data", e)
              }
            }
            that.selectedBaseItem = that.baseItemMap[that.selectedItem];
            that.ensureBaseTables().then(function () {
              resolve()
            }).catch(reject)
          });
        })


      })


    },
    ensureBaseTables() {
      const that = this;
      console.log("Ensure base tables", this.baseConfig)

      var promises = [];
      var updateSchema = {
        Tables: [],
      };


      for (let i = 0; i < that.baseConfig.items.length; i++) {
        const baseItem = that.baseConfig.items[i];
        if (baseItem.type === "table") {
          console.log("Table item", baseItem, baseItem.targetTable);
          var targetTable = baseItem.targetTable;
          if (!targetTable) {
            var targetTableConfig = baseItem.attributes;
            if (!targetTableConfig) {
              console.log("No columns defined for table: ", baseItem)
              targetTableConfig = {
                Columns: []
              }
            }
            targetTableConfig.TableName = "tab_" + makeid(7)

            for (let j = 0; j < targetTableConfig.Columns.length; j++) {
              const column = targetTableConfig.Columns[j];
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

            console.log("No target table exists for this item, creating one", baseItem.document_name, targetTableConfig.TableName);
            updateSchema.Tables.push(targetTableConfig);
            baseItem.targetTable = targetTableConfig;

            that.baseItemMap[baseItem.document_name].document_content[0].contents = btoa(JSON.stringify(baseItem))
            console.log("Update base request", that.baseItemMap[baseItem.document_name])
            that.baseItemMap[baseItem.document_name].tableName = "document";
            promises.push(that.updateRow(that.baseItemMap[baseItem.document_name]))
          }
        }
      }

      return new Promise(function (resolve, reject) {
        Promise.all(promises).then(function () {
          if (updateSchema.Tables.length > 0) {
            that.$q.loadingBar.start();

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
              that.$q.loadingBar.stop();
              console.log("Tables created", res);
              that.$q.notify({
                message: "Base tables created, please wait while we generate random data to begin"
              });
              // that.$nextTick().then(function () {
              //   that.$q.loadingBar.start();
              // })


              console.log("Try to create random data for the new base");
              that.$q.notify({
                message: "Generating random data for " + updateSchema.Tables.length + " tables"
              });
              that.$q.loadingBar.start();
              var randomDataPromises = []
              randomDataPromises = updateSchema.Tables.map(function (table) {
                console.log("Create random data for ", table.TableName);

                return new Promise(function (resolve, reject) {
                  var generateRandomDataAndLoad = function () {

                    setTimeout(function () {
                      that.executeAction({
                        tableName: "world",
                        actionName: "generate_random_data",
                        params: {
                          "table_name": table.TableName,
                          "count": 10,
                        }
                      }).then(function (res) {
                        console.log("Generate random data response", res)
                        if (!res || res === "") {
                          console.log("data generate failed, try again", res)
                          that.$q.loadingBar.increment(5);
                          generateRandomDataAndLoad()
                          return
                        }
                        that.$q.loadingBar.increment(5);
                        console.log("Random data generated for table", table.TableName)
                        resolve();

                      }).catch(function (err) {
                        generateRandomDataAndLoad()
                        console.log("Failed to generate random data for ", table.TableName, err)
                      })
                    }, 5000)


                  }
                  generateRandomDataAndLoad()

                })


              })
              Promise.all(randomDataPromises).then(function () {
                that.$q.loadingBar.stop();
                resolve()
              }).catch(function (err) {
                console.log("Failed to create random data", err)
              })


            }).catch(function (err) {
              console.log("Failed to create table", err)
              that.$q.notify({
                message: "Failed to create tables for the base"
              });
              reject()
            })


          } else {
            resolve();
          }
        })
      })


    },
    refreshData() {
      const that = this;
      that.newRowData = [];
      that.sourceMap = {};
      console.log("Refresh data, update the selected item", that.selectedItem, that.baseItemMap);
      console.log("Updated base ", that.selectedItem, that.baseName, that.selectedBaseItem);

      that.selectedItem = that.$route.params.itemName;
      that.baseName = that.$route.params.baseName;
      that.selectedBaseItem = that.baseItemMap[that.selectedItem]
      that.baseLoaded = true;
      return Promise.resolve();

    },
  },
  props: ["baseConfiguration"],
  data() {
    return {
      showBaseConfigurationModel: false,
      baseItemMap: {},
      itemConfiguration: {},
      showRenameBaseViewModel: false,
      showDeleteConfirmDialog: false,
      itemBeingEdited: null,
      newName: null,
      baseLoaded: false,
      dataUploadFile: null,
      selectedBaseItem: null,
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
    ...mapGetters(['endpoint', 'authToken', 'tables', 'baseItemTypes'])
  },
  updated() {
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
      console.log("base name changed", arguments)
      this.refreshData();
    },
    '$route.params.itemName': function () {
      const that = this;
      console.log("item name changed", arguments)
      this.refreshData();
    }
  },
}
</script>

<style scoped>

</style>
