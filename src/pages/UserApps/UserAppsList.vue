<template>
  <q-page-container>
    <user-header-bar @toggle-left-drawer="$emit('toggle-left-drawer')" :buttons="{}"></user-header-bar>
  </q-page-container>


</template>
<script>
export default {
  name: "UsersAppsList",
  mounted() {
    console.log("Mounted user apps")
  }
}
</script>
