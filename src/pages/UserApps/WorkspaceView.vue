<template>
  <div class="row">
    <div class="col-12">
      <q-card style="background: transparent" flat>
        <q-card-section>
          <div style="float: left; padding-top: 5px">
           <span class="text-h4"
                 style="text-transform: capitalize; font-size: 24px; line-height: 28.13px; margin-top: 5px">
             {{
               workspaceName
             }}
           </span>
          </div>
          <span>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <q-btn
          color="primary" icon="add"
          label="Add Base" size="sm" @click="showAddBase = true" v-if="!showAddBase">
        </q-btn>
        <q-btn
          color="primary" icon="fas fa-times"
          label="Cancel" @click="showAddBase = false" v-if="showAddBase">
        </q-btn>
        <q-btn
          class="float-right text-black"
          color="white" flat icon="fas fa-cogs">
          <q-menu>
            <q-list style="min-width: 200px">
              <q-item @click="showDeleteWorkspaceDialog = true" clickable>
                <q-item-section>Delete workspace</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </span>
        </q-card-section>
        <q-card-section style="margin-top: -15px">
          <hr style="border: 1px solid rgba(0, 0, 0, 0.07)"/>
        </q-card-section>
      </q-card>
      <q-card style="background: transparent" flat
              v-if="showAddBase || (workspaceSchema && Object.keys(workspaceSchema.workspaceItems).length === 0)">
        <q-card-section>
          <add-base-view @add-base="addBaseFromCatalog"></add-base-view>
        </q-card-section>
      </q-card>
      <div class="row q-pa-md" v-if="!showAddBase && workspaceSchema">

        <div class="col-4 col-sm-6 col-md-4 col-xs-12 q-pa-md"

             v-for="(baseItems, baseName) in workspaceSchema.workspaceItems"
        >


          <q-card v-for="item in baseItems" v-if="item.type === 'summary'"
                  :key="item.label"
                  style="background: white; cursor: pointer; "
                  @click="handleCardClick(item)"
                  flat>
            <div style="border-radius: 8px">
              <q-item>
                <q-item-section avatar>
                  <q-icon size="sm" :name="item.title.icon"></q-icon>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ item.baseName }}</q-item-label>
                  <q-item-label caption>
                    {{ item.title.label }}
                  </q-item-label>
                </q-item-section>


              </q-item>


            </div>
          </q-card>

          <q-card @click="handleCardClick({
              baseName: baseName,

             })" flat v-if="baseItems.filter(e => e.type === 'summary').length === 0">
            <q-card-section>


              <div style="border-radius: 8px">
                <q-item>
                  <q-item-section>
                    <q-item-label>{{ baseName }}</q-item-label>
                  </q-item-section>


                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label caption>Summary from {{ baseName }}</q-item-label>
                  </q-item-section>
                </q-item>
              </div>


            </q-card-section>

          </q-card>
        </div>


      </div>


    </div>
    <q-dialog v-model="showDeleteWorkspaceDialog">
      <q-card class="bg-white">
        <q-card-section>
          <span class="text-h4">Delete workspace</span>
        </q-card-section>
        <q-card-section>
          Do you want to delete all the items is this base ?
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Delete" color="negative" @click="deleteWorkspace"></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import {mapActions} from "vuex";
import JSZip from "jszip";
import {v4 as uuidv4} from "uuid";

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
  name: "WorkspaceView",
  props: ['workspaceName'],
  data() {
    return {
      showAddBase: false,
      showDeleteWorkspaceDialog: false,
      workspaceDocument: null,
      workspaceSchema: null,
    }
  },
  meta() {
    return {
      title: this.workspaceName || 'Home',
    }
  },
  methods: {
    deleteWorkspace() {
      const that = this;
      that.$q.loadingBar.start()
      that.showDeleteWorkspaceDialog = false;
      console.log("Delete workspace", that.baseList);
      var listPromises = [], deletePromises = [];
      for (var i = 0; i < that.baseList.length; i++) {
        var baseItem = that.baseList[i];
        console.log("To delete items from base {} - {}", i, baseItem)


        var queryPayload = {
          tableName: "document",
          params: {
            query: JSON.stringify(
              [{
                column: "document_path",
                operator: "is",
                value: "/" + that.workspaceName + "/" + baseItem.document_name
              }, {
                column: "mime_type",
                operator: "like",
                value: "workspace/%"
              }]
            ),
            page: {
              size: 100,
            },
            included_relations: "document_content"
          }
        };

        deletePromises.push(that.deleteRow({
          tableName: "document",
          reference_id: baseItem.reference_id
        }))


        listPromises.push(that.loadData(queryPayload).then(function (res) {
          console.log("Deleting %s items in base %s", res.data.length, baseItem.document_name);
          for (var i = 0; i < res.data.length; i++) {
            try {
              var item = res.data[i];
              console.log("Delete item ", item.document_path, item)
              if (item.document_extension === "table") {
                var itemConfig = JSON.parse(atob(item.document_content[0].contents))
                console.log("Need to delete target table", itemConfig)
                deletePromises.push(that.deleteTableByName(itemConfig.targetTable.TableName))
              }
              deletePromises.push(that.deleteRow({
                tableName: "document",
                reference_id: item.reference_id
              }))
            } catch (e) {
              console.log("failed to parse item data", e)
            }
          }
        }));
      }

      Promise.all(listPromises).then(function () {
        that.$q.loadingBar.increment(30)
        that.$q.notify({
          message: "Deleting all items and bases"
        })
        Promise.all(deletePromises).then(function () {
          that.$q.loadingBar.increment(30)


          that.$q.notify({
            message: "Deleting workspace"
          });
          that.loadData({
            tableName: "document",
            params: {
              query: JSON.stringify([
                {
                  "column": "document_name",
                  "operator": "is",
                  "value": that.workspaceName,
                },
                {
                  "column": "document_path",
                  "operator": "is",
                  "value": "/",
                },
                {
                  "column": "mime_type",
                  "operator": "is",
                  "value": "workspace/root",
                },
              ]),
              page: {
                size: 1,
              },
            }
          }).then(function (res) {
            console.log("Delete workspace", res.data);
            that.$q.loadingBar.increment(10)

            that.deleteRow({
              tableName: "document",
              reference_id: res.data[0].id
            }).then(function (res) {
              that.$q.loadingBar.increment(30)
              that.$q.loadingBar.stop()

              that.$emit("delete-workspace")

              that.$q.notify({
                message: "Deleted workspace"
              });
              that.$router.push('/workspace')

            }).catch(function (err) {
              that.$q.loadingBar.stop();
              that.$q.notify({
                message: "Failed to delete workspace - " + JSON.stringify(err)
              })
            })
          }).catch(function (err) {
            that.$q.notify({
              message: "Failed to delete workspace - " + JSON.stringify(err)
            })
            that.$q.loadingBar.stop();

          })
        })
      })

    },
    handleCardClick(item) {
      console.log("Summary item ", item);
      if (item.target && item.target.name) {
        this.$router.push("/workspace/" + this.workspaceName + "/" + item.baseName + "/" + item.target.name)
      } else {
        this.$router.push("/workspace/" + this.workspaceName + "/" + item.baseName)
      }
    },
    addBaseFromCatalog(newBaseName, item) {
      const that = this;
      const baseSchema = {
        items: [],
        created_at: new Date(),
      };
      var promises = []
      console.log(that.workspaceDocument)
      console.log("Add catalog item", that.workspaceSchema, item);
      this.showAddBase = false;


      var schema = item.schema;
      for (var itemIndex in schema.items) {
        const item = schema.items[itemIndex];

        if (item.type === "summary") {
          baseSchema.items.push(item);
        }
        if (item.type === "table") {
          var cols = item.attributes.Columns;
          for (var i in cols) {
            var col = cols[i]
            if (col.ColumnType.startsWith("file.")) {
              col.IsForeignKey = true;
              col.ForeignKeyData = {
                DataSource: 'cloud_store',
                Namespace: 'localstore',
                KeyName: col.ColumnName,
              }
            }
          }

        }


        var newRow = null;

        newRow = {
          document_name: item.label,
          tableName: "document",
          document_extension: item.type,
          mime_type: 'workspace/' + item.type,
          document_path: "/" + that.workspaceName + "/" + newBaseName,
          document_content: [{
            name: item.type + "-" + uuidv4() + ".json",
            type: "workspace/" + item.type,
            path: "/" + that.workspaceName + "/" + newBaseName,
            contents: "data:workspace/" + item.type + "," + btoa(JSON.stringify(item))
          }],
        }


        console.log("Create base request", newRow)

        promises.push(that.createRow(newRow))

      }


      var newBaseRow = {
        document_name: newBaseName,
        tableName: "document",
        document_extension: "base",
        mime_type: 'workspace/base',
        document_path: "/" + that.workspaceName,
        document_content: [{
          name: newBaseName + "_metadata.json",
          type: "workspace/base",
          path: "/" + that.workspaceName,
          contents: "data:workspace/base," + btoa(JSON.stringify(baseSchema))
        }],
      }
      console.log("Create base request", newBaseRow);

      promises.push(that.createRow(newBaseRow));
      Promise.all(promises).then(function (res) {

        console.log("All workspace entries created");
        that.refreshData();

      }).catch(function (e) {
        console.log("Failed to create base", e)
        that.$q.notify({
          message: "Failed to create base: " + JSON.stringify(e)
        });
      });


    },
    ...mapActions(['loadData', 'createRow', 'updateRow', 'executeAction', 'deleteRow', 'deleteTableByName']),
    handleDataLoad(data) {
      const that = this;
      console.log("Configuration for workspace", data);
      this.baseList = data.data;
      that.workspaceSchema = {
        workspaceItems: {},
        label: that.workspaceName
      }

      for (var i in this.baseList) {
        var baseConfig = this.baseList[i]
        let baseName = baseConfig.document_name;
        if (!that.workspaceSchema.workspaceItems[baseName]) {
          that.workspaceSchema.workspaceItems[baseName] = [];
        }
        // console.log("base config ", baseName, baseConfig)
        if (!baseConfig.document_content) {
          console.log("Base has no contents ", baseName)
          continue
        }
        var baseSchema = baseConfig.document_content[0].contents;
        var baseSchemaJson = JSON.parse(atob(baseSchema));
        // console.log("Base config", baseSchemaJson);

        for (var j in baseSchemaJson.items) {
          var item = baseSchemaJson.items[j];
          item.baseName = baseName;
          if (item.type === "summary") {
            that.workspaceSchema.workspaceItems[baseName].push(item)
          }
        }
      }
      that.$q.loadingBar.stop()


    },
    saveWorkspaceConfiguration() {
      const that = this;

      var zip = new JSZip();
      zip.file("metadata.json", JSON.stringify(this.workspaceSchema));

      zip.generateAsync({type: "base64"}).then(function (base64) {

        that.workspaceDocument.document_content[0].contents = "data:workspace/root," + base64;
        console.log("save document", that.workspaceDocument)
        that.workspaceDocument.tableName = "document";
        if (that.workspaceDocument.reference_id) {

          that.updateRow(that.workspaceDocument).then(function (res) {
            console.log("Document saved", res);
          }).catch(function (err) {
            console.log("error", err)
            that.$q.notify({
              message: "We are offline, changes are not being stored"
            })
          })
        } else {
          that.createRow(that.workspaceDocument).then(function (res) {
            that.workspaceDocument = res.data;
            console.log("Spreadsheet created", res);
            that.$router.push('/apps/spreadsheet/' + that.workspaceDocument.reference_id)
          }).catch(function (err) {
            console.log("eror", err)
            that.$q.notify({
              message: "We are offline, changes are not being stored"
            })
          })

        }
      })


    },
    refreshData(searchTerm) {
      const that = this;
      that.showNewWorkspace = false;
      that.selectedFile = null;
      let searchQueryParams = [{
        column: "document_path",
        operator: "is",
        value: "/" + that.workspaceName
      }, {
        column: "mime_type",
        operator: "like",
        value: "workspace/base"
      }];

      if (searchTerm && searchTerm.trim().length > 0) {
        searchQueryParams.push({
          column: "document_name",
          operator: "like",
          value: searchTerm.trim().length + "%"
        })
      }

      let queryPayload = {
        tableName: "document",
        params: {
          query: JSON.stringify(searchQueryParams),
          page: {
            size: 100,
          },
          included_relations: "document_content"
        }
      };

      that.files = [];
      console.log("Query data")

      that.$q.loadingBar.start()
      that.loadData(queryPayload).then(function (res) {
        console.log("base list load complete", res)
        that.handleDataLoad(res)
      });


    }
  },
  mounted() {
    this.refreshData()
  },
  watch: {
    workspaceName: function () {
      console.log("Workspace changed", this.workspaceName);
      this.refreshData();
    }
  }
}
</script>

<style scoped>
.add-base-icon-button i {
  width: 15px;
}
</style>
