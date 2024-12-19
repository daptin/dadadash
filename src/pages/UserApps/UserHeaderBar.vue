<template>

  <q-header reveal class="print-hide bg-black" position="top" expand>
    <q-bar style="height: 48px" v-if="decodedAuthToken() !== null">
      <q-btn  flat @click="$emit('toggle-left-drawer')" icon="menu"></q-btn>
      <q-btn v-if="onBack !==  false" flat @click="onBack ? onBack() : $router.back()" icon="fas fa-arrow-left"></q-btn>
      <q-btn :key="btn.icon" v-for="btn in buttons.beforeTitle" flat @click="buttonClicked(btn)"
             :icon="btn.icon"></q-btn>
      <q-toolbar-title v-if="title && $q.screen.gt.md" style="text-transform: capitalize" v-html="title">
      </q-toolbar-title>

      <q-btn :key="btn.icon" v-for="btn in buttons.before" flat @click="buttonClicked(btn)" :icon="btn.icon"></q-btn>
      <q-btn :key="btn.icon" v-for="btn in buttons.after" flat @click="buttonClicked(btn)" :label="btn.label"
             :icon="btn.icon">
        <q-tooltip v-if="btn.tooltip">{{ btn.tooltip }}</q-tooltip>
      </q-btn>
      <q-space/>
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
      <q-btn size="0.8em" class="profile-image" flat icon="person">
        <q-menu>
          <div class="row no-wrap q-pa-md">

            <div class="column items-center">
<!--              <q-avatar>-->
<!--                <q-icon name="person"></q-icon>-->
<!--              </q-avatar>-->

              <div class="text-subtitle1 q-mt-md q-mb-md">{{ decodedAuthToken().name }}</div>

<!--              <q-btn-group>-->
<!--                <q-btn-->
<!--                  label="Dark mode"-->
<!--                  push-->
<!--                  rounded-->
<!--                  :dark-percentage="true"-->
<!--                  @click="$q.dark.toggle()"-->
<!--                  size="sm"-->
<!--                />-->
                <q-btn
                  label="Logout"
                  push
                  rounded
                  class="bg-black text-white"
                  @click="triggerLogout()"
                  size="md"
                  v-close-popup
                />
<!--              </q-btn-group>-->
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
