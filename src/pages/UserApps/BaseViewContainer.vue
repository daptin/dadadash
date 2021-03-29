<template>
  <q-layout class="user-area-pattern" view="lHh Lpr lFf">


    <base-view-router style="padding-top: 50px" ref="viewRouter" v-if="baseLoaded && selectedBaseItem"
                      :base-config="baseConfig"
                      :baseItem="selectedBaseItem"></base-view-router>


    <q-page-container v-if="!selectedBaseItem">
      <q-page>
        <q-card style="padding-top: 50px" flat>
          <q-card-section>
            <span class="text-h4">Create a new document</span>
          </q-card-section>
          <q-card-section>
            <div class="row">

              <div class="col-4 q-pa-md" :disable="item.disabled" clickable @click="addBaseItem(item)"
                   v-close-popup
                   v-for="item in baseItemTypes" v-if="!item.disabled"
                   :key="item.label">
                <q-item class="q-pa-md">
                  <q-item-section>
                    <q-btn style="size: 300px; height: 200px;" size="xl" :icon="item.icon" :label="item.label">
                    </q-btn>
                  </q-item-section>
                </q-item>

              </div>
              <q-separator/>

            </div>

          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>


    <user-header-bar @delete-base="deleteBase"
                     style="border-bottom: 1px solid black"
                     @search="searchDocuments"
                     @hide-document-bars="documentTab = !documentTab"
                     @reload-bases="refreshBaseData"
                     :buttons="{
        before: [
            // {icon: 'fas fa-bars', event: 'hide-document-bars'},
          ],
        beforeTitle: [
            {icon: 'fas fa-bars', event: 'hide-document-bars'},
          ],
        after: [
            {icon: 'fas fa-sync-alt', tooltip: 'Reload base and all items', event: 'reload-bases'},
            {icon: 'fas fa-trash', tooltip: 'Delete this base and all items in it. To delete a single item, right click on the tab', event: 'delete-base'},
          ],
        }" :onBack="() => {$router.push('/workspace/' + $route.params.workspaceName)}"
                     :title='$route.params.workspaceName
                     + "&nbsp;&nbsp; › &nbsp;&nbsp;" + ($route.params.baseName)
                     + ( $route.params.itemName ? "&nbsp;&nbsp; › &nbsp;&nbsp;" + ($route.params.itemName) : "" )  '
    ></user-header-bar>
    <q-drawer
      v-model="documentTab"
      show-if-above
      mini
      :persistent="false"
      mini-to-overlay
      :width="400"
      :breakpoint="500"
      bordered
      :mini="documentTabminiState"
      @mouseover="documentTabminiState = false"
      @mouseout="documentTabminiState = true"
      content-class="bg-white print-hide"
      style="overflow-y: hidden;"
      content-style="overflow-y: hidden;"
    >
      <div style="overflow-y: hidden; padding-top: 140px" class="fit">

        <q-list padding>

          <q-item ref="newItemButton" clickable>
            <q-item-section avatar>

              <q-icon size="xs"
                      name="fas fa-plus">
              </q-icon>

            </q-item-section>

            <q-item-section v-if="!documentFilterKeyword">
              Add new document
            </q-item-section>

            <q-item-section v-if="documentFilterKeyword">
              Add new document named '{{ documentFilterKeyword }}'
            </q-item-section>

            <q-menu>
              <q-list style="min-height: 500px">

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
          </q-item>

          <q-item
            :key="item.reference_id"
            v-if="item.document_extension !== 'summary'" v-for="item in filteredDocuments"
            :to="'/workspace/' + workspaceName + '/' + baseName + '/' + item.document_name"
            clickable
            v-ripple>
            <q-item-section avatar>
              <q-icon size="xs"
                      :name="baseItemTypes[item.document_extension] ? baseItemTypes[item.document_extension].icon : item.document_extension"/>
            </q-item-section>

            <q-item-section>
              {{
                item.document_name
              }}
            </q-item-section>
            <q-item-section side>
              <q-btn size="xs" flat icon="fas fa-wrench">
                <q-menu
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
              </q-btn>
            </q-item-section>


          </q-item>

        </q-list>
      </div>

      <div v-if="decodedAuthToken != null" class="absolute-top q-pa-sm" style="height: 150px; ">
        <div class="bg-transparent">
          <q-avatar size="40px" class="">
            <img :src="decodedAuthToken.picture">
          </q-avatar>
          <!--          <div :style="{'display': documentTabminiState ? 'none' : 'block', 'font-size': '10px'}" class="text-weight-light absolute-bottom q-pa-md" >-->
          <!--            {{ decodedAuthToken.name }}-->
          <!--          </div>-->
        </div>
        <div class="absolute-bottom q-pa-md"
             :style="{'display': documentTabminiState ? 'none' : 'block', 'font-size': '10px'}">
          <q-input label="search document" @keypress.enter="selectFirstFilteredDocument()"
                   v-model="documentFilterKeyword"></q-input>
        </div>
      </div>


    </q-drawer>

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
import Vue from 'vue'
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
    selectFirstFilteredDocument() {
      const that = this;
      if (that.documentFilterKeyword) {
        var filteredDocs = that.filteredDocuments;
        if (filteredDocs.length > 0) {
          that.$router.push('/workspace/' + that.workspaceName + '/' + that.baseName + '/' + filteredDocs[0].document_name)
        } else {
          that.selectedBaseItem = null;
        }
      }
    },
    showAddNewItemMenu() {
      document.getElementById("newTableButton").click()
    },
    saveItemPermissions() {
      const that = this;
      this.showBaseConfigurationModel = false;
      console.log("save config", this.itemConfiguration);
      if (this.itemConfiguration.allowGuests) {
        that.itemBeingEdited.permission = that.itemBeingEdited.permission | 2;
        that.updateRow({
          tableName: "document",
          id: this.itemBeingEdited.reference_id,
          permission: this.itemBeingEdited.permission
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
        that.itemBeingEdited.permission = that.itemBeingEdited.permission ^ 2;
        that.updateRow({
          tableName: "document",
          id: this.itemBeingEdited.reference_id,
          permission: this.itemBeingEdited.permission
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
      console.log("Show item configuration drawer", item)
      this.itemBeingEdited = item;
      this.showBaseConfigurationModel = true;
      this.itemConfiguration = {
        permission: item.permission,
        allowGuests: (item.permission & 2) === 2,
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
        reference_id: that.itemBeingEdited.id
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
          if (item.document_extension === "table") {
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

          for (var i = 0; i < that.baseConfig.items.length; i++) {
            if (that.baseConfig.items[i].document_name === that.itemBeingEdited.document_name) {
              Vue.set(that.baseConfig.items[i], "document_name", that.newName)
            }

          }

          // if (originalTitle === that.selectedItem) {
          that.$router.push('/workspace/' + that.workspaceName + "/" + that.baseName + "/" + that.newName)
          // }
          // that.refreshData()
        }).catch(function (err) {
          console.log("Failed to update item name", err)
        })
      }
      this.showRenameBaseViewModel = false;
    },
    addBaseItem(itemTemplate) {
      const that = this;
      console.log("Add new item to base", itemTemplate);
      let newItemLabel = "New " + itemTemplate.type + " - " + Math.floor(Math.random() * 90 + 10);

      if (that.documentFilterKeyword && that.documentFilterKeyword.length > 0) {
        newItemLabel = that.documentFilterKeyword;
      }

      let newItem = {
        type: itemTemplate.type,
        label: newItemLabel
      };
      if (DEFAULT_ITEM_MAP[itemTemplate.type]) {
        newItem = DEFAULT_ITEM_MAP[itemTemplate.type]
        newItem.document_extension = itemTemplate.type;
        newItem.document_name = newItemLabel;
      }
      if (newItem.document_extension === "table") {
        // newItem.targetTable = newItem.attributes
        // newItem.targetTable.TableName = "tab_" + makeid(7);
      }


      var newRow = null;

      newRow = {
        document_name: newItemLabel,
        tableName: "document",
        document_extension: itemTemplate.type,
        mime_type: 'workspace/' + itemTemplate.type,
        document_path: "/" + that.workspaceName + "/" + that.baseName,
        document_content: [{
          name: itemTemplate.type + "-" + uuidv4() + ".json",
          type: "workspace/" + itemTemplate.type,
          path: "/" + that.workspaceName + "/" + that.baseName,
          contents: "workspace/" + itemTemplate.type + "," + btoa(JSON.stringify(newItem))
        }],
      }


      console.log("Create base request", newRow)

      that.createRow(newRow).then(function (res) {
        console.log("New workspace item created", res)
        newItem.reference_id = res.data.reference_id;
        var finalNewItem = {...newItem, ...res.data}
        console.log("New item created, ensure new tables", finalNewItem)
        that.baseConfig.items.push(finalNewItem);
        that.baseItemMap[newItemLabel] = finalNewItem;

        that.ensureBaseTables().then(function () {
          that.selectedBaseItem = finalNewItem;
          that.$nextTick().then(function () {
            that.$refs.viewRouter.reloadBaseItem();

            if (that.documentFilterKeyword === newItemLabel) {
              that.documentFilterKeyword = null;
              that.$router.push('/workspace/' + that.workspaceName + "/" + that.baseName + "/" + newItemLabel)
            } else {
              that.renameBaseItem(finalNewItem);
            }

          })
        }).catch(function (err) {
          console.log("Failed to ensure tables for new items", err);
          that.$q.notify({
            type: "negative",
            message: "Something went wrong while creating new item: " + JSON.stringify(err)
          })
        });


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
            if (item.document_extension === "table") {
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
          that.baseRow = baseRow
          if (!baseRow.document_content) {
            alert("Base configuration is empty - " + baseRow)
            return
          }
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
                that.baseItemMap[item.document_name] = item;
                that.baseConfig.items.push(item);
                var itemConfig = JSON.parse(atob(item.document_content[0].contents))
                item = {...item, ...itemConfig}
                that.baseItemMap[item.document_name] = item;
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
        if (baseItem.document_extension === "table") {
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

                    var maxtries = 10;

                    setTimeout(function () {

                      if (maxtries < 1) {
                        return;
                      }
                      maxtries -= 1;

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
                        console.log("Failed to generate random data for ", table.TableName, "Trying again in 5 seconds")
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
      console.log("Updated base ", that.selectedItem, that.baseName, that.selectedBaseItem);
      that.baseLoaded = false;

      that.selectedItem = that.$route.params.itemName;
      that.baseName = that.$route.params.baseName;
      console.log("Refresh data, update the selected item", that.selectedItem, that.baseItemMap);
      that.selectedBaseItem = that.baseItemMap[that.selectedItem]

      if (that.baseConfig.items.length === 0) {
        that.documentTab = false;
      }

      that.baseLoaded = true;
      return Promise.resolve();
    },
  },
  props: ["baseConfiguration"],
  data() {
    return {
      documentTab: false,
      documentFilterKeyword: null,
      documentTabminiState: true,
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
    filteredDocuments() {
      const that = this;
      if (that.documentFilterKeyword === '' || that.documentFilterKeyword == null) {
        return this.baseConfig.items;
      }
      var x = this.baseConfig.items.filter(function (item) {
        console.log("Filter documents by keyword", item, that.documentFilterKeyword, item.document_name.indexOf(that.documentFilterKeyword),
          item.document_name.indexOf(that.documentFilterKeyword) > -1)
        return item.document_name.indexOf(that.documentFilterKeyword) > -1
      });
      console.log("filtered docs", x)
      return x;
    },
    ...mapGetters(['endpoint', 'authToken', 'tables', 'baseItemTypes', 'decodedAuthToken'])
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
