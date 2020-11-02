<template>
  <q-page-container>


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


    <q-page style="padding-top: 50px">
      <q-page-sticky expand position="top-left">
        <!--        <q-bar class="bg-white">-->


        <!--          <q-btn icon="fas fa-bars" flat>-->
        <!--            <q-menu style="min-height: 150px">-->
        <!--              <q-list>-->
        <!--                <q-item clickable v-for="table in tablesFiltered" :key="table.table_name">-->
        <!--                  <q-item-section flat-->
        <!--                                  @click="$router.push('/apps/workspace/' + $route.params.workspaceName + '/' + table.table_name)"-->
        <!--                  >{{ table.table_name }}-->
        <!--                  </q-item-section>-->
        <!--                </q-item>-->
        <!--              </q-list>-->
        <!--            </q-menu>-->
        <!--          </q-btn>-->
        <!--          <q-btn id="newTableButton" icon="fas fa-plus" flat/>-->


        <!--          <q-btn size="sm" @click="showNewRowDrawer()" flat label="New row"></q-btn>-->
        <!--          <q-btn size="sm" @click="showPermissionsDrawer()" color="primary" flat label="Table Permissions"></q-btn>-->
        <!--          <q-btn size="sm" flat label="Table Options">-->
        <!--            <q-menu anchor="bottom left" self="top left">-->
        <!--              <q-item clickable>-->
        <!--                <q-item-section>-->
        <!--                  <q-checkbox size="xs" @input="refreshData()" label="Show column filters"-->
        <!--                              v-model="tabulatorOptions.headerFilter"></q-checkbox>-->
        <!--                </q-item-section>-->
        <!--              </q-item>-->
        <!--              <q-item clickable @click="refreshData()">-->
        <!--                <q-item-section>Refresh data</q-item-section>-->
        <!--              </q-item>-->
        <!--            </q-menu>-->
        <!--          </q-btn>-->

        <!--          <q-btn v-if="selectedRows.length > 0" @click="deleteSelectedRows" flat color="red" size="sm">Delete selected-->
        <!--            rows-->
        <!--          </q-btn>-->
        <!--        </q-bar>-->

        <div class="row">
          <q-bar style="height: 50px" dark>
            <q-tabs
              v-model="selectedItem"
              class="text-black"
              inline-label
            >
              <q-route-tab
                :icon="itemIconMap[item.item_type]" :key="item.label"
                v-if="item.item_type !== 'table'" v-for="item in baseConfig.items"
                :to="'/apps/workspace/' + workspaceName + '/' + baseName + '/' + item.label" exact replace
                :label="item.label"/>


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
      </q-page-sticky>


      <base-view-router v-if="selectedBaseItem" :baseItem="selectedBaseItem"></base-view-router>


    </q-page>

    <!--    <q-page-sticky v-if="!newRowDrawer" position="bottom-right" :offset="[20, 20]">-->
    <!--      <q-fab vertical-actions-align="right" color="primary" icon="keyboard_arrow_up" direction="up">-->
    <!--        <q-fab-action color="orange" @click="downloadData('xls')" label="Download XLS" icon="fas fa-file-excel">-->
    <!--        </q-fab-action>-->
    <!--        <q-fab-action color="orange" @click="downloadData('csv')" label="Download CSV" icon="fas fa-download">-->
    <!--        </q-fab-action>-->
    <!--        <q-fab-action color="orange" @click="$refs.fileUpload.pickFiles()" label="Upload CSV/XLS"-->
    <!--                      icon="fas fa-upload">-->
    <!--          <q-file v-model="dataUploadFile" ref="fileUpload" @input="uploadFileSelected"-->
    <!--                  style="display: none"></q-file>-->
    <!--        </q-fab-action>-->
    <!--      </q-fab>-->
    <!--    </q-page-sticky>-->


    <q-drawer
      side="right"
      v-model="newRowDrawer"
      bordered
      :width="500"
      :breakpoint="500"
      content-class="bg-grey-3"
    >
      <q-scroll-area class="fit">
        <div class="q-pa-md">
          <span class="text-h6">New {{ $route.params.tableName }}</span>
          <q-form class="q-gutter-md q-pa-md">

            <div v-for="column in newRowData">
              <q-input
                :label="column.meta.ColumnName"
                v-if="['label', 'measurement', 'value', 'email'].indexOf(column.meta.ColumnType) > -1"
                filled
                v-model="column.value"
              />

              <q-file
                filled bottom-slots v-model="column.value" :label="column.meta.ColumnName"
                v-if="column.meta.ColumnType.startsWith('file.')"
                counter>
                <template v-slot:prepend>
                  <q-icon name="cloud_upload" @click.stop/>
                </template>
                <template v-slot:append>
                  <q-icon name="close" @click.stop="column.value = null" class="cursor-pointer"/>
                </template>
              </q-file>


              <q-input
                :label="column.meta.ColumnName"
                type="password"
                v-if="['password'].indexOf(column.meta.ColumnType) > -1"
                filled
                v-model="column.value"
              />

              <q-toggle
                :label="column.meta.ColumnName"
                class="text-right"
                v-if="column.meta.ColumnType === 'truefalse'"
                v-model="column.value"
              />

              <span v-if="['content', 'json'].indexOf(column.meta.ColumnType) > -1 ">{{ column.meta.ColumnName }}</span>
              <q-editor
                :toolbar="[
        ['viewsource']
      ]"
                :label="column.meta.ColumnName"
                v-if="['content', 'json'].indexOf(column.meta.ColumnType) > -1 "
                v-model="column.value"
              />

              <q-date
                v-if="['datetime'].indexOf(column.meta.ColumnType) > -1 "
                :subtitle="column.meta.ColumnName"
                v-model="column.value"
              />

            </div>


            <div>
              <q-btn label="Save" class="float-right" @click="onNewRow" color="primary"/>
              <q-btn label="Cancel" @click="onCancelNewRow" color="primary" flat class="q-ml-sm"/>
            </div>
          </q-form>

        </div>

      </q-scroll-area>
    </q-drawer>

    <q-drawer overlay side="right" v-model="tablePermissionDrawer" bordered :width="400" :breakpoint="1400"
              content-class="bg-grey-3">
      <q-scroll-area class="fit row" v-if="!newRowDrawer">

        <table-permissions @close="tablePermissionDrawer = false" v-if="tableData"
                           v-bind:selectedItem="tableData"/>

      </q-scroll-area>
    </q-drawer>

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
/*@import "~tabulator-tables/dist/css/tabulator.min.css";*/
@import "~tabulator-tables/dist/css/tabulator_simple.min.css";

.tabulator-col-title input {
  margin-left: 9px;
}


#newTableButton i {
  border: 1px solid #DDDBDA;
  font-size: 14px;
  color: #5034A4;
  border-radius: 4px;
}


/*#newTableButton i {*/
/*  border: 1px solid #DDDBDA;*/
/*  font-size: 13px;*/
/*  color: #5034A4;*/
/*  border-radius: 2px;*/
/*}*/


.tabulator-row.tabulator-selectable:hover {
  cursor: default;
}

.tabulator .tabulator-header {
}

.tabulator .tabulator-header .tabulator-col {
  background: #FAFAF9;
  border-right: none;
  height: 32px;

}

.tabulator .tabulator-header .tabulator-col .tabulator-col-content .tabulator-col-title {
  font-weight: 700;
  padding-top: 4px;
  padding-left: 3px;
}

div.tabulator-tableHolder div.tabulator-table div.tabulator-row.tabulator-selectable.tabulator-row-even div.tabulator-cell input {
  border: 1px solid red;
  border-radius: 4px;
}

.tabulator-row .tabulator-cell {
  font-size: 13px;
  height: 127px;
  line-height: 20px;
  border-right: none;
  padding: 7px;
}

.tabulator-row.tabulator-selectable:hover {

}

.tabulator-header-menu-button {
  float: right;
}

.tabulator-row.tabulator-selectable:hover {
  background: #FFF8E8;
}


</style>

<script>
import {mapActions, mapGetters} from 'vuex';

import XLSX from 'xlsx';
import Tabulator from 'tabulator-tables';
import BaseViewRouter from "pages/UserApps/BaseViewRouter";

window.XLSX = XLSX;
const assetEndpoint = window.location.hostname === "site.daptin.com" && window.location.port === "8080" ? "http://localhost:" + window.location.port : window.location.protocol + "//" + window.location.hostname + (window.location.port === "80" ? "" : ':' + window.location.port);


Tabulator.prototype.extendModule("format", "formatters", {
  image: function (cell, formatterParams) {
    console.log("format image cell", cell);
    var column = cell._cell.column;
    var row = cell._cell.row;
    if (!row.data[column.field] || row.data[column.field].length < 1) {
      return "null"
    }
    var field = row.data[column.field][0];

    console.log("Image data", field);
    return "<img style='width: 300px; height: 200px' class='fileicon' src='data:" + field.type + ";base64," + field.contents + "'/>";
  },
  audio: function (cell, formatterParams) {
    console.log("format audio cell", cell);
    var column = cell._cell.column;
    var row = cell._cell.row;
    if (!row.data[column.field] || row.data[column.field].length < 1) {
      return "null"
    }
    var field = row.data[column.field][0];
    return "<audio controls class='audio' src='data:" + field.type + ";base64," + field.contents + "'/>";
  },
  video: function (cell, formatterParams) {
    console.log("format video cell", cell);
    var column = cell._cell.column;
    var row = cell._cell.row;
    if (!row.data[column.field] || row.data[column.field].length < 1) {
      return "null"
    }
    var field = row.data[column.field][0];
    return "<video controls style='width: 300px; height: 200px' class='video' src='data:" + field.type + ";base64," + field.contents + "'/>";
  },
  file: function (cell, formatterParams) {
    console.log("format video cell", cell);
    var column = cell._cell.column;
    var row = cell._cell.row;
    if (!row.data[column.field] || row.data[column.field].length < 1) {
      return "null"
    }
    var field = row.data[column.field][0];
    return "<a href='" + assetEndpoint + "/asset/" + row.data.__type + "/" + row.data.reference_id + "/" + column.field + ".'" + field.type.split("/")[1] + "></a>";
  },
});


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
        item_type: item.type
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
        // var updateSchema = {
        //   Tables: [],
        // };
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
                // var targetTableConfig = itemConfig.attributes;
                // targetTableConfig.TableName = "tab-" + makeid(7)
                // updateSchema.Tables.push(targetTableConfig)
                // itemConfig.targetTable = targetTableConfig;
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
      // console.log("Refresh data for ", that.baseName, that.selectedItem, that.selectedBaseItem)

      //
      // for (var i = 0; i < that.baseConfig.items.length; i++) {
      //   if (that.baseConfig.items[i].item_type === "table") {
      //     console.log("Table", that.baseConfig.items[i])
      //     that.sourceMap[that.baseConfig.items[i].label] = that.baseConfig.items[i]
      //   }
      // }
      // for (var i = 0; i < that.baseConfig.items.length; i++) {
      //   const baseItem = that.baseConfig.items[i];
      //   if (baseItem.item_type === "view" && baseItem.label === that.selectedItem) {
      //     console.log("load table for view type", baseItem.attributes.TableName);
      //     var source = that.sourceMap[baseItem.attributes.TableName]
      //     if (!source) {
      //       alert("Table not found used in view: " + baseItem.attributes.TableName);
      //       continue
      //     }
      //     that.loadTable(source.targetTable.TableName, baseItem.label)
      //   }
      //
      // }

    },
    loadTable(tableName, targetContainerId) {
      const that = this;
      var assetColumns = [];
      console.log("Load base view", that.workspaceSchema, tableName, targetContainerId)
      that.getTableSchema(tableName).then(function (res) {
        const tableSchema = res;
        console.log("Schema", tableSchema);
        // that.loadData({tableName: tableName}).then(function (data) {
        //   console.log("Loaded data", data);
        //   that.rows = data.data;
        let columns = Object.keys(tableSchema.ColumnModel).map(function (columnName) {
          var col = tableSchema.ColumnModel[columnName];
          // console.log("Make column ", col);
          if (col.jsonApi || col.ColumnName === "__type" || that.defaultColumns.indexOf(col.ColumnName) > -1) {
            return null;
          }

          let formatter = col.ColumnType === "truefalse" ? "tickCross" : null;

          let width = 200
          if (col.ColumnType === "content" || col.ColumnType === "json") {
            formatter = "textarea"
            width = 300
          }
          if (col.ColumnType === "truefalse") {
            width = 100
          }

          var tableColumn = {
            title: col.Name,
            field: col.ColumnName,
            editor: true,
            headerFilter: that.tabulatorOptions.headerFilter,
            editable: !col.ColumnType.startsWith('file.'),
            formatter: formatter,
            width: width,
            hozAlign: col.ColumnType === "truefalse" ? "center" : "left",
            sorter: col.ColumnType === "measurement" ? "number" : null,
          };

          if (col.ColumnType.startsWith("file.") && col.ColumnType.indexOf('jpg') > -1) {
            tableColumn.formatter = "image";
          }
          if (col.ColumnType.startsWith("file.") && col.ColumnType.indexOf('mp4') > -1) {
            tableColumn.formatter = "video";
          }
          if (col.ColumnType.startsWith("file.") && col.ColumnType.indexOf('mp3') > -1) {
            tableColumn.formatter = "audio";
          }

          return tableColumn;
        }).filter(e => !!e);


        console.log("Table columns", columns);
        columns.unshift({
          formatter: "rowSelection",
          titleFormatter: "rowSelection",
          align: "center",
          headerSort: false
        });
        that.spreadsheet = new Tabulator("#spreadsheet", {
          data: [],
          columns: columns,
          // pagination: "remote",
          tooltips: true,
          ajaxSorting: true,
          layout: "fitDataFill",
          ajaxFiltering: true,
          paginationSizeSelector: true,
          ajaxProgressiveLoad: "scroll",
          ajaxProgressiveLoadDelay: 200,
          ajaxProgressiveLoadScrollMargin: 600,
          index: 'reference_id',
          history: true,
          movableColumns: true,
          rowSelectionChanged: function (data, rows) {
            console.log("row selection changed", data, rows);
            //rows - array of row components for the selected rows in order of selection
            //data - array of data objects for the selected rows in order of selection
            that.selectedRows = data;
          },
          paginationSize: 100,
          cellEdited: function (cell) {
            const reference_id = cell._cell.row.data.reference_id;
            const field = cell._cell.column.field;
            const newValue = cell._cell.value;
            //cell - cell component
            console.log("cell edited", reference_id, arguments);
            const obj = {
              tableName: tableName,
              id: reference_id,
            };
            obj[field] = newValue;

            if (reference_id) {


              that.updateRow(obj).then(function () {
                that.$q.notify({
                  message: "Saved"
                });
              }).catch(function (e) {
                that.$q.notify({
                  message: "Failed to save"
                });
              });
            } else {
              that.createRow(obj).then(function () {
                that.$q.notify({
                  message: "Saved"
                });
              }).catch(function (e) {
                console.log("Failed to save", e)
                if (e[0] && e[0].title) {
                  that.$q.notify({
                    message: "Failed to save - " + e[0].title
                  });

                } else {


                  that.$q.notify({
                    message: "Failed to save"
                  });
                }
              });
            }


          },
          ajaxURL: that.endpoint + "/api/" + tableName, //set url for ajax request
          ajaxURLGenerator: function (url, config, params) {
            //url - the url from the ajaxURL property or setData function
            //config - the request config object from the ajaxConfig property
            //params - the params object from the ajaxParams property, this will also include any pagination, filter and sorting properties based on table setup

            //return request url
            console.log("Generate request url ", url, config, params);
            config.headers = {
              Authorization: "Bearer " + that.authToken
            };
            let requestUrl = that.endpoint + "/api/" + tableName + "?page[number]=" + params.page + "&" + "page[size]=" + params.size + "&";
            if (params.sorters) {
              var sorts = "";
              for (var i = 0; i < params.sorters.length; i++) {
                var sortBy = params.sorters[i];
                sorts = sorts + (sortBy.dir === "asc" ? "" : "-") + sortBy.field + ","
              }
              sorts = sorts.substring(0, sorts.length - 1);
              requestUrl = requestUrl + "sort=" + sorts + "&"
            }
            if (params.filters) {
              var queryFilters = [];
              for (var i in params.filters) {
                var filter = params.filters[i];
                switch (filter.type) {
                  case "like":
                    queryFilters.push({
                      "column": filter.field,
                      "operator": "like",
                      "value": filter.value,
                    })
                    break;
                  default:
                    queryFilters.push({
                      "column": filter.field,
                      "operator": filter.type,
                      "value": filter.value,
                    })
                }
              }
              console.log("search query", that.searchQuery)
              if (that.searchQuery && that.searchQuery !== "") {
                requestUrl = requestUrl + "filter=" + that.searchQuery + "&"
              }
              if (queryFilters && queryFilters.length > 0) {
                requestUrl = requestUrl + "query=" + JSON.stringify(queryFilters) + "&"
              }

            }
            if (assetColumns.length > 0) {
              requestUrl = requestUrl + "included_relations=" + assetColumns.join(",") + "&"
            }
            console.log("Request url ", requestUrl);
            return requestUrl; //encode parameters as a json object
          },

          rowUpdated: function (row) {
            console.log("Row edited", row);
            //row - row component
          },
          ajaxResponse: function (url, params, response) {
            console.log("ajax call complete", url, params, response);
            //url - the URL of the request
            //params - the parameters passed with the request
            //response - the JSON object returned in the body of the response.

            return {
              last_page: response.links.last_page,
              data: response.data.map(function (e) {
                return e.attributes
              })
            }; //return the response data to tabulator
          },
        });

        document.getElementById("spreadsheet").ondblclick = function () {
          console.log("add");
          that.spreadsheet.addRow({})
        }
        // })
      });

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
    // this.loadTables();
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
      this.refreshData();
    },
    '$route.params.itemName': function () {
      // this.refreshData();
    }
  },
}
</script>

<style scoped>

</style>
