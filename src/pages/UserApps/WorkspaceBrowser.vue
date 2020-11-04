<template>

  <q-layout>
    <q-page-container style="height: 100vh; overflow: hidden;">


      <q-dialog v-model="newNamePrompt" persistent>
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Name</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input dense v-model="newName" autofocus @keyup.enter="createNew()"/>
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn flat label="Cancel" v-close-popup/>
            <q-btn flat label="Create" @click="createNew()" v-close-popup/>
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-page>
        <user-header-bar style="border-bottom: 1px solid black" @search="searchDocuments" @show-uploader="showUploader"
                         :buttons="{
        before: [
            {icon: 'fas fa-search', event: 'search'},
          ],
        after: [
            {icon: 'fas fa-sync-alt', event: 'search'},
          ],
        }"></user-header-bar>

        <div style="height: 100vh; overflow-y: scroll" class="row">
          <div class="col-2 col-sm-12 col-md-2 col-lg-2 col-xl-2 col-xs-12">
            <q-card v-if="selectedFile && !selectedFile.is_dir" flat style="background: transparent;">
              <q-card-section>
                <span class="text-bold">{{ selectedFile.name }}</span><br/>
              </q-card-section>
              <q-card-section>
                Size <span class="text-bold">{{ parseInt(selectedFile.document_content[0].size / 1024) }} Kb</span>
                <br/>
                Type <span class="text-bold">{{ selectedFile.mime_type }}</span>
              </q-card-section>
              <q-card-section>
                <q-list separator bordered>
                  <q-item clickable @click="fileDownload(selectedFile)">
                    <q-item-section>Download</q-item-section>
                  </q-item>
                  <q-item clickable v-if="isEditable(selectedFile)"
                          @click="openEditor(selectedFile)">
                    <q-item-section>Open</q-item-section>
                  </q-item>
                  <q-item clickable v-if="isViewable(selectedFile)"
                          @click="openViewer(selectedFile)">
                    <q-item-section>View</q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>


            <q-card flat style="background: white">
              <q-card-section>
                <q-btn style="width: 100%; height: 38px" @click="showNewWorkspace = true" color="primary"
                       icon="library_add" label="Add workspace"></q-btn>
              </q-card-section>

              <q-card-section>

                <q-tree
                  :nodes="workspaceTree"
                  accordion
                  no-connectors
                  node-key="label"
                  :expanded.sync="expanded"
                >
                  <template v-slot:default-header="prop" class="workspace-title">
                    <div class="row items-center" v-if="prop.node.mime_type  === 'root'">
                      <div style="font-weight: 400; text-transform: uppercase" class=" text-primary">{{
                          prop.node.label
                        }}
                      </div>
                    </div>
                    <div class="row cursor-pointer " @click="openWorkspace(prop.node)"
                         v-if="prop.node.mime_type  === 'workspace/root'">
                      <q-icon name="fas fa-briefcase" color="primary" size="14px" class="q-mr-sm"/>
                      <div style="text-transform: capitalize">{{
                          prop.node.label
                        }}
                      </div>
                    </div>
                  </template>

                  <template v-slot:default-body="prop">
                    <div v-if="prop.node.story">
                      <span class="text-weight-bold">This node has a story</span>: {{ prop.node.story }}
                    </div>
                  </template>
                </q-tree>

              </q-card-section>

            </q-card>
          </div>
          <div class="col-10 col-sm-12 col-md-10 col-lg-10 col-xl-10 col-xs-12" style="background: #F2F1F9">
            <new-workspace-screen v-if="showNewWorkspace" @new-workspace-created="refreshData"></new-workspace-screen>
            <workspace-view :workspace-name="currentWorkspace"
                            v-if="!showNewWorkspace && currentWorkspace"></workspace-view>

          </div>
        </div>
        <!--      <q-page-sticky :offset="[10, 10]" v-if="showUploadComponent">-->
        <!--        -->
        <!--      </q-page-sticky>-->
      </q-page>


    </q-page-container>
  </q-layout>
</template>
<style>
/*.workspace-title:hover {*/
/*  background: rgba(80, 52, 164, 0.1);*/
/*}*/
</style>
<script>

import {mapActions, mapGetters} from "vuex";

function base64ToArrayBuffer(base64) {
  var binaryString = window.atob(base64);
  var binaryLen = binaryString.length;
  var bytes = new Uint8Array(binaryLen);
  for (var i = 0; i < binaryLen; i++) {
    var ascii = binaryString.charCodeAt(i);
    bytes[i] = ascii;
  }
  return bytes;
}

function saveByteArray(reportName, fileType, byte) {
  var blob = new Blob([byte], {type: fileType});
  var link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  var fileName = reportName;
  link.download = fileName;
  link.click();
}


export default {

  name: "WorkspaceBrowser",
  // NOTICE meta is a function here, which is the way
  // for you to reference properties from the Vue component's scope
  meta() {
    return {
      // this accesses the "title" property in your Vue "data";
      // whenever "title" prop changes, your meta will automatically update
      title: (this.currentWorkspace || 'Home') + " - Workspace"
    }
  },

  watch: {
    'currentPath': function (newVal) {
      console.log("Current path changed", newVal);
      localStorage.setItem("_last_current_path", newVal)
    },
    '$route.params.currentWorkspace': function (newVal) {
      console.log("Workspace changed", newVal)
    }
  },
  methods: {
    openWorkspace(workspace) {
      console.log("open workspace", workspace)
      this.$router.push("/apps/workspace/" + workspace.label)
      this.currentWorkspace = workspace.label;
    },
    searchDocuments(query) {
      console.log("search documents", query);
      this.refreshData(query);
    },
    itemRename(file) {
      console.log("rename item", file);
    },
    fileDblClicked(file) {
      console.log("Item double click", file)
      if (file.is_dir) {
        this.fileDownload(file);
      } else if (this.isEditable(file)) {
        this.openEditor(file)
      } else if (this.isViewable(file)) {
        this.openViewer(file)
      } else {
        this.fileDownload(file);
      }

    },
    isEditable(selectedFile) {
      // console.log("Check file is editable", selectedFile)
      var ext = ["ddoc", "dsheet"]
      let fileExtension = "";
      if (selectedFile.document_name.indexOf(".") > -1) {
        fileExtension = selectedFile.document_name.split(".")[1];
      }
      console.log("Check file extension", fileExtension)

      return ext.filter(function (r) {
        return r === fileExtension
      }).length > 0;
    },
    isViewable(selectedFile) {
      // console.log("Check file is editable", selectedFile)
      var ext = ["jpg", "png", "gif", "txt", "pdf", "mp4", "mp3", "wav", "mkv"]
      let fileExtension = "";
      if (selectedFile.document_name.indexOf(".") > -1) {
        fileExtension = selectedFile.document_name.split(".")[1];
      }
      return ext.filter(function (r) {
        return r === fileExtension
      }).length > 0;
    },
    openEditor(file) {
      var fileExtention = file.document_name.split(".")[1]
      switch (fileExtention) {
        case "ddoc":
          this.$router.push('/apps/document/' + file.reference_id)
          return;
        case "dsheet":
          this.$router.push('/apps/spreadsheet/' + file.reference_id)
          return;
      }
    },
    openViewer(file) {
      var fileExtension = file.document_name.split(".")[1]
      switch (fileExtension) {
        case "ddoc":
          this.$router.push('/apps/document/' + file.reference_id)
          return;
        case "dsheet":
          this.$router.push('/apps/spreadsheet/' + file.reference_id)
          return;
      }
    },
    itemDelete(file) {
      console.log("Delete file", file);
      const that = this;
      this.deleteRow({
        tableName: "document",
        reference_id: file.reference_id
      }).then(function () {
        that.refreshData();
      }).catch(function (er) {
        that.$q.notify({
          message: er[0].title
        })
      })
    },
    fileClicked(file) {
      console.log("file clicked", file)
      this.selectedFile = file;
    },
    fileDownload(file) {
      const that = this;
      console.log("File clicked", file);
      if (file.is_dir) {
        if (file.name === ".") {
          that.refreshData();
        } else if (file.name === "..") {
          let pathParts = this.currentPath.split("/");
          if (pathParts.length > 1) {
            pathParts.pop();
          }
          let newPath = pathParts.join("/");
          console.log("one level up %s", newPath)
          this.currentPath = newPath
        } else {
          that.currentPath = file.document_path + file.name
        }
        that.refreshData();
      } else {
        that.$q.loading = true;
        that.loadData({
          tableName: "document",
          params: {
            query: JSON.stringify([{
              column: "reference_id",
              operator: "is",
              value: file.reference_id
            }]),
            page: {
              size: 1,
            }
          }
        }).then(function (res) {
          that.$q.loading = false;
          // console.log("File ", res.data[0].document_content[0].contents);
          const file = res.data[0];
          saveByteArray(file.document_name, file.mime_type, base64ToArrayBuffer(res.data[0].document_content[0].contents))
        })

      }
    },
    createNew() {
      console.log("Create ", this.newNameType, this.newName, this.currentPath);
      const that = this;
      var newRow = {
        document_name: this.newName,
        tableName: "document",
        document_extension: this.newName.indexOf(".") > -1 ? this.newName.split(".")[1] : "",
        mime_type: '',
        document_path: this.currentPath + "/",
        document_content: [{
          name: this.newName,
          type: "text/plain",
          path: this.currentPath,
          contents: "data:base64," + btoa(""),
        }],
      }
      if (this.newNameType === "folder") {
        newRow.document_extension = "folder"
        newRow.document_content = []
      }

      this.createRow(newRow).then(function (res) {
        // resolve(file);
        that.refreshData();
        that.newNamePrompt = false;
      }).catch(function (e) {
        console.log("Failed to create", e)
        that.$q.notify({
          message: JSON.stringify(e)
        });
      });


    },
    ...mapActions(['loadData', 'createRow', 'loadModel', 'deleteRow']),
    handleDataLoad(workspaceListResponse) {
      const that = this;
      if (workspaceListResponse.data === null) {
        that.$q.notify({
          message: "Error fetching files"
        })
        return
      }
      console.log("Documents ", workspaceListResponse);
      that.files = workspaceListResponse.data.map(function (e) {
        // e.color = "white"
        e.icon = "fas fa-folder"
        e.is_dir = true
        e.color = "rgb(224, 135, 94)"

        return e;
      });

      that.workspaceTree[0].children = that.files.map(function (e) {
        return {
          label: e.document_name,
          icon: e.icon,
          mime_type: e.mime_type
        }
      })
      if (that.workspaceTree[0].children.length > 0) {
        that.expanded.push(that.workspaceTree[0].children[0].label);
        if (!this.currentWorkspace) {
          that.$router.push('/apps/workspace/' + that.workspaceTree[0].children[0].label);
        }
      }


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
          }]),
          page: {
            size: 100,
          },
        }
      };
      if (searchTerm && searchTerm.trim().length > 0) {
        queryPayload.params.query = JSON.stringify([
          {
            column: "document_name",
            operator: "contains",
            value: searchTerm
          }
        ])
      }


      that.files = [];
      console.log("Query data")

      that.loadData(queryPayload).then(function (res) {
        console.log("data load complete", that.currentWorkspace, res);
        if (!that.currentWorkspace && res.data.length > 0) {
          that.currentWorkspace = res.data[0].document_name;
          that.$router.push('/apps/workspace/' + that.currentWorkspace)
        }
        that.handleDataLoad(res)
      });


    },
    ensureDirectory(workspaceName) {
      const that = this;
      if (workspaceName === "/") {
        return
      }
      if (that.workspaceEnsureCache[workspaceName]) {
        return
      }
      that.workspaceEnsureCache[workspaceName] = true

      var pathParts = workspaceName.split("/");
      var dirName = pathParts[pathParts.length - 1];
      pathParts.pop()
      var parentDir = pathParts.join("/") + "/";

      console.log("Ensure directory", workspaceName)
      let query = [{
        "column": "document_name",
        "operator": "is",
        "value": dirName
      }, {
        "column": "document_path",
        "operator": "is",
        "value": "/"
      }, {
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
          console.log("Directory does not exist", workspaceName);
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
            that.refreshData();
          }).catch(function (e) {
            console.log("Failed to create folder", e)
            that.$q.notify({
              message: "Failed to create folder: " + JSON.stringify(e)
            });
          });


        }
      })
    },
    uploadFile(file, fileName) {
      // console.log("Upload file", file);
      const that = this;
      file.status = "Queued"

      var uploadFile1 = function (fileToUpload) {
        return new Promise(function (resolve, reject) {
          const name = fileName || fileToUpload.name;
          const type = fileToUpload.type;
          const reader = new FileReader();
          file.status = "Reading"
          reader.onload = function (fileResult) {
            // console.log("File loaded", fileToUpload, fileResult);
            file.status = "Uploading"
            let documentPath = that.currentPath + "/";
            if (fileToUpload.webkitRelativePath && fileToUpload.webkitRelativePath.length > 0) {
              var relPath = fileToUpload.webkitRelativePath.split("/");
              relPath.pop(); //remove name
              documentPath = that.currentPath + "/" + relPath.join("/") + "/"
            }
            var pathParts = documentPath.split("/")
            if (pathParts.length > 2) {
              pathParts.pop();
              that.ensureDirectory(pathParts.join("/"))
            }
            var obj = {
              tableName: "document",
              document_content: [{
                name: fileName || fileToUpload.name,
                contents: fileResult.target.result,
                type: fileToUpload.type,
                path: documentPath
              }],
              document_name: fileName || fileToUpload.name,
              document_path: documentPath,
              mime_type: fileToUpload.type,
              document_extension: fileToUpload.name.indexOf(".") > -1 ? fileToUpload.name.split(".")[1] : "",
            }
            that.createRow(obj).then(function () {
              file.status = "Uploaded";
              that.refreshData();
              resolve()
            }).catch(reject);
          };
          reader.onerror = function () {
            console.log("Failed to load file onerror", e, arguments);
            reject(name);
          };
          reader.readAsDataURL(fileToUpload);
        })
      };
      return uploadFile1(file.file)


    },
    showUploader() {
      console.log("show uploader", this.showUploadComponent)
      const that = this;
      this.uploadedFiles = [];
      that.$refs.upload.$el.click()
    },
  },
  data() {
    return {
      searchInput: '',
      showNewWorkspace: false,
      currentWorkspace: null,
      ...mapGetters(['endpoint']),
      workspaceEnsureCache: {},
      newNamePrompt: false,
      workspaceTree: [
        {
          label: 'My Workspaces',
          children: [],
          mime_type: "root"
        },
        {
          label: "Shared workspaces",
          children: [],
          mime_type: "root"
        }
      ],
      expanded: ['My Workspaces'],
      viewMode: 'card',
      uploadedFiles: [],
      newName: '',
      newNameType: '',
      currentPath: '',
      selectedFile: null,
      showSearchInput: false,
      files: [],
      showUploadComponent: false,
      viewParameters: {
        tableName: 'document'
      },
      containerId: "id-" + new Date().getMilliseconds(),
      screenWidth: (window.screen.width < 1200 ? window.screen.width : 1200) + "px",
    }
  },
  unmounted() {
    document.onpaste = null;
    document.ondrop = null;
  },
  mounted() {
    const that = this;
    this.containerId = "id-" + new Date().getMilliseconds();
    console.log("Mounted WorkspaceBrowser", this.containerId, this.$route.params);
    this.currentWorkspace = this.$route.params.workspaceName;

    var lastWorkspace = localStorage.getItem("_last_workspace")
    if (lastWorkspace && !this.currentWorkspace) {
      this.currentWorkspace = lastWorkspace;
    }

    that.refreshData();


  }
}
</script>
