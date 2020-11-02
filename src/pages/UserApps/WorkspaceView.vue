<template>
  <div class="row">
    <div class="col-12">
      <q-card flat>
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
          label="Add Base" @click="showAddBase = true" v-if="!showAddBase">
        </q-btn>
        <q-btn
          color="primary" icon="fas fa-times"
          label="Cancel" @click="showAddBase = false" v-if="showAddBase">
        </q-btn>
      </span>
        </q-card-section>
        <q-card-section style="margin-top: -15px">
          <hr style="border: 1px solid rgba(0, 0, 0, 0.07)"/>
        </q-card-section>
      </q-card>
      <q-card flat v-if="showAddBase">
        <q-card-section>
          <add-base-view @add-base="addBaseFromCatalog"></add-base-view>
        </q-card-section>
      </q-card>
      <div class="row" v-if="!showAddBase && workspaceSchema">
        <div style="border-radius: 8px" class="col-3 q-pa-md"
             v-for="(baseItems, baseName) in workspaceSchema.workspaceItems">
          <template v-for="item in baseItems" v-if="item.item_type === 'summary'">
            <q-card style="background: white; cursor: pointer;" @click="handleCardClick(item)" class="q-pa-md" flat>
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
              <q-item>
                <q-item-section>
                  <q-item-label caption>Summary from {{ baseName }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-card>
          </template>


        </div>
      </div>


    </div>
  </div>
</template>

<script>
import {mapActions} from "vuex";
import JSZip from "jszip";

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
      workspaceDocument: null,
      workspaceSchema: null,
    }
  },
  methods: {
    handleCardClick(item) {
      console.log("Summary item ", item);
      this.$router.push("/apps/workspace/" + this.workspaceName + "/" + item.baseName + "/" + item.target.name)
    },
    addBaseFromCatalog(newBaseName, item) {
      const that = this;
      const baseSchema = {
        items: [],
        created_at: new Date(),
      };
      console.log(that.workspaceDocument)
      console.log("Add catalog item", that.workspaceSchema, item);
      this.showAddBase = false;
      var updateSchema = {
        Tables: [],
      };


      var schema = item.schema;
      for (var itemIndex in schema.items) {
        const item = schema.items[itemIndex];
        switch (item.item_type) {
          case "table":

            var targetTable = item.targetTable;
            if (!targetTable) {
              var targetTableConfig = item.attributes;
              targetTableConfig.TableName = "tab_" + makeid(7)
              console.log("No target table exists for this item, creating one", item.label, targetTableConfig.Tab);
              updateSchema.Tables.push(targetTableConfig)
              item.targetTable = targetTableConfig;
            } else {
              that.loadModel(targetTable.TableName).then(function (res) {
                console.log("Loaded table config", res)
              })
            }
            baseSchema.items.push(item);

            break;
          case "summary":
            baseSchema.items.push(item)
            break;
          default:
            baseSchema.items.push(item)
            console.log("Undefined item type", item)
        }
      }


      var newRow = {
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
      console.log("Create base request", newRow)

      that.createRow(newRow).then(function (res) {


        if (updateSchema.Tables.length > 0) {

          that.executeAction({
            tableName: "world",
            actionName: "upload_system_schema",
            params: {
              schema_file: [{
                contents: "application/json," + btoa(JSON.stringify(updateSchema)),
                name: newBaseName + ".json"
              }]
            }
          }).then(function (res) {
            that.refreshData();
            console.log("Tables created", res);
            that.$q.notify({
              message: "Base created"
            })
          }).catch(function (err) {
            console.log("Failed to create table", err)
            that.$q.notify({
              message: "Failed to create tables for the base"
            });

          })

        }

      }).catch(function (e) {
        console.log("Failed to create base", e)
        that.$q.notify({
          message: "Failed to create base: " + JSON.stringify(e)
        });
      });


    },
    ...mapActions(['loadData', 'createRow', 'updateRow', 'executeAction']),
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
        console.log("base config ", baseName, baseConfig)
        if (!baseConfig.document_content) {
          console.log("Base has no contents ", baseName)
          continue
        }
        var baseSchema = baseConfig.document_content[0].contents;
        var baseSchemaJson = JSON.parse(atob(baseSchema));
        console.log("Base config", baseSchemaJson);
        if (!that.workspaceSchema.workspaceItems[baseName]) {
          that.workspaceSchema.workspaceItems[baseName] = [];
        }
        for (var j in baseSchemaJson.items) {
          var item = baseSchemaJson.items[j];
          item.baseName = baseName;
          if (item.item_type === "summary") {
            that.workspaceSchema.workspaceItems[baseName].push(item)
          }
        }


      }


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
      let queryPayload = {
        tableName: "document",
        params: {
          query: JSON.stringify([{
            column: "document_path",
            operator: "is",
            value: "/" + that.workspaceName
          }, {
            column: "mime_type",
            operator: "like",
            value: "workspace/base"
          }]),
          page: {
            size: 100,
          },
          included_relations: "document_content"
        }
      };

      that.files = [];
      console.log("Query data")

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
