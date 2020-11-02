<template>
  <div>
    {{ baseItem }}
    <component :is="baseItemComponentMap[baseItem.item_type]"
               v-if="baseItemComponentMap[baseItem.item_type] && baseItem.targetTable"
               :tableName="baseItem.targetTable.TableName"
               :config="baseItem"
    ></component>
  </div>

</template>

<script>
export default {
  name: "BaseViewRouter",
  props: ["baseItem", "baseConfig"],
  data() {
    return {
      baseItemComponentMap: {
        'view': 'edit-data-table',
        'table': 'edit-data-table',
        'document': 'edit-data-table',
        'spreadsheet': 'edit-data-table',
        'calendar': 'edit-data-table',
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
