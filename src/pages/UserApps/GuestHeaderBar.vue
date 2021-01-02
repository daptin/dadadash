<template>

  <q-header reveal class="bg-white text-black" position="top" expand>
    <q-bar class="bg-primary text-white" style="height: 48px">
      <q-btn v-if="onBack !==  false" flat @click="onBack ? onBack() : $router.back()" icon="fas fa-arrow-left"></q-btn>
      <q-toolbar-title v-if="title" style="text-transform: capitalize" v-html="title">
      </q-toolbar-title>

      <!--      <form v-if="$q.screen.gt.xs" @submit="emitSearch" class="col-2 col-xs-0">-->
      <!--        <input id="searchInput"-->
      <!--               placeholder="Search"-->
      <!--               style=" height:32px; font-size: 15px; border: 1px solid black; border-radius: 4px; padding-left: 10px; width: 100%"-->
      <!--               type="text" v-model="searchQuery"/>-->
      <!--      </form>-->
      <q-btn :key="btn.icon" v-for="btn in buttons.before" flat @click="buttonClicked(btn)" :icon="btn.icon"></q-btn>
      <q-btn :key="btn.icon" v-for="btn in buttons.after" flat @click="buttonClicked(btn)" :label="btn.label"
             :icon="btn.icon"></q-btn>
      <q-space/>

      <q-btn @click="$emit('login')" size="0.8em" class="profile-image" flat icon="fas fa-lock">

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
  name: "GuestHeaderBar",
  mounted() {
    const that = this;

  },
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
    ...mapActions(['setDecodedAuthToken', 'loadData', 'updateRow', 'executeAction'])
  },
  data() {
    return {
      ...mapGetters(['decodedAuthToken', 'documentTable', 'worldTable']),
      searchQuery: null,
      basePermission: {
        read: 'private',
        write: 'private',
      },
      menuItems: [],
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
