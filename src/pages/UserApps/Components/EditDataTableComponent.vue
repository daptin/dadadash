<template>
  <q-page-container style="padding-top: 0; background: rgb(242, 241, 249)">
    <q-page style="overflow: hidden">

      <div v-if="decodedAuthToken" class="row" style="">
        <q-bar style="padding-left: 5px; width: 100% ; background: white">
          <q-input @keypress.enter="filterRows()" v-model="searchQuery" label="filter"></q-input>
          <span style="font-size: 12px" class="text-bold">Total {{ pagination.total }} records | Showing {{spreadsheet.getDataCount()}}</span>
          <q-btn size="sm" @click="showEditRow()" icon="fas fa-plus " flat label="New row"></q-btn>
          <q-btn size="sm" icon="fas fa-lock" @click="showPermissionsDrawer()" color="primary" flat
                 label="Table Permissions"></q-btn>
          <q-btn size="sm" icon="fas fa-sync" @click="refreshData()" flat label="Refresh data">

          </q-btn>

          <q-btn v-if="selectedRows.length > 0" @click="deleteSelectedRows" flat color="red" size="sm">Delete selected
            rows
          </q-btn>
        </q-bar>
        <q-separator></q-separator>
      </div>

      <div class="row" style="padding-right: 50px">
        <div class="col-12" style="background: rgb(242, 241, 249); ">
          <div id="spreadsheet" style="height: calc(100vh - 82px); width: 100vw; border-top: 1px solid black; "></div>
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
          <q-form class="q-gutter-md">

            <div class="q-pa-md" v-for="column in newRowData">
              <q-input
                :label="column.meta.ColumnName"
                v-if="['label', 'measurement', 'value', 'email'].indexOf(column.meta.ColumnType) > -1"
                filled
                v-model="column.value"
                :value="column.DefaultValue"
              />


              <q-select
                filled
                v-model="column.value"
                v-if="['entity'].indexOf(column.meta.ColumnType) > -1 && (column.meta.jsonApi === 'belongsTo' || column.meta.jsonApi === 'hasOne')"
                :label="column.meta.ColumnName"
                :options="column.options"
                :loading="column.loading"
                use-input
                @filter="function(x, y, z){onEntitySelectScroll(x, y, z, column)}"
              />

              <q-btn-dropdown
                v-if="['enum'].indexOf(column.meta.ColumnType) > -1"
                :label="column.value || column.meta.ColumnName">
                <q-list>
                  <q-item :key="option.value"
                          v-for="option in column.meta.Options"
                          clickable v-close-popup @click="column.value = option.Value">
                    <q-item-section>
                      <q-item-label>{{ option.Label }}</q-item-label>
                    </q-item-section>
                  </q-item>

                </q-list>
              </q-btn-dropdown>

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
              <codemirror
                :options='{
                  theme: "3024-day",
                  lineNumbers: true,
                  mode: "markdown",
                  height: "600px",
                  line: true,
                }'
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
    <input type="file" id="fileUpload" style="display: none">

  </q-page-container>
</template>
<style>
/*@import "~tabulator-tables/dist/css/tabulator.min.css";*/
@import "~tabulator-tables/dist/css/tabulator_simple.min.css";


.tabulator-menu {
  border: 2px solid #999;
  border-radius: 4px;
}

.tabulator-row.tabulator-selected {
  background-color: rgb(233, 232, 246);
}

.tabulator-row:hover .row-selection-checkbox input {
  display: block;
}

.tabulator-row .row-selection-checkbox input:checked {
  display: block;
}

.tabulator-row .row-selection-checkbox input {
  display: none;
}

.tabulator-menu .tabulator-menu-item:not(.tabulator-menu-item-disabled):hover {
  background: rgb(242, 241, 249);
}

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
  height: 150px;
  border-right: none;
  padding: 7px;
  overflow: auto;
}

.tabulator-row.tabulator-selectable:hover {

}

.tabulator-header-menu-button {
  float: right;
}

.tabulator-row.tabulator-selectable:hover {
  background: rgb(233, 232, 246);
}


</style>

<script>
import {mapActions, mapGetters} from 'vuex';

import XLSX from 'xlsx';
import Tabulator from 'tabulator-tables';
import moment from 'moment';

window.XLSX = XLSX;
window.moment = moment;
const assetEndpoint = localStorage.getItem("DAPTIN_ENDPOINT") || (window.location.hostname === "site.daptin.com" && window.location.port === "8080" ? "http://localhost:" + window.location.port : window.location.protocol + "//" + window.location.hostname + (window.location.port === "80" ? "" : ':' + window.location.port));

Tabulator.prototype.extendModule("edit", "editors",
  {
    dateEditor: function (cell, onRendered, success, cancel, editorParams) {
      //cell - the cell component for the editable cell
      //onRendered - function to call when the editor has been rendered
      //success - function to call to pass the successfully updated value to Tabulator
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
      // console.log("Current date value", cell.getValue())
      editor.value = moment(cell.getValue()).format("YYYY-MM-DD")
      // console.log("Value set for date", editor.value);

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
    mediaEditor: function (cell, onRendered, success, cancel, editorParams) {
      //cell - the cell component for the editable cell
      //onRendered - function to call when the editor has been rendered
      //success - function to call to pass the successfuly updated value to Tabulator
      //cancel - function to call to abort the edit and return to a normal cell
      //editorParams - params object passed into the editorParams column definition property
      // console.log("Render editor for media", cell, cell.getValue(), editorParams)

      const column = cell._cell.column;
      const columnName = column.field;
      var reference_id = cell._cell.row.data.reference_id;
      var classContainer = document.createElement("div")
      classContainer.append(cell)

      let fileUploadElement = document.getElementById("fileUpload");
      fileUploadElement.style.display = "none";
      fileUploadElement.onchange = function (file) {
        console.log("Upload file selected", reference_id, fileUploadElement.files, fileUploadElement.value);
        (function (file) {
          console.log("File to read", file);
          if (!file) {
            cancel();
            return
          }
          const name = file.name;
          const type = file.type;
          const reader = new FileReader();
          reader.onload = function (fileResult) {
            console.log("File loaded in media editor tabulator column", fileResult);

            var originalValue = cell.getValue()
            var newValue = [];

            if (originalValue && originalValue.length > 0) {
              originalValue.map(e => newValue.push(e))
            }
            newValue.push({
              name: name,
              contents: fileResult.target.result,
              type: type,
            })
            console.log("Callback value for column", success, columnName, originalValue)
            cell.setValue(newValue, true);
          };
          reader.onerror = function () {
            console.log("Failed to load file onerror", e, arguments);
            cancel();
          };
          reader.readAsDataURL(file);
        })(fileUploadElement.files[0])
      }

      //set focus on the select box when the editor is selected (timeout allows for editor to be added to DOM)
      onRendered(function () {
        fileUploadElement.click()
        // editor.focus();
        // editor.style.css = "100%";
      });
      classContainer

      return classContainer;

    },
  }
);


const toSnakeCase = (str = '') => {
  const strArr = str.split(' ');
  const snakeArr = strArr.reduce((acc, val) => {
    return acc.concat(val.toLowerCase());
  }, []);
  return snakeArr.join('_');
};

const AddNewMediaElement = function (icon) {
  var title = "File missing from storage"
  if (!icon) {
    icon = "fas fa-plus"
    title = "Add new"
  }
  var addNewItem = document.createElement("div");
  addNewItem.innerHTML = "<span class='" + icon + "'></span>";
  addNewItem.setAttribute("title", title);
  addNewItem.setAttribute("style", "" +
    "width: 80px; " +
    "height: 80px; " +
    "cursor: pointer; " +
    "background: #fff; " +
    "border: 2px solid #eee; " +
    "text-align: center; " +
    "vertical-align: middle; " +
    "padding-top: 30px; " +
    "border-radius: 4px;" +
    "")
  return addNewItem;
}


const CreateMediaContainers = function (type, field) {
  var element = document.createElement(type)
  element.controls = true
  element.style.padding = "5px"
  element.style.border = "1px solid #eee"
  element.style.borderRadius = "4px"
  let sourceContents = field.contents;

  if (!sourceContents) {
    return AddNewMediaElement("fas fa-question")
  }

  if (!sourceContents.startsWith("data:")) {
    sourceContents = "data:" + field.type + ";base64," + sourceContents;
  }
  element.src = sourceContents;
  element.setAttribute("style", "width:100%; clear: both;")
  element.setAttribute("class", "fileicon")
  return element;
}

const NewMediaContainerElement = function (elementType) {
  return function (cell, formatterParams) {
    const column = cell._cell.column;
    const row = cell._cell.row;
    const container = document.createElement("div");
    container.style.overflowX = "auto"
    container.style.overflowY = "auto"
    container.style.width = "100%"
    if (!row.data[column.field]) {
      row.data[column.field] = [];
    }
    row.data[column.field].map(function (e) {
      return CreateMediaContainers(elementType, e)
    }).map(function (e) {
      container.append(e)
      container.append(document.createElement("br"))
    });
    if (container.children.length === 0) {
      let addNewElement = AddNewMediaElement();
      addNewElement.onclick = function () {
        cell.edit(true);
      }
      container.appendChild(addNewElement)
    }
    return container;
  }
}

const tableComponent = {
  name: "EditDataTableComponent",
  props: ["baseItem"],
  // todo use the config property to show only configured columns for this view and not all columns
  methods: {
    showEditRow(row) {
      console.log("Edit row", row)
      const that = this;
      this.editRow = row;

      that.newRowData.map(function (e) {

        if (row && row[e.meta.ColumnName]) {
          e.value = row && row[e.meta.ColumnName];
          return;
        }

        if (e.meta.DefaultValue) {
          e.value = e.meta.DefaultValue;
          return;
        }

        e.value = "";
        if (e.meta.ColumnType.startsWith('file.')) {
          e.value = []
        } else if (e.meta.ColumnType === 'truefalse') {
          e.value = false
        } else {
          e.value = ""
        }
      });

      this.tablePermissionDrawer = false;
      this.newRowDrawer = true;
      this.showRowEditorDrawer()
    },
    filterRows() {
      this.refreshData();
    },
    onEntitySelectScroll(filterValue, update, abort, column) {
      console.log("load data for select menu", arguments, column);
      const that = this;
      column.loading = true;

      that.getTableSchema(column.meta.type).then(function (tableSchema) {
        console.log("Table schema", tableSchema);
        var labelColumns = Object.values(tableSchema.ColumnModel).filter(function (e) {
          return e.ColumnType === "label";
        }).map(function (e) {
          return e.ColumnName;
        })
        if (labelColumns.length === 0) {
          labelColumns = ["reference_id"]
        }

        that.loadData({
          tableName: column.meta.type,
          params: {
            filter: filterValue
          }
        }).then(function (res) {
          console.log("table entries", column.meta.type, res)

          update(() => {
            column.options = res.data.map(function (e) {
              return {
                label: labelColumns.map(function (l) {
                  return e[l]
                }).join(", "),
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
    deleteColumn(column) {
      console.log("Delete column", column, this, this.$q)
    },
    updateTabulatorPrototype() {

      const that = this;
      const fileUploaderCell = NewMediaContainerElement("a")
      Tabulator.prototype.extendModule("format", "formatters", {
        image: NewMediaContainerElement("img"),
        audio: NewMediaContainerElement("audio"),
        video: NewMediaContainerElement("video"),
        file: function (cell, formatterParams) {
          // console.log("format video cell", cell);
          var column = cell._cell.column;
          var row = cell._cell.row;
          if (!row.data[column.field] || row.data[column.field].length < 1) {
            return fileUploaderCell(cell, formatterParams);
          }
          var field = row.data[column.field][0];
          return "<a href='" + that.endpoint + "/asset/" + row.data.__type + "/" + row.data.reference_id + "/" + column.field + ".'" + field.type.split("/")[1] + "></a>";
        },
      });

    },
    createColumnFromDefinition(col) {
      const that = this;

      let formatter = null;
      let editor = true;
      let width = 200
      if (col.ColumnType === "content" || col.ColumnType === "json") {
        formatter = "textarea"
        width = 300
      } else if (col.ColumnType === "truefalse") {
        width = 100
        formatter = "tickCross";
      } else if (col.ColumnType === "datetime") {
        editor = "dateEditor"
        formatter = "datetime"
      } else if (col.ColumnType === "rating") {
        editor = "star"
      } else if (col.ColumnType.startsWith("file.") && col.ColumnType.indexOf('jpg') > -1) {
        formatter = "image";
        editor = "mediaEditor";
      } else if (col.ColumnType.startsWith("file.") && col.ColumnType.indexOf('mp4') > -1) {
        formatter = "video";
        editor = "mediaEditor";
      } else if (col.ColumnType.startsWith("file.") && col.ColumnType.indexOf('mp3') > -1) {
        formatter = "audio";
        editor = "mediaEditor";
      } else if (col.ColumnType.startsWith("file.")) {
        formatter = "file";
        editor = "mediaEditor";
      }


      return {
        "title": col.Name,
        "field": col.ColumnName,
        "editor": editor,
        "editable": false,
        "headerContextMenu": that.columnHeaderContextMenu,
        "formatter": formatter,
        "width": width,
        "hozAlign": col.ColumnType === "truefalse" ? "center" : "left",
        "sorter": col.ColumnType === "measurement" ? "number" : false,
        "headerSort": false,
      }
    },
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

      col.Name = newColumnName;
      col.ColumnName = newColumnName;

      let newColumnDefinition = that.createColumnFromDefinition(col);
      that.newColumnTypeToBeAdded = col;
      newColumnDefinition.editableTitle = true;
      var promise = null;
      var columns = that.spreadsheet.getColumns();
      if (columns.length > 3) {
        var secondLastColumn = columns[columns.length - 2]
        promise = that.spreadsheet.addColumn(newColumnDefinition, false, secondLastColumn._column.field);
      } else {
        promise = that.spreadsheet.addColumn(newColumnDefinition, false, "rowSelection");
      }
      promise.then(function (column) {

        that.$nextTick().then(function () {
          console.log("Column created", document.getElementsByClassName("tabulator-title-editor"))

          document.getElementsByClassName("tabulator-title-editor")[0].focus()
          document.getElementsByClassName("tabulator-title-editor")[0].setSelectionRange(0, document.getElementsByClassName("tabulator-title-editor")[0].value.length)
        })
      })
        .catch(function (error) {
          console.log("Failed to create element")
          that.$q.notify({
            message: "Failed to add new column to the table, please try later - " + JSON.stringify(error)
          })
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
    showRowEditorDrawer() {
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
      console.log("Save row", that.newRowData, that.editRow, that.tableSchema);
      that.newRowData.map(function (e) {
        if (!e.meta.ColumnType.startsWith('file.')) {
          if (e.meta.jsonApi) {
            if (e.value) {
              console.log("fk column set on save", e.meta.ColumnName, e.value)
              if (!e.value.value) {
                delete (obj, e.meta.ColumnName)
                return
              }
              obj[e.meta.ColumnName] = {
                type: e.meta.type,
                id: e.value.value,
              }
            } else {
              delete (obj, e.meta.ColumnName)
            }
          } else {
            obj[e.meta.ColumnName] = e.value;
          }
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
      console.log("Promises list", promises, obj);
      obj['tableName'] = that.tableName;

      let anyColumnValueReadPromiseFailFunction = function (e) {
        console.log("Failed to upload file", e);
        that.$q.notify({
          message: "Failed to upload file: " + e[0]
        })
      };
      Promise.all(promises).then(function () {

        let successFunction = function (res) {
          console.log("success on save", res.data)

          if (!that.editRow) {
            that.$q.notify({
              message: "Row created"
            });
          } else {
            that.$q.notify({
              message: "Row updated"
            });
          }
          that.editRow = null;
          if (res.data) {
            that.spreadsheet.updateData([res.data]);
          }

          that.newRowDrawer = false;
        };
        let handleUpdateFailFunction = function (e) {
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
        };
        if (that.editRow) {
          obj["id"] = that.editRow["reference_id"]
          obj.tableName = that.tableName;
          that.updateRow(obj).then(successFunction).catch(handleUpdateFailFunction);

        } else {
          that.createRow(obj).then(successFunction).catch(handleUpdateFailFunction);

        }

      }).catch(anyColumnValueReadPromiseFailFunction)


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
        //define row context menu contents
        var rowMenu = [
          {
            label: "<i class='fas fa-pen'></i> Edit row",
            action: function (e, row) {
              that.showEditRow(row._row.data);
              // row.update({name:"Steve Bobberson"});
            }
          },
          {
            label: "<i class='fas fa-check-square'></i> Select Row",
            action: function (e, row) {
              row.select();
            }
          },
          {
            separator: true,
          },
          {
            label: "Show actions",
            menu: [
              {
                label: "<i class='fas fa-trash'></i> Delete Row",
                action: function (e, row) {
                  row.delete();
                }
              },
              {
                label: "<i class='fas fa-ban'></i> Disabled Option",
                disabled: true,
              },
            ]
          }
        ]

//define column header menu as column visibility toggle
        var headerMenu = function () {
          var menu = [];
          var columns = this.getColumns();

          for (let column of columns) {

            //create checkbox element using font awesome icons
            let icon = document.createElement("i");
            icon.classList.add("fas");
            icon.classList.add(column.isVisible() ? "fa-check-square" : "fa-square");

            //build label
            let label = document.createElement("span");
            let title = document.createElement("span");

            title.textContent = " " + column.getDefinition().title;

            label.appendChild(icon);
            label.appendChild(title);

            //create menu item
            menu.push({
              label: label,
              action: function (e) {
                //prevent menu closing
                e.stopPropagation();

                //toggle current column visibility
                column.toggle();

                //change menu item icon
                if (column.isVisible()) {
                  icon.classList.remove("fa-square");
                  icon.classList.add("fa-check-square");
                } else {
                  icon.classList.remove("fa-check-square");
                  icon.classList.add("fa-square");
                }
              }
            });
          }

          return menu;
        };

        // that.loadData({tableName: tableName}).then(function (data) {
        //   console.log("Loaded data", data);
        //   that.rows = data.data;
        let columns = Object.keys(that.tableSchema.ColumnModel).map(function (columnName) {
          var col = that.tableSchema.ColumnModel[columnName];
          // console.log("Make column ", col);

          if (col.ColumnName === "__type" || that.defaultColumns.indexOf(col.ColumnName) > -1) {
            return null;
          }

          if (col.jsonApi) {
            if (col.jsonApi === "hasOne" || col.jsonApi === "belongsTo") {

              col.ColumnType = col.columnType;
              col.Name = col.ColumnName;
              console.log("Json api column", col)
              that.newRowData.push({
                  meta: col,
                  value: null,
                  options: [],
                }
              );
            } else {
              return null;
            }
          } else if (col.ColumnType.startsWith('file.')) {
            assetColumns.push(col.ColumnName)
            that.newRowData.push({
                meta: col,
                value: []
              }
            );
          } else if (col.ColumnType === 'truefalse') {
            that.newRowData.push({
                meta: col,
                value: col.ColumnType.DefaultValue
              }
            );
          } else {
            that.newRowData.push({
                meta: col,
                value: col.ColumnType.DefaultValue
              }
            );
          }

          return that.createColumnFromDefinition(col);
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

        columns.unshift({
          title: "", hozAlign: "center",
          formatter: "rownum"
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



        let TABULATOR_DEFAULT_OPTIONS = {
          data: [],
          columns: columns,
          // pagination: "remote",
          tooltips: true,
          rowContextMenu: rowMenu,
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


            if (columnDefinition.field.startsWith("new_column") && columnField !== columnDefinition.field) {

              var columns = that.spreadsheet.getColumns();
              var secondLastColumn = columns[columns.length - 2]

              var newColumn = that.newColumnTypeToBeAdded;
              newColumn.Name = columnTitle;
              newColumn.ColumnName = columnField;
              newColumn.IsNullable = true;
              if (newColumn.ColumnType.startsWith("file.")) {
                newColumn.DataType = "blob"
                newColumn.IsForeignKey = true;
                newColumn.ForeignKeyData = {
                  DataSource: "cloud_store",
                  Namespace: "localstore",
                  KeyName: that.tableName + "-" + newColumn.ColumnName,
                }
              }
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
                console.log("Update field definition for column", columnComponent, columnField);

                that.spreadsheet.updateColumnDefinition(columnDefinition.field, {field: columnField})

                // that.newColumnTypeToBeAdded.field = columnField;
                // that.spreadsheet.addColumn(that.newColumnTypeToBeAdded, false, secondLastColumn._column.field)

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
              console.log("Existing column rename");


              that.executeAction({
                tableName: "world",
                actionName: "rename_column",
                params: {
                  column_name: columnDefinition.field,
                  new_column_name: columnField,
                  table_name: that.tableName,
                }
              }).then(function (res) {
                console.log("Update field definition for column", columnComponent, columnField);

                that.spreadsheet.updateColumnDefinition(columnDefinition.field, {field: columnField})

                // that.newColumnTypeToBeAdded.field = columnField;
                // that.spreadsheet.addColumn(that.newColumnTypeToBeAdded, false, secondLastColumn._column.field)

                that.$q.notify({
                  message: "Column " + columnTitle + " renamed"
                });
                setTimeout(function () {
                  console.log("Reload model for ", that.tableName)
                  that.loadModel(that.tableName, true).then(function () {
                    console.log("Model refreshed, reload data", that.tableName)
                    that.spreadsheet.getData()
                  })
                }, 6000)
              })


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
          rowClick: function (e, row) {
            console.log("Row clicked", row, that.newRowData);
            that.showEditRow(row._row.data);
            // row.toggleSelect();
          },
          cellDblClick: function (e, cell) {
            // e - the click event object
            // cell - cell component
            // cell.updateData()
            var column = cell._cell.column;
            cell.edit(true);
          },
          paginationSize: 10,
          cellEdited: function (cell) {
            const reference_id = cell._cell.row.data.reference_id;
            const field = cell._cell.column.field;
            const newValue = cell._cell.value;
            //cell - cell component
            console.log("cell edited", reference_id, arguments);
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
              console.log("Create new row with data", obj, Object.values(obj).filter(e => !!e && e !== "" && !(e instanceof Array && e.length === 0)), Object.values(obj));
              if (Object.values(obj).filter(e => !!e && e !== "" && !(e instanceof Array && e.length === 0)).length === 1) {
                that.spreadsheet.addData([{}])
              }
              obj["tableName"] = that.tableName;
              that.createRow(obj).then(function () {
                that.$q.notify({
                  message: "Saved"
                });
                // that.spreadsheet.addRow({})
              }).catch(function (e) {
                console.log("Failed to save", e)
                that.$q.notify({
                  message: "Failed to save - " + e[0].title
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
                      "operator": "begins with",
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
            console.log("Request url ", requestUrl);
            return requestUrl; //encode parameters as a json object
          },
          ajaxResponse: function (url, params, response) {
            console.log("ajax call complete", url, params, response);
            that.pagination = response.links;
            //url - the URL of the request
            //params - the parameters passed with the request
            //response - the JSON object returned in the body of the response.

            let responseList = response.data.map(function (e) {
              if (assetColumns.length > 0) {
                new Promise(function (resolve, reject) {

                  var columnsToLoad = assetColumns.filter(function (columnName) {
                    return !!e.attributes[columnName]
                  })

                  if (columnsToLoad.length === 0) {
                    resolve();
                    return
                  }

                  that.loadData({
                    tableName: that.tableName,
                    params: {
                      query: JSON.stringify([
                        {
                          column: 'reference_id',
                          operator: 'is',
                          value: e.attributes["reference_id"]
                        }
                      ]),
                      fields: columnsToLoad.join(","),
                      included_relations: columnsToLoad.join(",")
                    }
                  }).then(function (res) {
                    var assetsRow = res.data[0];
                    let updateData = {};
                    for (var i in columnsToLoad) {
                      var columnName = columnsToLoad[i]
                      if (assetsRow[columnName]) {
                        updateData[columnName] = assetsRow[columnName]
                      }
                    }

                    if (Object.keys(updateData).length > 0) {
                      that.spreadsheet.updateRow(assetsRow["reference_id"], updateData).then(function () {
                      }).catch(function (err) {
                        console.log("Failed to update asset data", err)
                      })
                    }

                  }).catch(function (err) {
                    console.log("Failed to load asset ", err)
                  })
                })
              }
              return e.attributes
            });
            return {
              last_page: response.links.last_page,
              data: responseList
            }; //return the response data to tabulator
          },
        };

        let tabulatorOptions = {...TABULATOR_DEFAULT_OPTIONS, ...that.tabulatorOptions}
        console.log("Tabulator options", tabulatorOptions)
        that.spreadsheet = new Tabulator("#spreadsheet", tabulatorOptions);
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
            message: "No data in table " + tableName
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
      columnHeaderContextMenu: null,
      pagination: {},
      editRow: null,
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
          name: "image",
          icon: "fas fa-image",
          columnDef: {
            ColumnName: "file",
            ColumnType: "file.jpg|jpeg|png|gif|ico",
            DataType: "blob",
          }
        },
        {
          name: "audio",
          icon: "fas fa-file-audio",
          columnDef: {
            ColumnName: "file",
            ColumnType: "file.mp3|wav|aac",
            DataType: "blob",
          }
        },
        {
          name: "video",
          icon: "fas fa-video",
          columnDef: {
            ColumnName: "file",
            ColumnType: "file.mkv|mp4",
            DataType: "blob",
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
        // headerFilter: false,
      },
      currentPagination: {},
      defaultColumns: ['updated_at', 'created_at', 'reference_id', 'permission', 'user_account_id', 'usergroup_id'],
      tableSchema: {ColumnModel: []},
      rows: [],
      tableData: null,
      searchFilter: null,
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
    ...mapGetters(['endpoint', 'authToken', 'tables', 'decodedAuthToken'])
  },
  mounted() {
    const that = this;

    that.columnHeaderContextMenu = [
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
      {
        label: "Filter",
        action: function (e, column) {
          column.updateDefinition({headerFilter: true})
        }
      },
      {
        label: "Delete Column",
        action: function (e, column) {
          column.hide();
          that.deleteColumn(column)
        }
      },
    ]

    this.tableName = this.baseItem.targetTable.TableName
    this.updateTabulatorPrototype();
    this.refreshData();
  },
  watch: {
    'baseItem': function () {
      this.tableName = this.baseItem.targetTable.TableName
      this.refreshData();
    }
  },
}

export default tableComponent
</script>

<style scoped>

</style>
