<template>
  <q-page-container>
    <q-page>

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
    showUploadData() {

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
