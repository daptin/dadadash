<template>
  <div>
    <div v-if="baseItem.item_type === 'view'">
      <edit-data-table style="width: 100vw" v-if="targetTable" :tableName="targetTable.targetTable.TableName"></edit-data-table>
    </div>
    <div  class="col-12" v-if="baseItem.item_type !== 'view'">
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
      },
      targetTable: null,
    }
  },
  mounted() {
    console.log("Mounted base view router", this.baseItem);
    const that = this;
    if (this.baseItem.item_type === "view") {
      var targetTable = this.baseConfig.items.filter(function (e) {
        return e.item_type === "table" && e.label === that.baseItem.attributes.TableName
      })[0]
      console.log("Table for data editor", targetTable)
      that.targetTable = targetTable;
    }

  },
  watch: {
    'baseItem': function (e) {
      const that = this;
      if (this.baseItem.item_type === "view") {
        var targetTable = this.baseConfig.items.filter(function (e) {
          return e.item_type === "table" && e.label === that.baseItem.attributes.TableName
        })[0]
        console.log("Table for data editor", targetTable)
        that.targetTable = targetTable;
      }
    }
  }
}
</script>

<style scoped>

</style>
