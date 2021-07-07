<template>
  <q-layout>
    <q-drawer side="left" v-model="indexDrawer">
      <div class="q-pa-md">
        <q-tree
          :nodes="simple"
          node-key="label"
          selected-color="primary"
          :selected.sync="selected"
          default-expand-all
        />
      </div>
    </q-drawer>
    <q-page-container>
      <q-page>


        <div class=" ">
          <div class="row ">


            <div class="col-6 q-pa-md">
              <img @click="indexDrawer=true" class="q-pa-sm"
                   style="width: 50px;height: 50px;margin-right: -13px; margin-top: 15px"
                   src="statics/icons/app-logo-128x128.png"/>
              <span class="text-h3 q-pa-md">Daptin</span>
            </div>

          </div>
          <div class="row">
            <div class="col-6 q-pa-md">


              <q-tab-panels
                v-model="selected"
                animated
                transition-prev="jump-up"
                transition-next="jump-up"
              >
                <q-tab-panel name="Start new locally">
                  <div class="row">
                    <div class="col-12">
                      <span class="text-bold">Instructions</span>
                      <ol>
                        <li>Click download and save the server binary</li>
                        <li>Execute the binary with double-click or from CLI</li>
                      </ol>
                    </div>
                    <div class="col-12" v-if="$q.platform.is.win">
                      <q-tabs align="left" v-model="platformTab">
                        <q-tab name="win">
                          Windows
                        </q-tab>
                        <q-tab name="mac">
                          Mac
                        </q-tab>
                        <q-tab name="linux">
                          Linux
                        </q-tab>
                      </q-tabs>
                      <q-tab-panels v-model="platformTab">
                        <q-tab-panel :key="platform" :name="platform"
                                     v-for="platform in Object.keys(downloadOptions)">
                          <q-btn size="lg" align="center" color="green" :label="'Download for ' + platform"
                                 @click="downloadByPlatform(downloadOptions[platform])"></q-btn>
                        </q-tab-panel>
                      </q-tab-panels>
                    </div>
                    <div class="col-8 offset-2" v-if="downloadProgress !== null">
                      <q-linear-progress style=" border: 1px solid black; border-radius: 4px"
                                         size="20px" :value="downloadProgress"
                                         dark stripe rounded color="green" class="q-mt-sm"/>
                    </div>
                  </div>
                </q-tab-panel>

                <q-tab-panel name="Connect to existing local server">
                  <div class="text-h4 q-mb-md">Enter daptin endpoint</div>

                  <div class="row">
                    <div class="col-12">
                      <q-input label="Endpoint" v-model="newEndpoint" value="http://localhost:6336"></q-input>
                    </div>
                  </div>
                  <div class="row" style="padding-top: 10px">
                    <div class="col-6">
                      <q-btn @click="testConnectionWithEndpoint()" label="Test connection"
                             class="bg-grey-1 float-left"></q-btn>
                    </div>
                    <div class="col-6">
                      <q-btn @click="connectAndResumeApp()" color="green" class="float-right" label="Connect"></q-btn>
                    </div>
                  </div>
                </q-tab-panel>


              </q-tab-panels>

            </div>
          </div>
        </div>

      </q-page>
    </q-page-container>
  </q-layout>

</template>

<script>
import {mapActions} from "vuex";

const {Octokit} = require("@octokit/rest");

import axios from "axios";

var request = require('request');
var fs = require('fs');
const octokit = new Octokit();

const DEFAULT_DOWNLOAD_CONFIG = require("./default-download-config.json");

export default {
  name: "ServiceIndex",
  methods: {
    ...mapActions(['initDaptinClient']),
    testConnectionWithEndpoint() {
      const that = this;
      console.log("Test with endpoint", this.newEndpoint);
      axios({
        url: this.newEndpoint + "/meta?query=column_types"
      }).then(function (res) {
        console.log("meta response", res);
        that.$q.notify({
          type: "positive",
          message: "Connection was successful"
        })
      }).catch(function (err) {
        console.log("Failed to connect with the instance", err);
        that.$q.notify({
          type: "negative",
          message: "Failed to connect at " + that.newEndpoint
        })
      })
    },
    connectAndResumeApp() {
      const that = this;
      console.log("Test with endpoint", this.newEndpoint);
      axios({
        url: this.newEndpoint + "/meta?query=column_types"
      }).then(function (res) {
        that.$q.notify({
          type: "positive",
          message: "Redirecting"
        })
        localStorage.setItem("DAPTIN_ENDPOINT", that.newEndpoint);
        localStorage.removeItem("token");
        that.initDaptinClient().then(function (res) {
          that.$router.push('/')
        }).catch(function (err) {
          console.log("Failed to connect with the instance", err);
          that.$q.notify({
            type: "negative",
            message: "Failed to connect at " + that.newEndpoint
          })
        })
        // window.location = "/";
      }).catch(function (err) {
        console.log("Failed to connect with the instance", err);
        that.$q.notify({
          type: "negative",
          message: "Failed to connect at " + that.newEndpoint
        })
      })
    },
    async downloadByPlatform(downloadOption) {
      const that = this;
      console.log("Download by url", downloadOption);
      var urlParts = downloadOption.downloadUrl.split('/');
      var binaryName = urlParts[urlParts.length - 1];


      const window = this.$q.electron.remote.BrowserWindow.getFocusedWindow();

      setTimeout(function () {
        that.selected = "Connect to existing local server";
      })

      window.loadURL(downloadOption.downloadUrl, {}).then(function (res) {
        console.log("loaded", res);
      })

    },
    loadDownloadUrls() {
      const that = this;
      for (var i = 0; i < that.latestRelease.assets.length; i++) {
        var downloadUrl = that.latestRelease.assets[i].browser_download_url
        // console.log("Download url", downloadUrl);
        if (downloadUrl.indexOf("linux") > -1) {
          if (downloadUrl.indexOf("amd64") > -1) {
            that.downloadOptions.linux.downloadUrl = downloadUrl;
          }
        } else if (downloadUrl.indexOf("windows") > -1) {
          if (downloadUrl.indexOf("amd64") > -1) {
            that.downloadOptions.win.downloadUrl = downloadUrl;
          }
        } else if (downloadUrl.indexOf("darwin") > -1) {
          that.downloadOptions.mac.downloadUrl = downloadUrl;
        } else if (downloadUrl.indexOf("ios") > -1) {
          that.downloadOptions.ios.downloadUrl = downloadUrl;
        }

      }
    }
  },
  mounted() {
    const that = this;
    that.loadDownloadUrls();

    if (that.$q.platform.is.electron) {
      console.log("Override axios adapter")
      // axios.defaults.adapter = require('axios/lib/adapters/http');
    }


    that.platformTab = that.$q.platform.is.platform;
    octokit.request("GET /repos/daptin/daptin/releases")
      .then(({data}) => {
        that.latestRelease = data[0];
        that.loadDownloadUrls();
      }).catch(function () {
      console.log("Are we offline ?")
    });
  },
  data() {
    return {
      splitterModel: 30,
      platformTab: null,
      indexDrawer: true,
      newEndpoint: 'http://localhost:8080',
      downloadProgress: null,
      selected: 'Start new locally',
      latestRelease: DEFAULT_DOWNLOAD_CONFIG,
      downloadOptions: {
        "win": {},
        "mac": {},
        "linux": {},
        "android": {},
        "ios": {},
      },
      simple: [
        {
          label: 'Self hosted',
          children: [
            {
              label: 'Start new locally',
              icon: 'fas fa-play'
            },
            {
              label: 'Connect to existing local server',
              icon: 'fas fa-link'
            },
            {
              label: 'Discover servers',
              icon: 'fas fa-wifi'
            }
          ]
        },
        {
          label: 'Cloud hosted',
          children: [
            {
              label: 'Create new server',
              icon: 'fas fa-chevron-circle-up'
            },
            {
              label: 'Connect to existing server',
              icon: 'fas fa-link'
            },
          ]
        },
      ]
    }
  }
}
</script>

<style scoped>

</style>
