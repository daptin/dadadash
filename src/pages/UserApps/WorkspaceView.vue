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
        <div style="border-radius: 8px" class="col-3 q-pa-md" v-for="item in workspaceSchema.workspaceItems" v-if="item.item_type == 'summary'">
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
            <q-card-section>

            </q-card-section>
          </q-card>

        </div>
      </div>


    </div>
  </div>
</template>

<script>
import {mapActions} from "vuex";
import JSZip from "jszip";

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
      console.log("Summary item ", item)
    },
    addBaseFromCatalog(newBaseName, item) {
      const that = this;
      console.log("Add catalog item", item);
      this.showAddBase = false;
      var schema = item.schema;
      for (var itemIndex in schema.items) {
        const item = schema.items[itemIndex];
        switch (item.item_type) {
          case "table":
            that.workspaceSchema.workspaceItems.push(item)
            break;
          case "summary":
            item.baseName = newBaseName;
            that.workspaceSchema.workspaceItems.push(item)
            break;
          default:
            console.log("Undefined item type", item)
        }
      }
    },
    ...mapActions(['loadData']),
    handleDataLoad(data) {
      const that = this;
      console.log("Configuration for workspace", data);
      this.workspaceDocument = data.data[0];
      if (!this.workspaceDocument.document_content) {
        this.workspaceDocument.document_content = {
          name: that.workspaceName,
          contents: null,
          type: 'workspace/root'
        }
      }
      var workspaceSchema = this.workspaceDocument.document_content.contents;
      if (workspaceSchema) {

        JSZip.loadAsync(atob(workspaceSchema)).then(function (zipFile) {
          // that.contents = atob(that.file.contents);
          zipFile.file("metadata.json").async("string").then(function (data) {
            console.log("Loaded file: ", data)
            that.workspaceSchema = decodeUnicode(data);
          }).catch(function (err) {
            that.workspaceSchema = {
              workspaceItems: [],
              label: this.workspaceName
            }
          });


        }).catch(function (err) {
          console.log("Failed to load zip file", err);
          that.workspaceSchema = {
            workspaceItems: [],
            label: this.workspaceName
          }

        });

      } else {
        that.workspaceSchema = {
          workspaceItems: [],
          label: this.workspaceName
        }
      }
    },
    updateWorkspace(workspaceUpdateSchema) {


      var zip = new JSZip();
      zip.file("contents_encoded.json", encodeUnicode(this.contents));

      zip.generateAsync({type: "base64"}).then(function (base64) {

        that.document.document_content[0].contents = "data:application/dspreadsheet," + base64
        if (that.document.reference_id) {

          that.updateRow(that.document).then(function (res) {
            console.log("Document saved", res);
          }).catch(function (err) {
            console.log("errer", err)
            that.$q.notify({
              message: "We are offline, changes are not being stored"
            })
          })
        } else {
          that.createRow(that.document).then(function (res) {
            that.document = res.data;
            console.log("Spreadsheet created", res);
            that.$router.push('/apps/spreadsheet/' + that.document.reference_id)
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
            value: "/"
          }, {
            column: "mime_type",
            operator: "like",
            value: "workspace/root"
          }, {
            column: "document_name",
            operator: "like",
            value: that.workspaceName
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
        console.log("data load complete", res)
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
