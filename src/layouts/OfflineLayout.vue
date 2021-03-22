<template>

    <router-view/>


</template>

<script>
import {mapActions, mapGetters} from "vuex";
import BaseViewContainer from "pages/UserApps/BaseViewContainer";

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}


export default {
  name: 'GuestLayout',

  components: {BaseViewContainer},
  methods: {
    ...mapActions(['loadModel', 'loadData'])
  },
  meta() {
    return {
      // this accesses the "title" property in your Vue "data";
      // whenever "title" prop changes, your meta will automatically update
      title: !this.currentItem ? 'Login' : this.currentItem.document_name
    }
  },
  computed: {
    workspaces() {
      const that = this;
      var workspaces = this.documents.map(function (e) {
        let workspaceName = e.document_path.split("/")[1];
        if (!that.workspaceMap[workspaceName]) {
          that.workspaceMap[workspaceName] = {
            items: []
          }
        }
        that.workspaceMap[workspaceName].items.push(e);
        return workspaceName;
      }).filter(onlyUnique);
      workspaces.sort(function (a, b) {
        return a.toLowerCase() > b.toLowerCase();
      })
      console.log("Workspace name", workspaces)

      return workspaces;
    }
  },
  mounted() {
    console.log("mounted guest layout", this.documentTable())
    const that = this;
    that.$q.loading.show();

    that.loadModel(["world", "document"]).then(async function () {

      that.loadData({
        tableName: 'document',
        params: {
          page: {
            size: 10,
          },
          query: JSON.stringify([{
            column: "mime_type",
            operator: "like",
            value: "workspace/%",
          }]),
          included_relations: "document_content"
        }
      }).then(function (res) {
        that.$q.loading.hide();
        console.log("document table is public", res.data);
        that.documents = res.data;
        if (that.documents.length > 0) {
          that.leftDrawerOpen = true;
        }
        for (let i = 0; i < that.documents.length; i++) {
          var item = that.documents[i];

          let baseItemConfig = item;
          if (item.document_content) {
            try {
              var extendConfig = JSON.parse(atob(item.document_content[0].contents))
              baseItemConfig = {...item, ...extendConfig};
            } catch (e) {
              console.log("Failed to read contents of item", e, item)
              baseItemConfig = item;
            }
          }

          if (!baseItemConfig.targetTable) {
            if (baseItemConfig.attributes && baseItemConfig.attributes.TableName) {
              baseItemConfig.targetTable = that.tableMap[baseItemConfig.attributes.TableName]
            } else if (baseItemConfig.target && baseItemConfig.target.name) {
              baseItemConfig.targetTable = that.tableMap[baseItemConfig.target.name]
            }
          }

          that.baseItemConfigMap[item.document_name] = baseItemConfig;

          if (item.mime_type !== "workspace/root" && item.mime_type !== "workspace/base") {
            if (that.currentItem === null) {
              if (!that.$route.params.document_name) {
                that.currentItem = item;
                that.$router.push('/guest/' + item.document_name)
              } else if (that.$route.params.document_name === item.document_name) {
                that.currentItem = item;
              }
            }
          }
        }

      }).catch(function (err) {
        that.$q.loading.hide();
        console.log("Document table is not public", err)
      });


    }).catch(function (err) {
      that.$q.loading.hide();
      console.log("No models available, lets wait for login", err)
    })


  },

  data() {
    return {
      leftDrawerOpen: false,
      baseItemConfigMap: {},
      currentItem: null,
      baseItemComponentMap: {
        'view': 'edit-data-table',
        'table': 'edit-data-table',
        'document': 'document-editor',
        'folder': 'file-browser',
        'spreadsheet': 'spreadsheet-editor',
        'calendar': 'calendar-view',
      },
      rightDrawerOpen: false,
      workspaceMap: {},
      documents: [],
      ...mapGetters(['documentTable', 'baseItemTypes']),
    }
  }
}
</script>
