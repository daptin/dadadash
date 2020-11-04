<template>

  <q-header reveal class="bg-white text-black" position="top" expand>
    <q-bar class="bg-primary text-white" style="height: 48px" v-if="decodedAuthToken() !== null">
      <q-btn flat @click="onBack ? onBack() : $router.back()" icon="fas fa-arrow-left"></q-btn>
      <q-toolbar-title  v-if="title && $q.screen.gt.md" style="text-transform: capitalize" v-html="title">
      </q-toolbar-title>

      <form v-if="$q.screen.gt.xs" @submit="emitSearch" class="col-2 col-xs-0">
        <input id="searchInput"
               placeholder="Search"
               style=" height:32px; font-size: 15px; border: 1px solid black; border-radius: 4px; padding-left: 10px; width: 100%"
               type="text" v-model="searchQuery"/>
      </form>
      <q-btn :key="btn.icon" v-for="btn in buttons.before" flat @click="buttonClicked(btn)" :icon="btn.icon"></q-btn>
      <q-btn :key="btn.icon" v-for="btn in buttons.after" flat @click="buttonClicked(btn)" :label="btn.label"
             :icon="btn.icon"></q-btn>
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
      <q-btn size="0.8em" class="profile-image" flat :icon="'img:' + decodedAuthToken().picture">
        <q-menu>
          <div class="row no-wrap q-pa-md">

            <div class="column items-center">
              <q-avatar>
                <img :src="decodedAuthToken().picture">
              </q-avatar>

              <div class="text-subtitle1 q-mt-md q-mb-xs">{{ decodedAuthToken().name }}</div>

              <q-btn
                color="black"
                label="Logout"
                push
                rounded
                @click="logout()"
                size="sm"
                v-close-popup
              />
            </div>
          </div>
        </q-menu>
      </q-btn>
      <!--      <q-img :src="decodedAuthToken().picture" width="40px" ></q-img>-->
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
  methods: {
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
    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      this.setDecodedAuthToken(null);
      this.$router.push("/login");
      window.location = window.location;
    },
    ...mapActions(['setDecodedAuthToken'])
  },
  data() {
    return {
      ...mapGetters(['decodedAuthToken']),
      searchQuery: null,
      menuItems: [
        {
          name: "Workspace",
          enable: true,
          path: '/apps/workspace',
          icon: 'fas fa-briefcase'
        },
        {
          name: "Email",
          enable: false,
          path: '/apps/email',
          icon: 'fas fa-envelope'
        },
        {
          name: "File browser",
          path: '/apps/files',
          enable: true,
          icon: 'fas fa-archive'
        },
        {
          name: "Contacts",
          enable: false,
          path: '/apps/contacts',
          icon: 'fas fa-users'
        },
        // {
        //   name: "Documents",
        //   enable: true,
        //   path: '/apps/document/new',
        //   icon: 'fas fa-file-alt'
        // },
        // {
        //   name: "Spreadsheet",
        //   enable: true,
        //   path: '/apps/spreadsheet/new',
        //   icon: 'fas fa-file-csv'
        // },
        {
          name: "Calendar",
          enable: true,
          path: '/apps/calendar',
          icon: 'fas fa-calendar'
        },
        {
          name: "Drag",
          enable: true,
          path: '/apps/drageditor',
          icon: 'fas fa-hand-rock'
        },

      ]
    }
  },
  props: ['title', 'buttons', 'onBack']
}
</script>
