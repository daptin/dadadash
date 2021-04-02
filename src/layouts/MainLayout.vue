<template>
  <q-layout view="lHh Lpr lFf">

    <q-drawer
      v-model="showAdminDrawer"
      :mini-width="50"
      :width="250"
      :mini="showAdminDrawerStick"
      :breakpoint="1400"
      content-class=""
      elevated>
      <q-scroll-area class="fit">

        <q-list class="bg-black">
          <q-item clickable>
            <q-item-section @click="$router.push('/admin')" style="text-transform: capitalize;
font-weight: bold;
font-size: 22px;
text-align: center;
" class="text-white">
              DASHBOARD
            </q-item-section>
            <q-item-section avatar>
              <q-btn flat size="xs" @click="showAdminDrawerStick = !showAdminDrawerStick" color="white" icon="menu"/>
            </q-item-section>
          </q-item>
        </q-list>

        <q-list>
          <q-expansion-item
            expand-separator
            label="Database"
            :value="true"
            expand-icon-class="text-white"
            icon="fas fa-database">

            <q-list>


              <q-item :inset-level="1" clickable v-ripple @click="$router.push('/tables')">
                <q-item-section avatar>
                  <q-icon name="fas fa-table"></q-icon>
                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    Tables
                  </q-item-label>
                </q-item-section>
              </q-item>


            </q-list>

          </q-expansion-item>

          <q-item clickable
                  @click="$router.push('/workspace')"
          >
            <q-item-section avatar>
              <q-icon name="fas fa-briefcase"></q-icon>
            </q-item-section>
            <q-item-section>
              Workspace
            </q-item-section>

          </q-item>

          <q-expansion-item
            expand-icon-class="text-white"
            :value="true"
            expand-separator
            icon="fas fa-user"
            label="Users">

            <q-list>

              <q-item :inset-level="1" clickable v-ripple @click="$router.push('/user/profile')">
                <q-item-section avatar>
                  <q-icon name="fas fa-id-card"></q-icon>

                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    Profile
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item :inset-level="1" clickable v-ripple @click="$router.push('/users')">
                <q-item-section avatar>
                  <q-icon name="fas fa-address-book"></q-icon>

                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    Accounts
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item :inset-level="1" clickable v-ripple @click="$router.push('/groups')">
                <q-item-section avatar>
                  <q-icon name="fas fa-users"></q-icon>

                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    Groups
                  </q-item-label>
                </q-item-section>
              </q-item>

            </q-list>

          </q-expansion-item>

          <q-expansion-item
            expand-icon-class="text-white"
            :value="true"
            expand-separator
            icon="fas fa-archive"
            label="Storage">

            <q-list>

              <q-item :inset-level="1" clickable v-ripple @click="$router.push('/cloudstore')">
                <q-item-section avatar>
                  <q-icon name="fas fa-bars"></q-icon>

                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    Cloud stores
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item :inset-level="1" clickable v-ripple @click="$router.push('/cloudstore/sites')">
                <q-item-section avatar>
                  <q-icon name="fas fa-desktop"></q-icon>

                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    Sites
                  </q-item-label>
                </q-item-section>
              </q-item>

            </q-list>

          </q-expansion-item>


          <q-expansion-item
            expand-icon-class="text-white"
            :value="true"
            expand-separator
            icon="fas fa-bolt"
            label="Integrations">

            <q-list>

              <q-item :inset-level="1" clickable v-ripple @click="$router.push('/integrations/spec')">
                <q-item-section avatar>
                  <q-icon name="fas fa-plug"></q-icon>

                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    API Catalogue
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item :inset-level="1" clickable v-ripple @click="$router.push('/integrations/actions')">
                <q-item-section avatar>
                  <q-icon name="fas fa-wrench"></q-icon>

                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    Actions
                  </q-item-label>
                </q-item-section>
              </q-item>

            </q-list>

          </q-expansion-item>


          <q-expansion-item
            expand-icon-class="text-white"
            :value="true"
            expand-separator
            icon="fas fa-book"
            label="Documentation">

            <q-list>


              <q-item :inset-level="1" clickable v-ripple @click="$router.push('/tables/apidocs')">
                <q-item-section avatar>
                  <q-icon name="fas fa-book"></q-icon>
                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    JSON API docs
                  </q-item-label>
                </q-item-section>
              </q-item>


              <q-item :inset-level="1" clickable v-ripple @click="$router.push('/tables/graphql')">
                <q-item-section avatar>
                  <q-icon name="fas fa-book"></q-icon>
                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    GraphQL docs
                  </q-item-label>
                </q-item-section>
              </q-item>


            </q-list>

          </q-expansion-item>

        </q-list>


        <q-list>
          <q-item clickable @click="logout()">
            <q-item-section avatar>
              <q-icon color="negative" name="fas fa-power-off"></q-icon>

            </q-item-section>
            <q-item-section>
              <q-item-label>
                Logout
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

      </q-scroll-area>
    </q-drawer>

    <router-view v-if="isAdmin || isUser"/>
    <user-header-bar @toggle-left-drawer="toggleAdminDrawer()" v-if="loaded" :buttons="{before: [], after: []}" :on-back="false"></user-header-bar>

  </q-layout>
</template>

<script>
import {mapGetters, mapActions} from 'vuex';

var jwt = require('jsonwebtoken');

export default {
  name: 'MainLayout',

  computed: {
    fileDrawerWidth() {
      return window.screen.availWidth;
    },
  },
  components: {},

  data() {
    return {
      showHelp: false,
      showAdminDrawer: false,
      showAdminDrawerMini: true,
      showAdminDrawerStick: false,
      ...mapGetters(['loggedIn', 'drawerLeft', 'authToken', 'decodedAuthToken', 'userGroupTable']),
      essentialLinks: [],
      drawer: false,
      userDrawer: false,
      loaded: false,
      miniState: true,
      isAdmin: false,
      isUser: false,
    }
  },
  mounted() {
    const that = this;
    console.log("Mounted main layout");
    if (that.decodedAuthToken()) {
      let decodedAuthToken = that.decodedAuthToken();
      let isLoggedOut = decodedAuthToken.exp * 1000 < new Date().getTime();
      console.log("Decoded auth token", isLoggedOut, decodedAuthToken);
      if (isLoggedOut) {
        that.$q.notify({
          message: "Authentication has expired, please login again"
        });
        that.setDecodedAuthToken(null);
        that.logout();
        return
      }
    } else {
      that.logout();
      return;
    }

    that.loadModel([
      "cloud_store", "user_account",
      "usergroup", "world", "action",
      'site', 'integration']).then(function () {
      that.loaded = true;
      that.getDefaultCloudStore();

      that.loadData({
        tableName: "user_account",
      }).then(function (res) {
        const users = res.data;
        // let userGroupTable = that.userGroupTable();
        console.log("Users: ", users);

        if (users[0].permission !== 2097057 && that.decodedAuthToken()) {
          that.executeAction({
            tableName: 'world',
            actionName: "become_an_administrator"
          }).then(function (res) {

            that.$q.notify({
              message: "You have become the administrator of this instance"
            });

          }).catch(function (err) {
            console.log("Failed to become admin", err);
          })
        }
        that.isAdmin = true;
        that.showAdminDrawer = true;
        that.isUser = false;

      });

    }).catch(function (err) {
      console.log("Failed to load model for cloud store", err);
      that.$q.notify({
        message: "Failed to load model for cloud store"
      })
    })

  },
  methods: {
    toggleAdminDrawer(){
      this.showAdminDrawer = !this.showAdminDrawer;
    },
    ...mapActions(['getDefaultCloudStore', 'loadModel', 'executeAction', 'loadData', 'setDecodedAuthToken']),
    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      this.$router.push("/login");
      window.location = window.location + "";
    }
  }
}
</script>
