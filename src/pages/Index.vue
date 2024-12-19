<template>
  <q-page-container>
    <q-page>

      <div class="row" style="overflow-y: scroll; height: calc(100vh - 12px);">

        <div class="col-8 col-md-8 col-xs-12 col-lg-9 col-sm-6">
          <div class="row">
            <div class="col-6 col-md-6 col-lg-4 col-xl-4 col-xs-12 col-sm-12 q-pa-sm q-gutter-sm">
              <q-card>
                <q-card-section>
                  <span v-if="!showHostnameEdit" class="text-bold">{{ serverConfig.hostname }}</span>
                </q-card-section>


                <q-card-section>
                  <div class="row q-pa-sm">
                    <div class="col-4">
                      <span class="text-bold">Total</span>
                    </div>
                    <div class="col-6 text-right">
                      {{ userAggregate.count }}
                    </div>
                  </div>
                  <div class="row q-pa-sm">
                    <div class="col-4">
                      <span class="text-bold">User registrations</span>
                    </div>
                    <div class="col-6 text-right">
                      <q-btn-toggle v-model="signUpPublicAvailable" :options="[
          {label: signUpPublicAvailable == '2097057' ? 'Enabled' : 'Enable', value: '2097057', disable: signUpPublicAvailable == '2097057'},
          {label: signUpPublicAvailable != '2097057' ? 'Disabled' : 'Disable', value: '2097025', disable: !(signUpPublicAvailable == '2097057')},
        ]" color="white" flat
                                    size="sm" text-color="black"
                                    toggle-color="primary"
                                    toggle-text-color="black" @click="updateSignupActionPermission()"></q-btn-toggle>
                    </div>
                  </div>
                  <div class="row q-pa-sm">
                    <div class="col-4">
                      <span class="text-bold">Password Reset</span>
                    </div>
                    <div class="col-6 text-right">
                      Disabled
                      <!--                <q-btn-toggle size="sm" rounded color="white" toggle-color="primary" toggle-text-color="white"-->
                      <!--                              text-color="black"-->
                      <!--                              :options="[-->
                      <!--        {label: resetPublicAvailable ? 'Enabled' : 'Enable', value: true},-->
                      <!--          {label: !resetPublicAvailable ? 'Disabled' : 'Disable', value: false},-->
                      <!--        ]" v-model="resetPublicAvailable"></q-btn-toggle>-->
                    </div>
                  </div>
                </q-card-section>

              </q-card>
            </div>


            <div class="col-6  col-md-6 col-lg-4 col-xl-3 col-xs-12 col-sm-12 q-pa-sm q-gutter-sm">
              <q-card>

                <q-card-section>
                  <q-item>
                    <q-item-section avatar>
                      <q-avatar>
                        <q-icon name="fas fa-database" size="lg"></q-icon>
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <span class="text-h5">Data tables</span>
                    </q-item-section>
                  </q-item>
                </q-card-section>


                <q-card-section>
                  <div class="row q-pa-sm">
                    <div class="col-4">
                      <span class="text-bold">Total</span>
                    </div>
                    <div class="col-6 text-right">
                      {{ tables().length }}
                    </div>
                  </div>

                </q-card-section>
                <q-card-section>
                  <div class="row ">
                    <div class="col-12 q-pa-sm q-gutter-sm">
                      <q-btn class="float-right" icon="list" round @click="$router.push('/tables')"></q-btn>
                      <q-btn class="float-right" icon="add" round @click="$router.push('/tables/create')"></q-btn>
                    </div>
                  </div>
                </q-card-section>

              </q-card>
            </div>

            <div class="col-6 col-md-6 col-lg-4 col-xl-3 col-xs-12 col-sm-12 q-pa-sm q-gutter-sm">
              <q-card>

                <q-card-section>
                  <q-item>
                    <q-item-section avatar>
                      <q-avatar>
                        <q-icon name="fas fa-film" size="lg"></q-icon>
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <span class="text-h5">Sites</span>
                    </q-item-section>
                  </q-item>
                </q-card-section>


                <q-card-section>
                  <div class="row q-pa-sm">
                    <div class="col-4">
                      <span class="text-bold">Active</span>
                    </div>
                    <div class="col-6 text-right">
                      {{ siteAggregate.active }}
                    </div>
                  </div>


                  <div class="row q-pa-sm">
                    <div class="col-4">
                      <span class="text-bold">Total</span>
                    </div>
                    <div class="col-6 text-right">
                      {{ siteAggregate.total }}
                    </div>
                  </div>

                  <div class="row q-pa-sm">
                    <div class="col-4">
                      <span class="text-bold">Cloud stores</span>
                    </div>
                    <div class="col-6 text-right">
                      {{ cloudStoreAggregate.count }}
                    </div>
                  </div>

                </q-card-section>
                <q-card-section>
                  <div class="row ">
                    <div class="col-12 q-pa-sm q-gutter-sm">
                      <q-btn class="float-right" icon="list" round @click="$router.push('/cloudstore/sites')"></q-btn>
                    </div>
                  </div>
                </q-card-section>

              </q-card>
            </div>

            <div class="col-6  col-md-6 col-lg-4 col-xl-3 col-xs-12 col-sm-12 q-pa-sm q-gutter-sm">
              <q-card>
                <q-card-section>
                  <q-item>
                    <q-item-section avatar>
                      <q-avatar>
                        <q-icon name="fas fa-bolt" size="lg"></q-icon>
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <span class="text-h5">Integrations</span>
                    </q-item-section>
                  </q-item>
                </q-card-section>


                <q-card-section>
                  <div class="row q-pa-sm">
                    <div class="col-4">
                      <span class="text-bold">API Specs</span>
                    </div>
                    <div class="col-6 text-right">
                      {{ integrationAggregate.count }}
                    </div>
                  </div>
                  <div class="row q-pa-sm">
                    <div class="col-4">
                      <span class="text-bold">Actions</span>
                    </div>
                    <div class="col-6 text-right">
                      {{ actionAggregate.count }}
                    </div>
                  </div>
                </q-card-section>

                <q-card-section>
                  <div class="row ">
                    <div class="col-12 q-pa-sm q-gutter-sm">
                      <q-btn class="float-right" label="Add API Spec"></q-btn>
                      <q-btn class="float-right" label="Create an action"></q-btn>
                    </div>
                  </div>
                </q-card-section>

              </q-card>
            </div>

          </div>
        </div>
        <div class="col-4  col-md-4 col-lg-3 col-xl-3 col-xs-12 col-sm-6 q-pa-sm q-gutter-sm">
          <div class="row">
            <div class="col-12">
              <q-card>
                <q-card-section>
                  <q-item>
                    <q-item-section avatar>
                      <q-avatar>
                        <q-icon name="fas fa-plug" size="lg"></q-icon>
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <span class="text-h5">Services</span>
                    </q-item-section>
                  </q-item>
                </q-card-section>


                <q-card-section>
                  <div class="row q-pa-sm">
                    <q-tooltip>
                      Resync configuration is required when you make a change to any of the following <br/>
                      <ul>
                        <li>Table structure</li>
                        <li>Service config change (service enabled/disabled)</li>
                        <li>Backend config change (rate limit/hostname)</li>
                        <li>Cloud storage and site source changes</li>
                        <li>Mail server changes (added or removed hosts)</li>
                        <li>Permission changes to tables and actions (row level permission change doesn't require
                          this)
                        </li>
                      </ul>
                    </q-tooltip>
                    <div class="col-6">
                    <span class="text-bold">Resync Configuration
                    </span>
                    </div>
                    <div class="col-4 text-right">
                      <q-btn color="primary" flat icon="fas fa-sync" rounded size="md" @click="reloadServer()"></q-btn>
                    </div>
                  </div>

                  <div class="row q-pa-sm">
                    <div class="col-6">
                      <span class="text-bold">JSON API endpoint</span>
                    </div>
                    <div class="col-4 text-right">
                      <q-icon color="green" name="fas fa-check"></q-icon>
                    </div>
                  </div>


                  <div class="row q-pa-sm">
                    <div class="col-6">
                      <span class="text-bold">FTP service</span>
                    </div>
                    <div class="col-4 text-right">

                      <!--       {{serverConfig['ftp.enable']}}         <q-checkbox v-model="serverConfig['ftp.enable']"/>-->
                      <q-btn-toggle v-model="serverConfig['ftp.enable']" :options="[
          {label: serverConfig['ftp.enable'] ? 'Enabled' : 'Enable', value: true, disable: serverConfig['ftp.enable']},
          {label: !serverConfig['ftp.enable'] ? 'Disabled' : 'Disable', value: false, disable: !serverConfig['ftp.enable']},
        ]" color="white" flat size="sm"
                                    text-color="primary" toggle-color="black"
                                    toggle-text-color="black" @click="updateFtpEndpoint()"></q-btn-toggle>
                    </div>
                  </div>
                  <div class="row q-pa-sm">
                    <div class="col-6">
                      <span class="text-bold">GraphQL endpoint</span>
                    </div>
                    <div class="col-4 text-right">
                      <q-btn-toggle v-model="serverConfig['graphql.enable']" :options="[
          {label: serverConfig['graphql.enable'] ? 'Enabled' : 'Enable', value: true, disable: serverConfig['graphql.enable']},
          {label: !serverConfig['graphql.enable'] ? 'Disabled' : 'Disable', value: false, disable: !serverConfig['graphql.enable']},
        ]" color="white" flat size="sm"
                                    text-color="primary" toggle-color="black"
                                    toggle-text-color="black" @click="updateGraphqlEndpoint()"></q-btn-toggle>

                    </div>
                  </div>
                  <div class="row q-pa-sm">
                    <div class="col-6">
                      <span class="text-bold">IMAP endpoint</span>
                    </div>
                    <div class="col-4 text-right">
                      <q-icon v-if="serverConfig['imap.enabled']" color="green" name="fas fa-check"></q-icon>
                      <q-icon v-if="!serverConfig['imap.enabled']" color="red" name="fas fa-times"></q-icon>

                    </div>
                  </div>
                  <div class="row q-pa-sm">
                    <div class="col-6">
                      <span class="text-bold">Connection limit / IP</span>
                    </div>
                    <div v-if="!editMaxConnections" class="col-4 text-right" style="text-decoration-line: underline; text-decoration-style: dashed"
                         @click="editMaxConnections = true">
                      {{ serverConfig['limit.max_connections'] }}
                    </div>
                    <div v-if="editMaxConnections" class="col-4 text-right">
                      <input v-model="serverConfig['limit.max_connections']" size="sm" style="width: 100px" type="number"
                             @keypress.enter="saveMaxConnections()">
                      <q-tooltip>Press enter to save</q-tooltip>
                      <i class="fas fa-times" style="color: grey; cursor: pointer; padding-left: 5px"
                         @click="editMaxConnections = false"></i>
                    </div>
                  </div>
                  <div class="row q-pa-sm">
                    <div class="col-6">
                      <span class="text-bold">Rate limit</span>
                    </div>
                    <div v-if="!editRateLimit" class="col-4 text-right" style="text-decoration-line: underline; text-decoration-style: dashed"
                         @click="editRateLimit = true">
                      {{ serverConfig['limit.rate'] }}
                    </div>
                    <div v-if="editRateLimit" class="col-4 text-right">
                      <input v-model="serverConfig['limit.rate']" size="sm" style="width: 100px" type="number"
                             @keypress.enter="saveRateLimit()">
                      <q-tooltip>Press enter to save</q-tooltip>
                      <i class="fas fa-times" style="color: grey; cursor: pointer; padding-left: 5px"
                         @click="editRateLimit = false"></i>
                    </div>
                  </div>
                </q-card-section>

              </q-card>
            </div>

          </div>

        </div>


      </div>


      <q-drawer v-model="showHelp" :width="400" overlay side="right">
        <q-scroll-area v-if="showHelp" class="fit">
          <help-page @closeHelp="showHelp = false">
          </help-page>
        </q-scroll-area>
      </q-drawer>


    </q-page>
    <!--    <q-page-sticky v-if="!showHelp" position="top-right" :offset="[0, 0]">-->
    <!--      <q-btn flat @click="showHelp = true" fab icon="fas fa-question"/>-->
    <!--    </q-page-sticky>-->

  </q-page-container>
</template>

<script>
import {mapActions, mapGetters} from 'vuex';

export default {
  name: 'PageIndex',
  methods: {
    saveMaxConnections() {
      const that = this;

      this.saveConfig({
        name: "limit.max_connections",
        value: this.serverConfig['limit.max_connections']
      }).then(function (res) {
        that.$q.notify({
          message: "Max connections per IP limit updated"
        });
        that.editMaxConnections = false;
      }).catch(function (res) {
        console.log("Failed to update max connections per IP limit", res);
        that.$q.notify({
          message: "Failed to update max connections per IP limit"
        })
      })
    },
    saveRateLimit() {
      const that = this;

      this.saveConfig({name: "limit.rate", value: this.serverConfig['limit.rate']}).then(function (res) {
        that.$q.notify({
          message: "Rate limit updated"
        });
        that.editRateLimit = false;
      }).catch(function (res) {
        console.log("Failed to update rate limit", res);
        that.$q.notify({
          message: "Failed to update rate limit"
        })
      })

    },
    updateSignupActionPermission() {
      const that = this;
      console.log("updateSignupActionPermission", this.signUpPublicAvailable, that.actionMap["signup"]);
      var signUpAction = that.actionMap["signup"];


      that.updateRow({
        tableName: "action",
        id: signUpAction.reference_id,
        permission: that.signUpPublicAvailable,
      }).then(function () {
        that.$q.notify({
          message: "Saved"
        });
      }).catch(function (e) {
        console.log("Failed to enable signup action permissions", e);
        that.$q.notify({
          message: "Failed to enable signup action permissions"
        });
      });

    },
    updateGraphqlEndpoint() {
      const that = this;
      console.log("Update graphql endpoint", this.serverConfig['graphql.enable'])

      this.saveConfig({name: "graphql.enable", value: this.serverConfig['graphql.enable']}).then(function (res) {
        if (that.serverConfig['graphql.enable']) {
          that.$q.notify({
            message: "GraphQL endpoint enabled"
          });
        } else {
          that.$q.notify({
            message: "GraphQL endpoint disabled"
          });
          that.reloadServer();

        }
        that.showHostnameEdit = false;
      }).catch(function (res) {
        console.log("Failed to update graphql endpoint", res);
        that.$q.notify({
          message: "Failed to update endpoint status"
        })
      })

    },

    updateFtpEndpoint() {
      const that = this;
      console.log("Update ftp endpoint", this.serverConfig['ftp.enable'])

      this.saveConfig({name: "ftp.enable", value: this.serverConfig['ftp.enable']}).then(function (res) {
        if (that.serverConfig['ftp.enable']) {
          that.$q.notify({
            message: "ftp enabled"
          });
        } else {
          that.$q.notify({
            message: "ftp disabled"
          });
          that.reloadServer();

        }
        that.showHostnameEdit = false;
      }).catch(function (res) {
        console.log("Failed to update ftp endpoint", res);
        that.$q.notify({
          message: "Failed to update ftp status"
        })
      })

    },
    saveHostname() {
      const that = this;
      this.saveConfig({name: "hostname", value: this.serverConfig.hostname}).then(function (res) {
        that.$q.notify({
          message: "Hostname updated"
        });
        that.reloadServer();
        that.showHostnameEdit = false;
      }).catch(function (res) {
        console.log("failed to upate hostname", res)
        that.$q.notify({
          message: "Failed to update hostname"
        })
      })
    },
    changeHostname() {
      this.showHostnameEdit = true;
    },
    reloadServer() {
      console.log("Reload server");
      const that = this;
      that.executeAction({
        tableName: "world",
        actionName: "restart_daptin"
      }).then(function (res) {
        that.$q.notify({
          message: "Server restarted"
        })
      }).catch(function (err) {
        that.$q.notify({
          message: "Failed to restart"
        });
        console.log("Failed to restart daptin", err)
      })
    },
    ...mapActions(['loadData', 'loadAggregates', 'loadServerConfig', 'executeAction', 'saveConfig', 'loadTables', 'updateRow'])
  },

  data() {
    return {
      text: '',
      editMaxConnections: false,
      editRateLimit: false,
      showHelp: false,
      showHostnameEdit: false,
      actionMap: {},
      userAggregate: {},
      cloudStoreAggregate: {},
      serverConfig: {},
      siteAggregate: {},
      integrationAggregate: {},
      actionAggregate: {},
      signUpPublicAvailable: '',
      resetPublicAvailable: false,
      ...mapGetters(['tables'])
    }
  },
  mounted() {
    const that = this;

    // this.$router.push('/apps/workspace')
    // return
    this.$q.loadingBar.start();
    that.loadTables().then(function () {
      that.$q.loadingBar.stop()
    });
    that.loadData({
      tableName: 'action',
      params: {
        page: {
          size: 500
        }
      }
    }).then(function (res) {
      console.log("Actions", res);
      var data = res.data;
      var actionMap = {};
      var signUpAction = data.filter(function (e) {
        actionMap[e.action_name] = e;
        return e.action_name === 'signup'
      })[0];

      that.signUpPublicAvailable = signUpAction.permission;
      var resetAction = data.filter(function (e) {
        return e.action_name === 'resetpassword'
      })[0];
      // console.log("Reset action", resetAction);
      if (resetAction && resetAction.permission && 1) {
        that.resetPublicAvailable = true;
      }
      that.actionMap = actionMap;
      console.log("Action map", actionMap)

    }).catch(function (res) {
      console.log("Failed to load actions", res);
    });


    that.loadAggregates({
      tableName: 'user_account',
      column: 'count'
    }).then(function (res) {
      console.log("User account aggregates", res);
      that.userAggregate = res.data[0].attributes;
    });


    that.loadAggregates({
      tableName: 'cloud_store',
      column: 'count'
    }).then(function (res) {
      console.log("cloud store aggregates", res);
      that.cloudStoreAggregate = res.data[0].attributes;
    });


    that.loadAggregates({
      tableName: 'site',
      column: 'count',
      group: 'enable'
    }).then(function (res) {
      console.log("Site aggregates", res);
      var enableStat = null;
      var disableStat = null;
      for (var i in res.data) {
        var stat = res.data[i].attributes;
        if (stat.enable === true || stat.enable === 1) {
          enableStat = stat;
        } else {
          disableStat = stat;
        }
      }

      that.siteAggregate = {
        active: 0,
        total: 0,
      };
      if (enableStat) {
        that.siteAggregate.active = enableStat.count;
        that.siteAggregate.total += enableStat.count;
      }
      if (disableStat) {
        that.siteAggregate.total += disableStat.count;
      }
    });
    that.loadAggregates({
      tableName: 'action',
      column: 'count',
    }).then(function (res) {
      console.log("Action aggregates", res);
      that.actionAggregate = res.data[0].attributes;
    });
    that.loadAggregates({
      tableName: 'integration',
      column: 'count',
    }).then(function (res) {
      console.log("Integration aggregates", res);
      that.integrationAggregate = res.data[0].attributes;
    });

    that.loadServerConfig().then(function (res) {
      for (var key in res) {
        if (res[key] === "true") {
          res[key] = true
        } else if (res[key] === "false") {
          res[key] = false
        }
      }
      console.log("Server config", res)

      that.serverConfig = res;
    }).catch(function (err) {
      console.log("Failed to load server config", err)
    });


  }
}
</script>
