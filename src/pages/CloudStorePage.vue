<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <q-page-container>
    <q-page>

      <div class="row">
        <div class="col-4">
          <q-input dense v-model="nameFilter" icon="search" label="search">
            <template v-slot:prepend>
              <q-icon name="search"/>
            </template>
          </q-input>
        </div>
      </div>
      <div class="row" style="border-top: 1px solid black; border-bottom: 1px solid black">
        <div class="col-1">
          <q-btn-group flat size="sm">
            <q-btn icon="add" flat @click="showCreateCloudStoreDrawer = true"/>
            <q-btn icon="delete" disable flat @click="$router.push('/tables/create')"/>
          </q-btn-group>
        </div>
      </div>


      <div class="row">
        <div class="col-12">
          <q-markup-table flat>
            <thead>
            <tr style="text-align: left">
              <th>Storage</th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="cloudStore in cloudStores.filter((e) => {
              if (nameFilter) {
                return e.name.indexOf(nameFilter) > -1;
              } else {
                return true;
              }
            })" style="cursor: pointer" @click="showEditStore(cloudStore)">
              <td>{{ cloudStore.name }}</td>
              <td>{{ cloudStore.store_provider }}</td>
              <td>{{ cloudStore.root_path }}</td>
              <td class="text-right">
                <q-btn color="black" flat icon="fas fa-wrench"></q-btn>
              </td>
            </tr>
            </tbody>
          </q-markup-table>
        </div>

      </div>


      <q-drawer overlay content-class="bg-grey-3" :width="400" side="right" v-model="showCreateCloudStoreDrawer">
      <q-scroll-area class="fit row">
        <div class="q-pa-md bg-white" style="border-left: 1px solid #eee">
          <span class="text-h6">Create store</span>
          <q-form class="q-gutter-md">
            <q-input label="Name" v-model="newStore.name"></q-input>


            <q-input label="Root path" v-model="newStore.root_path"></q-input>
            <q-input label="Provider" v-model="newStore.store_provider"></q-input>


            <q-btn color="primary" @click="createStore()">Create</q-btn>
            <q-btn @click="showCreateCloudStoreDrawer = false">Cancel</q-btn>
          </q-form>
        </div>
      </q-scroll-area>
    </q-drawer>


    <q-drawer overlay content-class="bg-grey-3" :width="400" side="right" v-model="showEditCloudStoreDrawer">
      <q-scroll-area class="fit row">
        <div class="q-pa-md">
          <span class="text-h6">Edit store</span>
          <q-form class="q-gutter-md">
            <q-input label="Name" v-model="newStore.name"></q-input>


            <q-input label="Root path" v-model="newStore.root_path"></q-input>

            <q-btn color="negative" @click="deleteStore()">Delete</q-btn>
            <q-btn class="float-right" color="primary" @click="editStore()">Save</q-btn>
            <q-btn class="float-right" @click="showEditCloudStoreDrawer = false">Cancel</q-btn>
          </q-form>
        </div>
      </q-scroll-area>
    </q-drawer>

    </q-page>



  </q-page-container>
</template>

<script>
  import {mapActions, mapGetters, mapState} from 'vuex';

  export default {
    name: 'CloudStorePage',
    methods: {
      // listFiles(store) {
      //   console.log("list files in cloud store", store)
      //   const that = this;
      //   that.executeAction({
      //     tableName: "cloud_store",
      //     actionName: "list_files",
      //     params: {
      //       cloud_store_id: store.id
      //     }
      //   }).then(function (res) {
      //     console.log("list files Response", res)
      //   }).catch(function (err) {
      //     console.log("failed to list files", err)
      //   })
      // },
      showEditStore(store) {
        this.selectedStore = store
        this.showEditCloudStoreDrawer = true
        this.newStore.name = store.name;
        this.newStore.root_path = store.root_path;
      },
      deleteStore() {
        const that = this;
        console.log("Delete store", this.selectedStore);
        this.deleteRow({
          tableName: "cloud_store",
          reference_id: this.selectedStore.id
        }).then(function (res) {
          that.showEditCloudStoreDrawer = false;
          that.selectedStore = {};
          that.$q.notify({
            title: "Success",
            message: "Store deleted"
          });
          that.refresh()
        }).catch(function (res) {
          that.$q.notify({
            title: "Failed",
            message: JSON.stringify(res)
          })
        })
      },
      editStore() {
        const that = this;
        console.log("Delete store", this.selectedStore);
        this.newStore.tableName = "cloud_store";
        this.newStore.id = this.selectedStore.id;
        this.updateRow(this.newStore).then(function (res) {
          that.showEditCloudStoreDrawer = false;
          that.selectedStore = {};
          that.$q.notify({
            title: "Success",
            message: "Store updated"
          });
          that.refresh()
        }).catch(function (res) {
          that.$q.notify({
            title: "Failed",
            message: JSON.stringify(res)
          })
        })
      },
      createStore() {
        const that = this;
        console.log("new cloud", this.newStore);
        this.newStore.tableName = "cloud_store";
        that.createRow(that.newStore).then(function (res) {
          that.user = {};
          that.$q.notify({
            message: "cloud store created"
          });
          that.refresh();
          that.showCreateCloudStoreDrawer = false;
        }).catch(function (e) {
          if (e instanceof Array) {
            that.$q.notify({
              message: e[0].title
            })
          } else {
            that.$q.notify({
              message: "Failed to create cloud"
            })
          }
        });
      },
      ...mapActions(['loadData', 'getTableSchema', 'createRow', 'deleteRow', 'updateRow', 'executeAction']),
      refresh() {
        var tableName = "cloud_store";
        const that = this;
        this.loadData({tableName: tableName}).then(function (data) {
          console.log("Loaded data", data);
          that.cloudStores = data.data;
        })
      }
    },
    data() {
      return {
        text: '',
        selectedStore: {},
        nameFilter: null,
        showHelp: false,
        storeProviderOptions: [
          {
            icon: 'fas fa-aws',
            label: 'Amazon Drive',
            description: 'OAuth token based'
          },
          {
            icon: 'fas fa-aws',
            label: 'Amazon S3',
            description: 'OAuth token based'
          },
          {
            icon: 'fas fa-aws',
            label: 'Backblaze B2',
            description: 'OAuth token based'
          },
          {
            icon: 'fas fa-aws',
            label: 'Dropbox',
            description: 'OAuth token based'
          },
          {
            icon: 'fas fa-aws',
            label: 'FTP',
            description: 'OAuth token based'
          },
          {
            icon: 'fas fa-aws',
            label: 'Google Drive',
            description: 'OAuth token based'
          },
          {
            icon: 'fas fa-aws',
            label: 'local',
            description: 'The local filesystem'
          },
        ],
        newStore: {
          name: null,
          store_provider: 'local',
          store_type: 'local',
          root_path: null,
          store_parameters: '{}',
        },
        showCreateCloudStoreDrawer: false,
        showEditCloudStoreDrawer: false,
        filter: null,
        cloudStores: [],
        columns: [
          {
            name: 'name',
            field: 'name',
            label: 'cloud name',
            align: 'left',
            sortable: true,
          }
        ],
        ...mapState([])
      }
    },
    mounted() {
      this.refresh();
    },
    computed: {
      ...mapGetters(['selectedTable']),
      ...mapState([])
    },

    watch: {}
  }
</script>
