<template>
  <q-card flat bordered class="q-px-md q-py-sm row items-center justify-between">
    <q-btn @click="$emit('add')" color="grey-7" size="sm" class="q-ml-md" round flat icon="add"/>
    <div class="text-subtitle1">{{ title }}</div>
  </q-card>
</template>

<script>
export default {
  name: "DataActionBlock",
  data() {
    return {
      text: 'This is component A'
    }
  },
  props: ['remove', 'node', 'title', 'description'],
}
</script>

<style scoped>

</style>
