<template>
  <q-page-container>
    <q-page>
      <div class="row">
        <div class="col-12 q-pa-md">
          <span class="text-h4">Daptin</span>
        </div>
        <div class="col-12 q-pa-md" v-if="$q.platform.is.desktop">
          <span class="text-h4">Desktop</span>
        </div>
        <div class="col-12 q-pa-md" v-if="$q.platform.is.electron">
          <span class="text-h4">Electron</span>
        </div>
      </div>
    </q-page>
  </q-page-container>
</template>

<script>
export default {
  name: "ServiceIndex"
}
</script>

<style scoped>

</style>
