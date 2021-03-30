<template>

  <q-tab-panels keep-alive v-model="baseItem.reference_id">
    <q-tab-panel :key="item.reference_id" style="padding: 0" :name="item.reference_id"
                 v-for="item in baseConfig.items">
      <component :is="baseItemComponentMap[item.document_extension]"
                 :baseItem="baseItemConfigMap[item.reference_id]"
                 v-if="!documentLoading && baseItemConfigMap[item.reference_id]"
                 @save-base-item-contents="saveBaseItemContents"
      ></component>
    </q-tab-panel>
  </q-tab-panels>

</template>

<script>
import {mapActions} from "vuex";

function makeid(length) {
  var result = '';
  var characters = 'abcdefghijklmnopqrstuvwxyz';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


export default {
  name: "BaseViewRouter",
  props: ["baseItem", "baseConfig"],
  meta() {
    return {
      // this accesses the "title" property in your Vue "data";
      // whenever "title" prop changes, your meta will automatically update
      title: ('[' + this.baseConfig.name + '] ') + (this.baseItem ? this.baseItem.document_name : 'New file') + " - " + this.baseItem.document_extension
    }
  },
  methods: {
    ensureBaseTables(baseItem) {
      const that = this;


      console.log("Ensure base tables", baseItem)

      var promises = [];
      var updateSchema = {
        Tables: [],
      };

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

          baseItem.document_content[0].contents = btoa(JSON.stringify({
            targetTable: targetTableConfig
          }))
          baseItem.tableName = "document";
          promises.push(that.updateRow(baseItem))
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
              that.generateRandomData(updateSchema.Tables.map(e => e.TableName)).then(function (res) {
                resolve()
              }).catch(reject)


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
    generateRandomData(tableNames) {
      const that = this;
      return new Promise(function (resolve, reject) {
        console.log("Try to create random data for the new base");
        that.$q.notify({
          message: "Generating random data for " + tableNames.length + " tables"
        });
        that.$q.loadingBar.start();
        var randomDataPromises = []
        randomDataPromises = tableNames.map(function (tableName) {
          console.log("Create random data for ", tableName);

          return new Promise(function (resolve, reject) {
            var maxtries = 3;
            var generateRandomDataAndLoad = function () {


              setTimeout(function () {

                if (maxtries < 1) {
                  reject();
                  return;
                }
                maxtries -= 1;

                that.executeAction({
                  tableName: "world",
                  actionName: "generate_random_data",
                  params: {
                    "table_name": tableName,
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
                  console.log("Random data generated for table", tableName)
                  resolve();

                }).catch(function (err) {
                  generateRandomDataAndLoad()
                  console.log("Failed to generate random data for ", tableName, "Trying again in 5 seconds", maxtries)
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

      })
    },
    reloadBaseItem() {
      const that = this;
      that.showComponent = false;


      that.tableMap = {}

      for (var i = 0; i < that.baseConfig.items.length; i++) {
        var item1 = that.baseConfig.items[i];
        if (item1.type === "table") {
          that.tableMap[item1.document_name] = item1.targetTable
        }
      }

      that.baseItemConfigMap = {}

      for (let i = 0; i < that.baseConfig.items.length; i++) {
        const item = that.baseConfig.items[i];
        that.baseItemConfigMap[item.reference_id] = item;
      }


      console.log("Base item config 2", that.baseItemConfigMap)
      that.$nextTick().then(function () {
        that.showComponent = true;
        // setTimeout(function (){
        //   document.getElementsByClassName("q-page-container")[1].scrollIntoView()
        // }, 2000)
      })
    },
    getJsonFromDocument: function (document) {

      let contents = document.contents;
      if (!contents) {
        return {}
      }
      if (contents.indexOf(",") > -1) {
        return JSON.parse(atob(contents.split(",")[1]))
      }
      return JSON.parse(atob(contents));
    },
    saveBaseItemContents(baseEncodedFileItem) {

      const that = this;
      console.log("Save contents for base", that.baseItem, baseEncodedFileItem.length);

      that.baseItemConfigMap[that.baseItem.reference_id].file = baseEncodedFileItem;
      try {

        var originalContent = this.getJsonFromDocument(that.baseItem.document_content[0])
      } catch (e) {
        that.$q.notify({
          type: "error",
          message: "This file seems to be corrupted, can only be deleted"
        });
        return
      }

      var contentKeys = Object.keys(originalContent);
      var baseKeys = Object.keys(that.baseItem);
      for (const baseKey of baseKeys) {
        if (contentKeys.indexOf(baseKey) > -1) {
          delete originalContent[contentKeys]
        }
      }
      originalContent.file = baseEncodedFileItem;

      that.baseItem.document_content[0].contents = "application/json," + btoa(JSON.stringify(originalContent));
      that.baseItem.tableName = "document";
      that.updateRow(that.baseItem).then(function (res) {
        console.log("base item content updated")
      }).catch(function (err) {
        console.log("Failed to save contents in base item", err);
        that.$q.notify({
          message: "Failed to save base item contents"
        })
      })
    },
    ...mapActions(['updateRow', 'loadOneData', 'executeAction']),
    ensureBaseItemContents(base) {
      const that = this;
      that.documentLoading = true;
      return new Promise(function (resolve, reject) {
        that.$q.loading = true;
        if (!base.document_content[0].contents) {
          console.log("Contents missing ");
          that.loadOneData({
            referenceId: that.baseItem.reference_id,
            tableName: "document",
            params: {
              included_relations: "document_content"
            }
          }).then(function (res) {
            console.log("data contents loaded", res);
            var contents = JSON.parse(atob(res.data.document_content[0].contents));
            var extendedItem = {...base, ...contents}
            that.baseItemConfigMap[extendedItem.reference_id] = extendedItem;
            that.ensureBaseTables(extendedItem).then(function () {
              that.$q.loading = false;
              that.documentLoading = false;
              resolve();
            })
          }).catch(function (err) {
            that.documentLoading = false;
            reject()
          })

        } else {
          that.ensureBaseTables(base).then(function () {
            that.$q.loading = false;
            resolve();
            that.documentLoading = true;
          })

        }
      })

    }
  },

  data() {
    return {
      showComponent: true,
      documentLoading: true,
      baseItemConfig: null,
      baseItemConfigMap: {},
      baseItemComponentMap: {
        'view': 'edit-data-table',
        'table': 'edit-data-table',
        'document': 'document-editor',
        'folder': 'file-browser',
        'spreadsheet': 'spreadsheet-editor',
        'mermaid_graph': 'mermaid-graph-editor',
        'calendar': 'calendar-view',
      },
      targetTable: null,
      tableMap: {},
    }
  },
  mounted() {
    console.log("Mounted base view router", this.baseItem, this.baseConfig);
    const that = this;
    that.ensureBaseItemContents(this.baseItem)
    // this.ensureBaseTables(this.baseItem)
    that.reloadBaseItem();
    console.log("Base item config 1", that.baseItemConfig)

  },
  watch: {
    'baseItem': function (e) {
      console.log("base item changeD", this.baseItem)
      // this.reloadBaseItem();
      this.ensureBaseItemContents(this.baseItem)
      // this.ensureBaseTables(this.baseItem)
    }
  }
}
</script>

<style scoped>

</style>
