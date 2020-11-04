<template>
  <div>

    <component :is="baseItemComponentMap[baseItemConfig.type]"
               v-if="baseItem && baseItemComponentMap[baseItemConfig.type]"
               :tableName="baseItemConfig.targetTable ? baseItemConfig.targetTable.TableName : null"
               :baseItem="baseItem"
               @save-base-item-contents="saveBaseItemContents"
    ></component>
  </div>

</template>

<script>
import {mapActions} from "vuex";

export default {
  name: "BaseViewRouter",
  props: ["baseItem", "baseConfig"],
  methods: {
    saveBaseItemContents(baseEncodedFileItem) {

      const that = this;
      console.log("Save contents for base", baseEncodedFileItem);
      that.baseItem.document_content[0].contents = baseEncodedFileItem;
      that.baseItem.tableName = "document";
      that.updateRow(that.baseItem).then(function (res) {
        console.log("base item content updated")
      }).catch(function (err) {
        console.log("Failed to save contents in base item", err);
        that.$q.notify({
          message: "Failed to save base item contents"
        })
      })
    },
    ...mapActions(['updateRow']),
  },

  data() {
    return {
      baseItemConfig: {},
      baseItemComponentMap: {
        'view': 'edit-data-table',
        'table': 'edit-data-table',
        'document': 'document-editor',
        'spreadsheet': 'spreadsheet-editor',
        'calendar': 'calendar-view',
      },
      targetTable: null,
    }
  },
  mounted() {
    console.log("Mounted base view router", this.baseItem);
    const that = this;
    // if (this.baseItem.document_extension === "view") {
    //   var targetTable = this.baseConfig.items.filter(function (e) {
    //     return e.type === "table" && e.label === that.baseItemConfig.attributes.TableName
    //   })[0]
    //   console.log("Table for data editor", targetTable)
    //   that.targetTable = targetTable;
    // }

  },
  watch: {
    'baseItem': function (e) {
      const that = this;
      console.log("Base item changed", that.baseItem)
      that.baseItemConfig = JSON.parse(atob(that.baseItem.document_content[0].contents))
      console.log("Base item config", that.baseItemConfig)
    }
  }
}
</script>

<style scoped>

</style>
