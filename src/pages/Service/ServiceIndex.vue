<template>
  <q-page-container>
    <q-page>
      <div class="row ">
        <img class="q-pa-sm" style="width: 50px;height: 50px;margin-right: -13px; margin-top: 15px"
             src="statics/icons/app-logo-128x128.png"/>
        <div class="col-10 q-pa-md">
          <span class="text-h3 ">Daptin</span>
        </div>
        <div class="col-12 q-pa-md">
          <q-splitter
            v-model="splitterModel"
            style="height: 400px"
          >

            <template v-slot:before>
              <div class="q-pa-md">
                <q-tree
                  :nodes="simple"
                  node-key="label"
                  selected-color="primary"
                  :selected.sync="selected"
                  default-expand-all
                />
              </div>
            </template>

            <template v-slot:after>
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
                          <q-btn size="lg" align="center" color="primary" :label="'Download for ' + platform"
                                 @click="downloadByPlatform(downloadOptions[platform])"></q-btn>
                        </q-tab-panel>
                      </q-tab-panels>
                    </div>
                    <div class="col-8 offset-2" v-if="downloadProgress !== null">
                      <q-linear-progress style=" border: 1px solid black; border-radius: 4px"
                                         size="20px" :value="downloadProgress"
                                         dark stripe rounded color="primary" class="q-mt-sm"/>
                    </div>
                  </div>
                </q-tab-panel>

                <q-tab-panel name="Connect to existing local server">
                  <div class="text-h4 q-mb-md">Enter daptin endpoint</div>

                  <div class="row">
                    <div class="col-4">
                      <q-input label="Endpoint" v-model="newEndpoint" value="http://localhost:6336"></q-input>
                    </div>
                  </div>
                  <div class="row" style="padding-top: 10px">
                    <div class="col-2">
                      <q-btn @click="testConnectionWithEndpoint()" label="Test connection"
                             class="bg-yellow-9 float-left"></q-btn>
                    </div>
                    <div class="col-2">
                      <q-btn @click="connectAndResumeApp()" color="primary" class="float-right" label="Connect"></q-btn>
                    </div>
                  </div>
                </q-tab-panel>

                <q-tab-panel name="Room service">
                  <div class="text-h4 q-mb-md">Room service</div>
                  <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis praesentium cumque magnam odio iure
                    quidem, quod illum numquam possimus obcaecati commodi minima assumenda consectetur culpa fuga nulla
                    ullam. In, libero.</p>
                  <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis praesentium cumque magnam odio iure
                    quidem, quod illum numquam possimus obcaecati commodi minima assumenda consectetur culpa fuga nulla
                    ullam. In, libero.</p>
                  <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis praesentium cumque magnam odio iure
                    quidem, quod illum numquam possimus obcaecati commodi minima assumenda consectetur culpa fuga nulla
                    ullam. In, libero.</p>
                </q-tab-panel>

                <q-tab-panel name="Room view">
                  <div class="text-h4 q-mb-md">Room view</div>
                  <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis praesentium cumque magnam odio iure
                    quidem, quod illum numquam possimus obcaecati commodi minima assumenda consectetur culpa fuga nulla
                    ullam. In, libero.</p>
                  <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis praesentium cumque magnam odio iure
                    quidem, quod illum numquam possimus obcaecati commodi minima assumenda consectetur culpa fuga nulla
                    ullam. In, libero.</p>
                </q-tab-panel>
              </q-tab-panels>
            </template>
          </q-splitter>

        </div>
      </div>
    </q-page>
  </q-page-container>
</template>

<script>
const {Octokit} = require("@octokit/rest");

import axios from "axios";

var request = require('request');
var fs = require('fs');
const octokit = new Octokit();

const DEFAULT_DOWNLOAD_CONFIG = require("./default-download-config.json");

export default {
  name: "ServiceIndex",
  methods: {
    testConnectionWithEndpoint() {
      console.log("Test with endpoint", this.newEndpoint);
      axios({
        url: this.newEndpoint + "/meta?query=column_types"
      }).then(function (res) {
        console.log("meta response", res)
      }).catch(function (err) {
        console.log("Failed to connect with the instance", err);
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
