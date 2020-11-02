<template>
  <div class="row">
    <q-page class="col-12"  v-if="baseItem.item_type === 'view'">
      {{baseItem}}
<!--      <edit-data-table :tableName="baseItem.target.name"></edit-data-table>-->
    </q-page>
    <div class="col-12" v-if="baseItem.item_type !== 'view'">
      <h6>Base view router</h6>
      {{ baseItem.item_type }}
      <span>{{ baseItem }}</span>
    </div>

  </div>

</template>

<script>
export default {
  name: "BaseViewRouter",
  props: ["baseItem", "baseConfig"],
  data() {
    return {
      baseItemComponentMap: {
        'view': 'edit-data-table'
      }
    }
  },
  mounted() {
    console.log("Mounted base view router", this.baseItem)
  }
}
</script>

<style scoped>

</style>
