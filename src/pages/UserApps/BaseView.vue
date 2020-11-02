<template>
  <q-page-container>
    <q-page>

      <div expand position="top-left">

        <div class="row">
          <q-bar style="height: 50px" dark>
            <q-tabs
              class="text-black"
              inline-label
            >
              <q-route-tab
                :icon="itemIconMap[item.item_type]" :key="item.label"
                v-if="item.item_type !== 'table'" v-for="item in baseConfig.items"
                :to="'/apps/workspace/' + workspaceName + '/' + baseName + '/' + item.label" exact replace
                :label="item.label + ' - ' + item.item_type"/>


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

      <base-view-router v-if="selectedBaseItem" :base-config="baseConfig"
                        :baseItem="selectedBaseItem"></base-view-router>


      <user-header-bar @delete-base="deleteBase" style="border-bottom: 1px solid black" @search="searchDocuments"
                       :buttons="{
        before: [
            {icon: 'fas fa-search', event: 'search'},
          ],
        after: [
            {icon: 'fas fa-sync-alt', event: 'search'},
            {icon: 'fas fa-trash', event: 'delete-base'},
          ],
        }" :onBack="() => {$router.push('/apps/workspace/' + $route.params.workspaceName)}"
                       :title='"[Workspace] " + $route.params.workspaceName
                     + "&nbsp;&nbsp; › &nbsp;&nbsp;" + ($route.params.baseName)
                     + "&nbsp;&nbsp; › &nbsp;&nbsp;" + ($route.params.itemName)'
      ></user-header-bar>

    </q-page>


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


  </q-page-container>
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
    addBaseItem(item) {
      const that = this;
      console.log("Add new item to base", item);
      that.baseConfig.items.push({
        item_type: item.type,
        label: "New " + item.type
      })

    },
    deleteBaseConfirm() {
      // todo: more things need to be deleted here - tables, documents and other attachments
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
        for (var i = 0; i < that.baseConfig.items; i++) {
          var item = that.baseConfig.items[i];
          if (item.item_type === "table") {
            promises.push(that.executeActions({
              tableName: "world",
              actionName: ""
            }))
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
      this.searchQuery = searchQuery;
      this.spreadsheet.setData();
    },
    uploadFileSelected(file) {
      const that = this;
      console.log("file selected", file, file.name)
      that.$q.loading.show();
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".csv") && !file.name.endsWith(".xls")) {
        that.$q.notify({
          message: "Only XLSX/XLS or CSV files can be uploaded"
        });
        return

      }

      var promise = (function (file) {
        console.log("File to read", file);
        return new Promise(function (resolve, reject) {
          const name = file.name;
          const type = file.type;
          const reader = new FileReader();
          reader.onload = function (fileResult) {
            console.log("File loaded", fileResult);
            resolve({
              name: name,
              file: fileResult.target.result,
              type: type
            });
          };
          reader.onerror = function () {
            console.log("Failed to load file onerror", e, arguments);
            reject(name);
          };
          reader.readAsDataURL(file);
        })
      })(file)

      promise.then(function (res) {
        console.log("File read complete", res);
        var uploadObject = {
          "entity_name": that.$route.params.tableName,
        }
        var actionName = "upload_csv_to_system_schema"
        var onTable = "world";
        if (res.name.endsWith("xlsx") || res.name.endsWith("xls")) {
          actionName = "upload_xls_to_system_schema"
          uploadObject["data_xls_file"] = [res]
        } else if (res.name.endsWith("csv")) {
          uploadObject["data_csv_file"] = [res]
        }

        that.executeAction({
          tableName: "world",
          actionName: actionName,
          params: uploadObject
        }).then(function (e) {
          that.$q.loading.hide();
          console.log("File uploaded", e);
          that.$q.notify("Created table, updating schema");
          setTimeout(function () {
            that.refreshData();
          }, 1000)
        }).catch(function (e) {
          that.$q.loading.hide();
          that.$q.notify("Failed to upload file " + JSON.stringify(e));
        });


      }).catch(function (err) {
        that.$q.notify({
          title: "Failed to upload file",
          message: JSON.stringify(err)
        })
      })


    },
    showUploadData() {

    },
    downloadData(format) {
      if (format === "csv") {
        this.spreadsheet.download("csv", this.$route.params.tableName + ".csv")
      } else if (format === "xls") {
        this.spreadsheet.download("xlsx", this.$route.params.tableName + ".xlsx", {
          sheetName: this.$route.params.tableName
        });
      }
    },
    showPermissionsDrawer() {
      this.newRowDrawer = false;
      this.tablePermissionDrawer = true;
    },
    showNewRowDrawer() {
      this.tablePermissionDrawer = false;
      this.newRowDrawer = true;
    },
    deleteSelectedRows() {
      const that = this;
      if (this.selectedRows.length === 0) {
        this.$q.notify({
          message: "Select rows to delete"
        });
      } else {
        Promise.all(this.selectedRows.map(function (row) {
          return that.deleteRow({
            tableName: that.$route.params.tableName,
            reference_id: row.reference_id
          })
        })).then(function () {
          that.spreadsheet.setData();
        }).catch(function (e) {
          that.$q.notify({
            message: e[0].title
          });
          that.spreadsheet.setData();
        })
      }
    },
    onNewRow() {
      const that = this;
      const obj = {};
      const promises = [];
      that.newRowData.map(function (e) {
        if (!e.meta.ColumnType.startsWith('file.')) {
          obj[e.meta.ColumnName] = e.value;
        } else {

          obj[e.meta.ColumnName] = [];
          // for (let i = 0; i < e.value.length; i++) {
          console.log("Create promise for file", e.value);
          if (e.value instanceof Array) {
            for (var i in e.value) {
              var selectedFile = e.value[i];
              promises.push((function (file) {
                console.log("File to read", file);
                return new Promise(function (resolve, reject) {
                  const name = file.name;
                  const type = file.type;
                  const reader = new FileReader();
                  reader.onload = function (fileResult) {
                    console.log("File loaded", fileResult);
                    obj[e.meta.ColumnName].push({
                      name: name,
                      file: fileResult.target.result,
                      type: type
                    });
                    resolve();
                  };
                  reader.onerror = function () {
                    console.log("Failed to load file onerror", e, arguments);
                    reject(name);
                  };
                  reader.readAsDataURL(file);
                })
              })(selectedFile))
            }
          } else {
            promises.push((function (file) {
              console.log("File to read", file);
              return new Promise(function (resolve, reject) {
                const name = file.name;
                const type = file.type;
                const reader = new FileReader();
                reader.onload = function (fileResult) {
                  console.log("File loaded", fileResult);
                  obj[e.meta.ColumnName].push({
                    name: name,
                    file: fileResult.target.result,
                    type: type
                  });
                  resolve();
                };
                reader.onerror = function () {
                  console.log("Failed to load file onerror", e, arguments);
                  reject(name);
                };
                reader.readAsDataURL(file);
              })
            })(e.value))
          }
          console.log("Asset set set column", e)
        }
      });
      console.log("Promises list", promises);
      obj['tableName'] = that.$route.params.tableName;

      Promise.all(promises).then(function () {
        that.createRow(obj).then(function (res) {
          that.$q.notify({
            message: "Row created"
          });
          that.spreadsheet.setData();
          that.newRowData.map(function (e) {
            e.value = "";
            if (e.meta.ColumnType.startsWith('file.')) {
              e.value = []
            } else if (e.meta.ColumnType === 'truefalse') {
              e.value = false
            } else {
              e.value = ""
            }
          });
          that.newRowDrawer = false;
        }).catch(function (e) {
          console.log("Failed to save row", e)
          if (e instanceof Array || e[0]) {
            that.$q.notify({
              message: e[0].title
            })
          } else {
            if (e.title) {
              that.$q.notify({
                title: e.title,
                message: e.title
              })

            } else {


              that.$q.notify({
                message: "Failed to save row"
              })
            }
          }
        });
      }).catch(function (e) {
        console.log("Failed to upload file", e);
        that.$q.notify({
          message: "Failed to upload file: " + e[0]
        })
      })


    },
    onCancelNewRow() {
      this.newRowDrawer = false;
    },
    ...mapActions(['loadData', 'getTableSchema', 'updateRow', 'createRow', 'deleteRow', 'executeAction', 'loadTables', 'loadModel']),
    refreshBaseData() {
      const that = this;

      const workspaceName = this.$route.params.workspaceName;
      const baseName = this.$route.params.baseName;
      that.selectedItem = this.$route.params.itemName;
      that.baseName = baseName;
      that.workspaceName = workspaceName;

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

      return that.loadData(queryPayload).then(function (res) {
        console.log("base load complete", res)
        var baseRow = res.data[0];
        if (!baseRow.document_content) {
          alert("Base configuration is empty - " + baseRow)
          return
        }
        that.baseRow = baseRow
        var baseConfigString = baseRow.document_content[0].contents;
        that.baseConfig = JSON.parse(atob(baseConfigString));
        that.selectedBaseItem = that.baseConfig.items.filter(function (e) {
          return e.label === that.selectedItem
        })[0];
        console.log("selected base item", that.selectedItem, that.baseConfig, that.selectedBaseItem)
        let hasBaseConfigChanged = false;


        let queryPayload = {
          tableName: "document",
          params: {
            query: JSON.stringify([{
              column: "document_path",
              operator: "is",
              value: "/" + workspaceName + "/" + baseName
            }, {
              column: "mime_type",
              operator: "like",
              value: "workspace/"
            }]),
            page: {
              size: 100,
            },
            included_relations: "document_content"
          }
        };

        that.loadData(queryPayload).then(function (res) {
          console.log("base items", res);
        });
        return


        for (var itemIndex in that.baseConfig.items) {
          let itemConfig = that.baseConfig.items[itemIndex];
          console.log("Base item", itemConfig);
          switch (itemConfig.item_type) {
            case "summary":
              break;
            case "view":
              break;
            case "table":
              var targetTable = itemConfig.targetTable;
              if (!targetTable) {
                console.log("No target table exists for this item, creating one", itemConfig.label);

              } else {
                that.loadModel(targetTable.TableName).then(function (res) {
                  console.log("Loaded table config", res)
                }).catch(function (err) {
                  console.log("Failed to load information for table", err);
                  that.$q.notify({
                    message: "Failed to load table model for " + itemConfig.label
                  });
                })
              }
              break;
            default:
              console.log("Undefined item type", itemConfig.item_type)
          }
        }


      });


    },
    refreshData() {
      const that = this;
      that.newRowData = [];
      that.sourceMap = {};
      console.log("Selected base item", that.selectedItem, that.selectedBaseItem);
      that.selectedItem = that.$route.params.itemName;
      that.baseName = that.$route.params.baseName;
      that.selectedBaseItem = that.baseConfig.items.filter(function (e) {
        return e.label === that.selectedItem;
      })[0];


    },
  },
  props: ["baseConfiguration"],
  data() {
    return {
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
      tableMap: {},
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
    tablesFiltered() {
      const that = this;
      console.log("Get tables filtered", that.tables);
      if (that.text && that.text.length > 0) {
        return that.tables.filter(function (e) {
          return e.table_name.indexOf(that.text) > -1 && !e.is_hidden;
        })
      } else {
        return that.tables.filter(function (e) {
          return !e.is_hidden;
        });
      }
    },
    ...mapGetters(['endpoint', 'authToken', 'tables'])
  },
  mounted() {
    const that = this;
    this.refreshBaseData().then(function () {
      console.log("base load complete return");
      that.refreshData();
    });
  },
  watch: {
    'selectedItem': function (newVal) {
      const that = this;
      console.log("New tab selected", newVal)
      console.log("base load");
      that.refreshData();
    },
    '$route.params.baseName': function () {
      console.log("base name changed", arguments)
      this.refreshData();
    },
    '$route.params.itemName': function () {
      console.log("item name changed", arguments)
      this.refreshData();
    }
  },
}
</script>

<style scoped>

</style>
