<template>
  <q-page-container style="padding-top: 0; background: rgb(242, 241, 249)">

    <q-page style="overflow: hidden">

      <div class="row" style="">
        <q-bar style="padding-left: 0; width: 100% ; background: white">


          <q-btn size="sm" @click="showNewRowDrawer()" flat label="New row"></q-btn>
          <q-btn size="sm" @click="showPermissionsDrawer()" color="primary" flat label="Table Permissions"></q-btn>
          <q-btn size="sm" flat label="Table Options">
            <q-menu anchor="bottom left" self="top left">
              <q-item clickable>
                <q-item-section>
                  <q-checkbox size="xs" @input="refreshData()" label="Show column filters"
                              v-model="tabulatorOptions.headerFilter"></q-checkbox>
                </q-item-section>
              </q-item>
              <q-item clickable @click="refreshData()">
                <q-item-section>Refresh data</q-item-section>
              </q-item>
            </q-menu>
          </q-btn>

          <q-btn v-if="selectedRows.length > 0" @click="deleteSelectedRows" flat color="red" size="sm">Delete selected
            rows
          </q-btn>
        </q-bar>
        <q-separator></q-separator>
      </div>

      <div class="row">
        <div class="col-12" style="background: rgb(242, 241, 249)">
          <div id="spreadsheet" style="height: calc(100vh - 100px); width: 100vw; border-top: 1px solid black"></div>
        </div>
      </div>

    </q-page>

    <q-drawer
      side="right"
      v-model="newRowDrawer"
      bordered
      overlay
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
      <q-scroll-area class="fit row" v-if="tablePermissionDrawer">

        <table-permissions @close="tablePermissionDrawer = false" v-if="tableData"
                           v-bind:selectedTable="tableData"/>

      </q-scroll-area>
    </q-drawer>

    <q-dialog v-model="showAddNewColumnDialog">
      <q-card style="background: white; min-width: 400px">
        <q-card-section>
          <q-list>
            <q-item clickable @click="addNewColumn(item)" v-for="item in columnTypes" :key="item.name">
              <q-item-section avatar>
                <q-icon :name="item.icon"></q-icon>
              </q-item-section>
              <q-item-label style="text-transform: capitalize; color: rgb(80, 52, 164)">{{ item.name }}</q-item-label>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-page-container>
</template>
<style>
/*@import "~tabulator-tables/dist/css/tabulator.min.css";*/
@import "~tabulator-tables/dist/css/tabulator_simple.min.css";

.tabulator .tabulator-header .tabulator-col .tabulator-col-content .tabulator-col-sorter {
  display: none;
}

.row-selection-checkbox {

}

.tabulator-header {
  background: rgb(242, 241, 249);
}

.add-new-cell {
  background: rgb(242, 241, 249);
  width: 100%;
  height: 100%;
  border-bottom: 1px solid rgb(242, 241, 249);
}

.add-new-cell:hover {
  background: white;
  cursor: pointer;
}

.tabulator {
  background: rgb(242, 241, 249);
}

.tabulator-col-title input {
  /*margin-left: 9px;*/
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

.tabulator .tabulator-header {
  background: rgb(242, 241, 249);
}

.tabulator .tabulator-header .tabulator-col {
  background: rgb(242, 241, 249);
  height: 32px;

}

.tabulator .tabulator-header .tabulator-col .tabulator-col-content .tabulator-col-title {
  font-weight: 700;
  padding-left: 3px;
}

.tabulator-col-title input[type=checkbox] {
  margin-top: 5px;
  margin-left: 5px;
}

div.tabulator-col:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > input:nth-child(1) {
  /*display: none;*/
}

.tabulator-row .tabulator-cell {
  font-size: 12px;
  height: 127px;
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
import {mapActions, mapGetters, mapState} from 'vuex';

import XLSX from 'xlsx';

window.XLSX = XLSX;
const assetEndpoint = window.location.hostname === "site.daptin.com" && window.location.port === "8080" ? "http://localhost:" + window.location.port : window.location.protocol + "//" + window.location.hostname + (window.location.port === "80" ? "" : ':' + window.location.port);

import Tabulator from 'tabulator-tables';
import moment from 'moment';

Tabulator.prototype.extendModule("format", "formatters", {
  image: function (cell, formatterParams) {
    // console.log("format image cell", cell);
    var column = cell._cell.column;
    var row = cell._cell.row;
    if (!row.data[column.field] || row.data[column.field].length < 1) {
      return "No image uploaded"
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

Tabulator.prototype.extendModule("edit", "editors", {
  dateEditor: function (cell, onRendered, success, cancel, editorParams) {
    //cell - the cell component for the editable cell
    //onRendered - function to call when the editor has been rendered
    //success - function to call to pass the successfuly updated value to Tabulator
    //cancel - function to call to abort the edit and return to a normal cell
    //editorParams - params object passed into the editorParams column definition property

    //create and style editor
    var editor = document.createElement("input");

    editor.setAttribute("type", "date");

    //create and style input
    editor.style.padding = "3px";
    editor.style.width = "100%";
    editor.style.boxSizing = "border-box";

    //Set value of editor to the current value of the cell
    console.log("Current date value", cell.getValue())
    editor.value = moment(cell.getValue()).format("YYYY-MM-DD")
    console.log("Value set for date", editor.value);

    //set focus on the select box when the editor is selected (timeout allows for editor to be added to DOM)
    onRendered(function () {
      editor.focus();
      editor.style.css = "100%";
    });

    //when the value has been set, trigger the cell to update
    function successFunc() {
      console.log("value from update", editor.value, moment(editor.value).format())
      success(moment(editor.value).format("YYYY-MM-DD"));
    }

    editor.addEventListener("change", successFunc);
    editor.addEventListener("blur", successFunc);

    //return the editor element
    return editor;

  },
});


var headerContextMenu = [
  {
    label: "Rename Column",
    action: function (e, column) {
      console.log("Rename column", e, column)
      column.updateDefinition({editableTitle: true})
    }
  },
  {
    label: "Hide Column",
    action: function (e, column) {
      column.hide();
    }
  },
]

//Create Date Editor
var dateEditor = function (cell, onRendered, success, cancel) {
  //cell - the cell component for the editable cell
  //onRendered - function to call when the editor has been rendered
  //success - function to call to pass the successfuly updated value to Tabulator
  //cancel - function to call to abort the edit and return to a normal cell

  //create and style input
  var cellValue = moment(cell.getValue(), "DD/MM/YYYY").format("YYYY-MM-DD"),
    input = document.createElement("input");

  input.setAttribute("type", "date");

  input.style.padding = "4px";
  input.style.width = "100%";
  input.style.boxSizing = "border-box";

  input.value = cellValue;

  onRendered(function () {
    input.focus();
    input.style.height = "100%";
  });

  function onChange() {
    if (input.value != cellValue) {
      success(moment(input.value, "YYYY-MM-DD").format("DD/MM/YYYY"));
    } else {
      cancel();
    }
  }

  //submit new value on blur or change
  input.addEventListener("blur", onChange);

  //submit new value on enter
  input.addEventListener("keydown", function (e) {
    if (e.keyCode == 13) {
      onChange();
    }

    if (e.keyCode == 27) {
      cancel();
    }
  });

  return input;
};

const toSnakeCase = (str = '') => {
  const strArr = str.split(' ');
  const snakeArr = strArr.reduce((acc, val) => {
    return acc.concat(val.toLowerCase());
  }, []);
  return snakeArr.join('_');
};


export default {
  name: "EditDataTableComponent",
  props: ["baseItem"],
  // todo use the config property to show only configured columns for this view and not all columns
  methods: {
    addNewColumn(selectedColumn) {
      console.log("Add column to table", selectedColumn)
      const that = this;
      if (!selectedColumn && !that.showAddNewColumnDialog) {
        that.showAddNewColumnDialog = true;
        return
      }
      const col = selectedColumn.columnDef;
      that.showAddNewColumnDialog = false;
      var newColumnName = "new_column"
      var i = 1;
      while (Object.keys(that.tableSchema.ColumnModel).indexOf(newColumnName) > -1) {
        i = i + 1;
        newColumnName = "new_column_" + i
      }
      console.log("new column name", that.spreadsheet.getColumns());
      var columns = that.spreadsheet.getColumns();


      let formatter = col.ColumnType === "truefalse" ? "tickCross" : null;

      let width = 200
      if (col.ColumnType === "content" || col.ColumnType === "json") {
        formatter = "textarea"
        width = 300
      }
      if (col.ColumnType === "truefalse") {
        width = 100
      }


      let newColumnDefinition = {
        title: newColumnName,
        field: newColumnName,
        editor: col.ColumnType === "datetime" ? "dateEditor" : true,
        headerContextMenu: headerContextMenu,
        headerMenu: headerContextMenu,
        headerFilter: that.tabulatorOptions.headerFilter,
        editable: !col.ColumnType.startsWith('file.'),
        formatter: formatter,
        width: width,
        editableTitle: true,
        hozAlign: col.ColumnType === "truefalse" ? "center" : "left",
        sorter: col.ColumnType === "measurement" ? "number" : false,
        headerSort: false,
      };
      that.newColumnTypeToBeAdded = col;
      var promise = null;
      if (columns.length > 3) {
        var secondLastColumn = columns[columns.length - 2]
        promise = that.spreadsheet.addColumn(newColumnDefinition, false, secondLastColumn._column.field);
      } else {
        promise = that.spreadsheet.addColumn(newColumnDefinition, false, "rowSelection");
      }
      promise.then(function (column) {
        console.log("Column created", document.getElementsByClassName("tabulator-title-editor"))
        document.getElementsByClassName("tabulator-title-editor")[0].focus()
        document.getElementsByClassName("tabulator-title-editor")[0].setSelectionRange(0, document.getElementsByClassName("tabulator-title-editor")[0].value.length)
      })
        .catch(function (error) {
          //handle error adding column
        });
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
          "entity_name": that.tableName,
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
        this.spreadsheet.download("csv", this.tableName + ".csv")
      } else if (format === "xls") {
        this.spreadsheet.download("xlsx", this.tableName + ".xlsx", {
          sheetName: this.tableName
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
            tableName: that.tableName,
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
      obj['tableName'] = that.tableName;

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
    ...mapActions(['loadData', 'getTableSchema', 'loadModel', 'updateRow', 'createRow', 'deleteRow', 'executeAction']),
    refreshData() {
      const that = this;
      var assetColumns = [];
      that.newRowData = [];
      var tableName = this.tableName;
      console.log("loaded data editor", tableName);
      if (!tableName) {
        return
      }


      that.getTableSchema(tableName).then(function (res) {
        that.tableSchema = res;
        console.log("Schema", that.tableSchema);
        // that.loadData({tableName: tableName}).then(function (data) {
        //   console.log("Loaded data", data);
        //   that.rows = data.data;
        let columns = Object.keys(that.tableSchema.ColumnModel).map(function (columnName) {
          var col = that.tableSchema.ColumnModel[columnName];
          // console.log("Make column ", col);

          if (col.jsonApi || col.ColumnName === "__type" || that.defaultColumns.indexOf(col.ColumnName) > -1) {
            return null;
          }
          if (col.ColumnType.startsWith('file.')) {
            assetColumns.push(col.ColumnName)
            that.newRowData.push({
                meta: col,
                value: []
              }
            );
          } else if (col.ColumnType === 'truefalse') {
            that.newRowData.push({
                meta: col,
                value: false
              }
            );
          } else {
            that.newRowData.push({
                meta: col,
                value: ""
              }
            );
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
            editor: col.ColumnType === "datetime" ? "dateEditor" : true,
            headerContextMenu: headerContextMenu,
            headerFilter: that.tabulatorOptions.headerFilter,
            editable: !col.ColumnType.startsWith('file.'),
            formatter: formatter,
            width: width,
            hozAlign: col.ColumnType === "truefalse" ? "center" : "left",
            sorter: col.ColumnType === "measurement" ? "number" : false,
            headerSort: false,
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
          cssClass: "row-selection-checkbox",
          titleFormatter: "rowSelection",
          title: "rowSelection",
          hozAlign: "center",
          vertAlign: "middle",
          headerSort: false
        });

        columns.push({
          formatter: function (cell, formatterParams, onRendered) {
            return "<div class='add-new-container'></div>"; //return the contents of the cell;
          },
          titleFormatter: function (cell, formatterParams, onRendered) {
            return "<i class='fas fa-plus'>"; //return the contents of the cell;
          },
          title: "addnewcolumn",
          cssClass: "add-new-cell",
          width: 200,
          headerHozAlign: "center",
          print: false,
          clipboard: false,
          headerClick: function (e, column) {
            console.log("Add new cell header click")
            that.addNewColumn();
          },
          cellClick: function (e, cell) {
            console.log("Add new cell row click")
            that.addNewColumn();
          },
          headerSort: false
        });


        that.spreadsheet = new Tabulator("#spreadsheet", {
          data: [],
          columns: columns,
          // pagination: "remote",
          tooltips: true,
          ajaxSorting: true,
          columnTitleChanged: function (columnComponent) {
            console.log("Title updated for column", columnComponent, that.newColumnTypeToBeAdded);
            var column = columnComponent._column;
            var columnDefinition = column.definition;

            var columnTitle = columnDefinition.title;
            var columnField = toSnakeCase(columnTitle);


            if (columnField !== columnDefinition.field && Object.keys(that.tableSchema.ColumnModel).indexOf(columnField) > -1) {
              that.$q.notify({
                message: "Column title is clashing with another column: " + columnField
              });
              return
            }


            if (columnDefinition.field === "new_column") {


              var newColumn = that.newColumnTypeToBeAdded;
              newColumn.Name = columnTitle;
              newColumn.ColumnName = columnField;
              newColumn.IsNullable = true;
              console.log("New column added to the table", newColumn);


              that.executeAction({
                tableName: "world",
                actionName: "upload_system_schema",
                params: {
                  schema_file: [{
                    contents: "application/json," + btoa(JSON.stringify({
                      Tables: [{
                        TableName: that.tableName,
                        Columns: [newColumn]
                      }]
                    })),
                    name: "add_column_" + columnField + ".json",
                  }]
                }
              }).then(function (res) {
                columnComponent.updateDefinition({field: columnField})
                that.$q.notify({
                  message: "Column " + columnTitle + " created"
                });
                setTimeout(function () {
                  console.log("Reload model for ", that.tableName)
                  that.loadModel(that.tableName, true).then(function () {
                    console.log("Model refreshed, reload data", that.tableName)
                    that.spreadsheet.getData()
                  })
                }, 6000)
              })
            } else {
              // TODO
              console.log("Existing column rename")
            }

            columnComponent.updateDefinition({editableTitle: false})
          },
          layout: "fitData",
          ajaxFiltering: true,
          paginationSizeSelector: true,
          ajaxProgressiveLoad: "scroll",
          ajaxProgressiveLoadDelay: 200,
          ajaxProgressiveLoadScrollMargin: 600,
          index: "reference_id",
          history: true,
          movableColumns: true,
          rowSelectionChanged: function (data, rows) {
            console.log("row selection changed", data, rows);
            that.selectedRows = data;
          },
          paginationSize: 10,
          cellEdited: function (cell) {
            const reference_id = cell._cell.row.data.reference_id;
            const field = cell._cell.column.field;
            const newValue = cell._cell.value;
            //cell - cell component
            // console.log("cell edited", reference_id, arguments);
            var obj = {
              tableName: that.tableName,
              id: reference_id,
            };
            obj[field] = newValue;
            if (reference_id) {
              that.updateRow(obj).then(function () {
                that.$q.notify({
                  message: "Saved"
                });
              }).catch(function (e) {
                console.log("Failed to save", e)
                that.$q.notify({
                  message: "Failed to save"
                });
                that.spreadsheet.undo();
              });
            } else {
              obj = cell._cell.row.data;
              // console.log("Create new row with data", obj, Object.values(obj));
              if (Object.values(obj).filter(e => !!e && e !== "").length === 1) {
                that.spreadsheet.addData([{}])
              }
              obj["tableName"] = that.tableName;
              that.createRow(obj).then(function () {
                that.$q.notify({
                  message: "Saved"
                });
              }).catch(function (e) {
                console.log("Failed to save", e)
                that.$q.notify({
                  message: "Failed to save"
                });
                // that.spreadsheet.undo();
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

            let responseList = response.data.map(function (e) {
              return e.attributes
            });
            responseList.push({})
            return {
              last_page: response.links.last_page,
              data: responseList
            }; //return the response data to tabulator
          },
        });
      });

      that.loadData({
        tableName: 'world',
        params: {
          query: JSON.stringify([
            {
              column: 'table_name',
              operator: 'is',
              value: tableName
            }
          ]),
          included_relations: 'user_account',
        }
      }).then(function (res) {
        console.log("Table row", res, arguments);
        if (!res.data || res.data.length !== 1) {
          that.$q.notify({
            message: "Failed to load table metadata"
          });
          return;
        }
        that.tableData = res.data[0];
      }).catch(function (err) {
        console.log("Failed to load table metadata", err);
        that.$q.notify({
          message: "Failed to load table metadata"
        });
      });

    }
  },
  data() {
    return {
      newColumnTypeToBeAdded: null,
      columnTypes: [
        {
          name: "label",
          icon: "fas fa-tag",
          columnDef: {
            ColumnName: "label",
            ColumnType: "label",
            DataType: "varchar(500)",
            IsIndexed: true
          }
        },
        {
          name: "small text",
          icon: "fas fa-grip-lines",
          columnDef: {
            ColumnName: "label",
            ColumnType: "label",
            DataType: "varchar(2000)",
          }
        },
        {
          name: "rich text",
          icon: "fas fa-align-justify",
          columnDef: {
            ColumnName: "text",
            ColumnType: "content",
            DataType: "text",
          }
        },
        {
          name: "number",
          icon: "fas fa-sort-numeric-down",
          columnDef: {
            ColumnName: "number",
            ColumnType: "measurement",
            DataType: "int(11)",
          }
        },
        {
          name: "date",
          icon: "fas fa-calendar-alt",
          columnDef: {
            ColumnName: "date",
            ColumnType: "datetime",
            DataType: "timestamp",
          }
        },
        {
          name: "checkbox",
          icon: "fas fa-check-square",
          columnDef: {
            ColumnName: "checkbox",
            ColumnType: "truefalse",
            DataType: "int(1)",
            DefaultValue: '0'
          }
        },
        {
          name: "file",
          icon: "fas fa-file",
          columnDef: {
            ColumnName: "file",
            ColumnType: "file.*",
            DataType: "blob",
          }
        },
      ],
      dataUploadFile: null,
      showAddNewColumnDialog: false,
      searchQuery: null,
      tableName: null,
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
    this.tableName = this.baseItem.targetTable.TableName
    this.refreshData();
  },
  watch: {
    'baseItem': function () {
      this.tableName = this.baseItem.targetTable.TableName
      this.refreshData();
    }
  },
}
</script>

<style scoped>

</style>
