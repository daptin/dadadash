<template>
  <q-card flat bordered class="my-card bg-white q-pa-md">
    <div class="row items-center no-wrap">
      <div class="col">
        <div class="text-h6">{{ node.Method }}</div>
      </div>

      <div class="col-auto">
        <flowy-drag-handle>
          <q-btn size="sm" color="grey-7" round flat icon="drag_handle"/>
        </flowy-drag-handle>
      </div>

    </div>

    <div class="q-py-md" v-html="node.Type"/>
    <q-btn color="primary" v-if="node.removable" class="q-pa-none" no-caps @click="remove()">Remove</q-btn>
  </q-card>
</template>

<script>
export default {
  name: "DataActionNode",
  data() {
    return {
      text: 'This is a node for data action'
    }
  },
  props: ['remove', 'node', 'removable'],
}
</script>

<style scoped>

</style>
