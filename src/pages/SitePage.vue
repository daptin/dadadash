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
            <q-btn icon="add" flat @click="showCreateSiteDrawer = true"/>
            <q-btn icon="delete" disable flat @click="$router.push('/tables/create')"/>
          </q-btn-group>
        </div>
      </div>



      <div class="row">

        <div class="col-12">
          <q-markup-table flat>
            <thead>
            <tr style="text-align: left">
              <th>Sites</th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="site in sites.filter((e) => {
              if (nameFilter) {
                return e.name.indexOf(nameFilter) > -1;
              } else {
                return true;
              }
            })" style="cursor: pointer">
              <td>{{ site.name }}</td>
              <td>{{ site.enable_https }}</td>
              <td>{{ site.ftp_enabled }}</td>
              <td class="text-right">
                <q-btn-group flat>
                  <q-btn
                         @click="$router.push('/site/' + site.reference_id + '/browse')"
                         label="Browse files"
                         icon="folder"
                         class="float-right"></q-btn>
                  <q-btn @click="showEditSite(site)" icon="edit" label="Edit site" class="float-right"></q-btn>
                </q-btn-group>
              </td>
            </tr>
            </tbody>
          </q-markup-table>
        </div>


      </div>


      <q-drawer :breakpoint="1400" overlay content-class="bg-grey-3" side="right" v-model="showCreateSiteDrawer">
        <q-scroll-area class="fit row">
          <div class="q-pa-md">
            <span class="text-h6">Create site</span>
            <q-form class="q-gutter-md">
              <q-input label="Hostname" v-model="newSite.hostname"></q-input>
              <q-input value="/new-site" label="Path" v-model="newSite.path"></q-input>
              <q-select :options="[{label: 'Hugo', value: 'hugo'}, {label: 'Static', value: 'static'}]" value="static"
                      label="Site type" v-model="newSite.site_type" emit-value map-options></q-select>

            <q-select label="Cloud store" :options="stores" option-label="name" option-value="id"
                      v-model="newSite.cloud_store_id"></q-select>

            <q-btn color="primary" @click="createSite()">Create</q-btn>
            <q-btn @click="showCreateSiteDrawer = false">Cancel</q-btn>
          </q-form>
        </div>
      </q-scroll-area>
    </q-drawer>


    <q-drawer overlay content-class="bg-grey-3" :breakpoint="1400" side="right" v-model="showEditSiteDrawer">
      <q-scroll-area class="fit row">

        <div class="q-pa-md">
          <span class="text-h6">Edit site</span>
          <q-form class="q-gutter-md">
            <q-input label="Name" v-model="newSite.name"></q-input>
            <q-input label="Hostname" v-model="newSite.hostname"></q-input>
            <q-input label="Path" v-model="newSite.path"></q-input>
            <q-input label="Site type" v-model="newSite.site_type"></q-input>

            <q-select :options="stores" option-label="name" option-value="id"
                      v-model="newSite.cloud_store_id" emit-value map-options></q-select>


            <q-item>
              <q-item-section>
                <q-item-label>HTTPS</q-item-label>
              </q-item-section>
              <q-item-section>
                <q-btn-toggle size="xs" v-model="newSite.enable_https" :options="[
          {label: !!newSite.enable_https ? 'Enabled' : 'Enable', value: true},
          {label: !newSite.enable_https ? 'Disabled' : 'Disable', value: false}]"></q-btn-toggle>
              </q-item-section>
            </q-item>


            <q-item>
              <q-item-section>
                <q-item-label>FTP</q-item-label>
              </q-item-section>
              <q-item-section>
                <q-btn-toggle size="xs" v-model="newSite.ftp_enabled" :options="[
          {label: newSite.ftp_enabled ? 'Enabled' : 'Enable', value: true},
          {label: !newSite.ftp_enabled ? 'Disabled' : 'Disable', value: false}]"></q-btn-toggle>
              </q-item-section>
            </q-item>

            <q-btn size="sm" color="negative" @click="deleteSite()">Delete</q-btn>
            <q-btn size="sm" class="float-right" color="primary" @click="editSite()">Save</q-btn>
            <q-btn size="sm" class="float-right" @click="showEditSiteDrawer = false">Cancel</q-btn>
          </q-form>
        </div>

      </q-scroll-area>
    </q-drawer>

    <q-drawer :breakpoint="1400" :width="fileDrawerWidth > 800 ? 800 : fileDrawerWidth" side="right" overlay
              v-model="showFileBrowser">
      <q-scroll-area class="fit">
        <file-browser v-if="selectedSite && showFileBrowser" v-on:close="showFileBrowser = false"
                      :site="selectedSite"></file-browser>
      </q-scroll-area>
    </q-drawer>
    </q-page>

  </q-page-container>
</template>

<script>
  import {mapActions, mapGetters, mapState} from 'vuex';

  export default {
    name: 'SitePage',
    methods: {
      syncSite(site) {
        const that = this;
        that.executeAction({
          tableName: "site",
          actionName: "sync_site_storage",
          params: {
            site_id: site.id,
            path: "",
          }
        })
      },

      showEditSite(site) {
        this.selectedSite = site;
        this.showEditSiteDrawer = true;
        this.showFileBrowser = false;
        this.newSite.hostname = site.hostname;
        this.newSite.name = site.hostname;
        this.newSite.path = site.path;
        this.newSite.enable_https = site.enable_https === 1 || !!site.enable_https;
        this.newSite.ftp_enabled = site.ftp_enabled;
        this.newSite.site_type = site.site_type;
        this.newSite.cloud_store_id = site.cloud_store_id;
      },
      deleteSite() {
        const that = this;
        console.log("Delete site", this.selectedSite);
        this.deleteRow({
          tableName: "site",
          reference_id: this.selectedSite.id
        }).then(function (res) {
          that.showEditSiteDrawer = false;
          that.selectedSite = {};
          that.$q.notify({
            title: "Success",
            message: "Site deleted"
          });
          that.refresh()
        }).catch(function (res) {
          that.$q.notify({
            title: "Failed",
            message: JSON.stringify(res)
          })
        })
      },
      editSite() {
        const that = this;
        console.log("Edit site", this.selectedSite, this.newSite);
        this.newSite.tableName = "site";
        this.newSite.id = this.selectedSite.id;
        this.newSite.cloud_store_id = {
          id: this.newSite.cloud_store_id,
          type: "cloud_store"
        };
        this.updateRow(this.newSite).then(function (res) {
          that.showEditSiteDrawer = false;
          that.selectedSite = {};
          that.$q.notify({
            title: "Success",
            message: "Site updated"
          });
          that.refresh()
        }).catch(function (res) {
          that.$q.notify({
            title: "Failed",
            message: JSON.stringify(res)
          })
        })
      },
      createSite() {
        const that = this;
        console.log("new site", this.newSite);
        this.newSite.tableName = "site";

        that.executeAction({
          tableName: "cloud_store",
          actionName: "create_site",
          params: {
            cloud_store_id: this.newSite.cloud_store_id.id,
            hostname: this.newSite.hostname,
            path: this.newSite.path,
            site_type: this.newSite.site_type
          }
        }).then(function (res) {
          that.user = {};
          that.$q.notify({
            message: "Site created"
          });
          that.refresh();
          that.showCreateSiteDrawer = false;
        }).catch(function (e) {
          console.log("Failed to create site", e);
          if (e instanceof Array) {
            that.$q.notify({
              message: e[0].title
            })
          } else {
            that.$q.notify({
              message: "Failed to create site"
            })
          }
        });

        // that.createRow(that.newSite)


      },
      ...mapActions(['loadData', 'getTableSchema', 'createRow', 'deleteRow', 'updateRow', 'executeAction']),
      refresh() {
        var tableName = "site";
        const that = this;
        this.loadData({
          tableName: tableName,
          params: {
            included_relations: "cloud_store_id"
          }
        }).then(function (data) {
          console.log("Loaded data", data);
          that.sites = data.data.map(function (r) {
            r.ftp_enabled = r.ftp_enabled === 1 || r.ftp_enabled === true;
            return r;
          });
        });
        that.loadData({tableName: 'cloud_store'}).then(function (res) {
          that.stores = res.data;
        })
      }
    },
    data() {
      return {
        text: '',
        showHttpEdit: false,
        nameFilter: null,
        fileList: [],
        currentSite: null,
        showFileBrowser: false,
        stores: [],
        selectedSite: {},
        siteProviderOptions: [
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
        showHelp: false,
        newSite: {
          name: null,
          hostname: null,
          path: null,
          site_type: null,
          cloud_store_id: null,
          ftp_enabled: false,
          enable_https: false
        },
        showCreateSiteDrawer: false,
        showEditSiteDrawer: false,
        filter: null,
        sites: [],
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
      console.log("Site page scope", this, window.screen.availWidth)
      this.refresh();
    },
    computed: {
      fileDrawerWidth() {
        return window.screen.availWidth;
      },
      ...mapGetters(['selectedTable']),
      ...mapState([])
    },

    watch: {}
  }
</script>
