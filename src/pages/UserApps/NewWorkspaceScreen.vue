<template>
  <div class="row">
    <div class="col-6 offset-3">
      <q-form  @submit="createWorkspace">
        <q-card style="background: transparent" flat>
          <q-card-section>
            <span class="text-h4">Create new workspace</span>
          </q-card-section>
          <q-card-section>
            <q-input placeholder="Workspace name" v-model="newWorkspaceName"></q-input>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn size="lg" style="width: 100px" @click="ensureWorkspace" label="Create" color="primary"></q-btn>
          </q-card-actions>
        </q-card>

      </q-form>
    </div>
  </div>
</template>

<script>
import {mapActions} from "vuex";

export default {
  name: "NewWorkspaceScreen.vue",
  methods: {
    ...mapActions(['createRow', 'loadData']),
    ensureWorkspace() {
      let path = this.newWorkspaceName;
      const that = this;
      if (path === "/") {
        return
      }

      var pathParts = path.split("/");
      var dirName = pathParts[pathParts.length - 1];
      pathParts.pop()
      var parentDir = pathParts.join("/") + "/";

      console.log("Ensure directory", path)
      let query = [{
        "column": "document_name",
        "operator": "is",
        "value": dirName
      }, {
        "column": "document_path",
        "operator": "is",
        "value": parentDir
      },{
        "column": "mime_type",
        "operator": "is",
        "value": "workspace/root"
      }, {
        "column": "document_extension",
        "operator": "is",
        "value": "folder"
      }];
      console.log("Document search query", query)
      that.loadData({
        tableName: "document",
        params: {
          query: JSON.stringify(query)
        }
      }).then(function (res) {
        console.log("Ensure directory result", res)
        if (res.data.length === 0) {
          console.log("Directory does not exist", path);
          var newRow = {
            document_name: dirName,
            tableName: "document",
            document_extension: "folder",
            mime_type: 'workspace/root',
            document_path: parentDir,
            document_content: [],
          }
          console.log("Create folder request", newRow)

          that.createRow(newRow).then(function (res) {
            that.$emit("new-workspace-created")
          }).catch(function (e) {
            console.log("Failed to create folder", e)
            that.$q.notify({
              message: "Failed to create folder: " + JSON.stringify(e)
            });
          });


        }
      })
    },
    createWorkspace() {
      const that = this;
      that.createRow({

      })
    },
  },
  data() {
    return {
      newWorkspaceName: null
    }
  }
}
</script>

<style scoped>

</style>
