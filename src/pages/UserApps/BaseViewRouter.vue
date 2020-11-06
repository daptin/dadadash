<template>
  <div>
    <component :is="baseItemComponentMap[baseItem.document_extension]"
               v-if="baseItemConfig && baseItemComponentMap[baseItem.document_extension]"
               :baseItem="baseItemConfig"
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
      console.log("Save contents for base", that.baseItem, baseEncodedFileItem.length);

      that.baseItemConfig.file = baseEncodedFileItem;
      that.baseItem.document_content[0].contents = "application/json," + btoa(JSON.stringify(that.baseItemConfig));
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
      baseItemConfig: null,
      baseItemComponentMap: {
        'view': 'edit-data-table',
        'table': 'edit-data-table',
        'document': 'document-editor',
        'folder': 'file-browser',
        'spreadsheet': 'spreadsheet-editor',
        'calendar': 'calendar-view',
      },
      targetTable: null,
    }
  },
  mounted() {
    console.log("Mounted base view router", this.baseItem, this.baseConfig);
    const that = this;
    if (!that.baseItem) {
      that.baseItemConfig = {}
      return
    }
    that.baseItemConfig = JSON.parse(atob(that.baseItem.document_content[0].contents))
    console.log("Base item config", that.baseItemConfig)

  },
  watch: {
    'baseItem': function (e) {
      const that = this;
      console.log("Base item changed", that.baseItem)
      if (!that.baseItem.document_content) {
        that.baseItemConfig = that.baseItem;
        return;
      }
      that.baseItemConfig = JSON.parse(atob(that.baseItem.document_content[0].contents))
      console.log("Base item config", that.baseItemConfig)
    }
  }
}
</script>

<style scoped>

</style>
