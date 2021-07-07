<template>

  <q-header reveal class="print-hide" position="top" expand>
    <q-bar style="height: 48px" v-if="decodedAuthToken() !== null">
<!--      <q-btn  flat @click="$emit('toggle-left-drawer')" icon="menu"></q-btn>-->
      <q-btn v-if="onBack !==  false" flat @click="onBack ? onBack() : $router.back()" icon="fas fa-arrow-left"></q-btn>
      <q-btn :key="btn.icon" v-for="btn in buttons.beforeTitle" flat @click="buttonClicked(btn)"
             :icon="btn.icon"></q-btn>
      <q-toolbar-title v-if="title && $q.screen.gt.md" style="text-transform: capitalize" v-html="title">
      </q-toolbar-title>

      <!--      <form v-if="$q.screen.gt.xs" @submit="emitSearch" class="col-2 col-xs-0">-->
      <!--        <input id="searchInput"-->
      <!--               placeholder="Search"-->
      <!--               style=" height:32px; font-size: 15px; border: 1px solid black; border-radius: 4px; padding-left: 10px; width: 100%"-->
      <!--               type="text" v-model="searchQuery"/>-->
      <!--      </form>-->
      <q-btn :key="btn.icon" v-for="btn in buttons.before" flat @click="buttonClicked(btn)" :icon="btn.icon"></q-btn>
      <q-btn :key="btn.icon" v-for="btn in buttons.after" flat @click="buttonClicked(btn)" :label="btn.label"
             :icon="btn.icon">
        <q-tooltip v-if="btn.tooltip">{{ btn.tooltip }}</q-tooltip>
      </q-btn>
      <q-space/>
      <q-btn flat :icon="basePermission.read === 'public' ? 'fas fa-eye':  'fas fa-eye-slash'"
             v-if="documentTableLocal !== null"
             label="View permissions">
        <q-menu>

          <q-card>
            <q-card-section>
              <span class="text-bold">Site guest read access</span> <br/>
              <span class="text-secondary" style="font-size: 0.8em">
                This is a site wide control. <br/>
                You will also need to enable access for each item separately.
              </span>

            </q-card-section>
            <q-card-section>
              <q-btn label="Public" :class="{'btn-primary': basePermission.read === 'public'}"
                     @click="updateBasePermission('public')"/>

              <q-btn label="Private" :class="{'btn-primary': basePermission.read === 'private'}"
                     @click="updateBasePermission('private')"/>

            </q-card-section>
          </q-card>


        </q-menu>
      </q-btn>
      <q-btn flat icon="fas fa-th">
        <q-menu>
          <div class="row no-wrap q-pa-md">
            <q-list>

              <q-item :disable="!item.enable" :key="item.name" v-for="item in menuItems"
                      @click="$router.push(item.path)" clickable>
                <q-item-section avatar>
                  <q-icon
                    :name="item.icon"
                  />
                </q-item-section>
                <q-item-section>
                  {{ item.name }}
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-menu>

      </q-btn>
      <q-btn size="0.8em" class="profile-image" flat :icon="'img:' + decodedAuthToken().picture">
        <q-menu>
          <div class="row no-wrap q-pa-md">

            <div class="column items-center">
              <q-avatar>
                <img :src="decodedAuthToken().picture">
              </q-avatar>

              <div class="text-subtitle1 q-mt-md q-mb-xs">{{ decodedAuthToken().name }}</div>

              <q-btn-group>
                <q-btn
                  label="Dark mode"
                  push
                  rounded
                  :dark-percentage="true"
                  @click="$q.dark.toggle()"
                  size="sm"
                />
                <q-btn
                  label="Logout"
                  push
                  rounded
                  @click="triggerLogout()"
                  size="sm"
                  v-close-popup
                />
              </q-btn-group>
            </div>
          </div>
        </q-menu>
      </q-btn>

    </q-bar>
  </q-header>

</template>
<style>
.profile-image img {
  border-radius: 10px;
}
</style>
<script>
import {mapActions, mapGetters} from "vuex";

export default {
  name: "UserHeaderBar",
  mounted() {
    const that = this;
    that.loadTable("document", false).then(function () {
      var documentTable = that.documentTable();
      that.documentTableLocal = documentTable;
      console.log("document table loaded", documentTable, arguments);
      if (documentTable && ((documentTable.permission & that.permissionStructure.GuestRead) === that.permissionStructure.GuestRead)) {
        that.basePermission.read = "public";
      }
    })
  },
  methods: {
    updateBasePermission(newPerm) {
      const that = this;
      var document = this.documentTable();
      that.basePermission.read = newPerm;
      var currentDocumentPermission = document.permission;

      if (newPerm === "public") {
        currentDocumentPermission = 2097027;
      } else if (newPerm === "private") {
        currentDocumentPermission = 2097024;
      }
      console.log("Update permission for site", currentDocumentPermission, this.basePermission.read);
      var promises = [];
      if (document.permission !== currentDocumentPermission) {
        promises.push(that.updateRow({
          tableName: 'world',
          id: document.reference_id,
          permission: currentDocumentPermission,
        }))
      }

      if (that.worldTable().permission !== currentDocumentPermission) {
        promises.push(that.updateRow({
          tableName: 'world',
          id: that.worldTable().reference_id,
          permission: currentDocumentPermission,
        }))
      }
      Promise.all(promises).then(function (res) {
        that.$q.notify({
          message: "Table permissions updated"
        })
        that.executeAction({
          tableName: 'world',
          actionName: 'restart_daptin'
        }).then(function (res) {
          that.$q.notify({
            message: "Server re-synced"
          });
        }).catch(function (err) {
          console.log("Failed to resync server", err)
        })
      }).catch(function (err) {
        that.$q.notify({
          message: "Failed to update table permissions"
        })

      })


    },
    emitSearch(event) {
      this.$emit('search', this.searchQuery)
      event.stopPropagation();
      event.preventDefault();
    },
    buttonClicked(btn) {
      console.log("Button clicked", btn, this.searchQuery)
      if (btn.click) {
        btn.click();
        return;
      }
      this.$emit(btn.event, this.searchQuery);
    },
    triggerLogout() {
      this.$router.push("/login");
      this.logout();
    },
    ...mapActions(['setDecodedAuthToken', 'loadData', 'updateRow', 'executeAction', 'loadTable', 'logout'])
  },
  data() {
    return {
      ...mapGetters(['decodedAuthToken', 'documentTable', 'worldTable']),
      searchQuery: null,
      documentTableLocal: null,
      basePermission: {
        read: 'private',
        write: 'private',
      },
      menuItems: [
        {
          name: "Workspace",
          enable: true,
          path: '/workspace',
          icon: 'fas fa-briefcase'
        },
        {
          name: "Administrator",
          enable: true,
          path: '/admin',
          icon: 'fas fa-wrench'
        },
      ],
      permissionStructure: {
        None: 0,
        GuestPeek: 1 << 0,
        GuestRead: 1 << 1,
        GuestCreate: 1 << 2,
        GuestUpdate: 1 << 3,
        GuestDelete: 1 << 4,
        GuestExecute: 1 << 5,
        GuestRefer: 1 << 6,
        UserPeek: 1 << 7,
        UserRead: 1 << 8,
        UserCreate: 1 << 9,
        UserUpdate: 1 << 10,
        UserDelete: 1 << 11,
        UserExecute: 1 << 12,
        UserRefer: 1 << 13,
        GroupPeek: 1 << 14,
        GroupRead: 1 << 15,
        GroupCreate: 1 << 16,
        GroupUpdate: 1 << 17,
        GroupDelete: 1 << 18,
        GroupExecute: 1 << 19,
        GroupRefer: 1 << 20,
      }
    }
  },
  props: ['title', 'buttons', 'onBack']
}
</script>
