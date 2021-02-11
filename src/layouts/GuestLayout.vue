<template>
  <q-layout view="lHh Lpr lFf">

    <div v-if="documents.length === 0">

            <q-page-container>
              <q-page>
                <router-view></router-view>

              </q-page>
            </q-page-container>


    </div>
    <div v-if="documents.length > 0" class="row">
      <div class="col-12" style="height: 48px">
        <guest-header-bar @login="rightDrawerOpen = !rightDrawerOpen" :on-back="false" :buttons="[]"
                          :title="currentItem ? currentItem.document_name : 'Home'"></guest-header-bar>
      </div>
      <div class="col-12">

        <component v-if="currentItem" :is="baseItemComponentMap[currentItem.document_extension]"
                   :baseItem="baseItemConfigMap[currentItem.document_name]"
        ></component>

      </div>
    </div>

    <q-drawer class="bg-primary" side="left" v-model="leftDrawerOpen" v-if="documents.length > 0">
      <q-scroll-area style="height: 100vh">
        <q-list bordered>
          <q-item-label header><span class="text-bold">Workspaces</span></q-item-label>
        </q-list>
        <q-list bordered :key="workspace" v-for="(workspace) in workspaces">
          <q-item-label header>{{ workspace }}</q-item-label>
          <q-item :active="currentItem === item" active-class="bg-primary text-white" clickable
                  @click="setCurrentItem(item)" v-for="item in workspaceMap[workspace].items"
                  :key="item.document_name">
            <q-item-section avatar>
              <q-icon v-if="baseItemTypes()[item.document_extension]"
                      :name="baseItemTypes()[item.document_extension].icon"/>
            </q-item-section>
            <q-item-section>
              <q-item-label lines="1">{{ item.document_name }}</q-item-label>
              <q-item-section side class="text-black">{{ item.document_path.split("/")[2] }}</q-item-section>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>


    <q-drawer overlay class="bg-primary"
              :width="300"
              side="right" v-model="rightDrawerOpen" v-if="documents.length > 0">
      <router-view/>
    </q-drawer>


  </q-layout>


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
    setCurrentItem(item) {
      const that = this;
      that.currentItem = null;
      that.$nextTick().then(function () {
        that.currentItem = item
      })
    },
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

    that.loadModel(["world", "document", "user_account"]).then(function () {

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
      console.log("No models available, lets wait for login", err);
      that.$q.notify({
        message: "Unable to connect to backend"
      })
      that.$router.push("/backend")
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
