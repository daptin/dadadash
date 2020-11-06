<template>
  <div>
    <component :is="baseItemComponentMap[baseItem.document_extension]"
               v-if="showComponent && baseItemConfig && baseItemComponentMap[baseItem.document_extension]"
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
    reloadBaseItem() {
      const that = this;
      that.showComponent = false;
      console.log("Base item changed", that.baseItem)
      if (!that.baseItem.document_content) {
        that.baseItemConfig = that.baseItem;
      } else {
        try {
          that.baseItemConfig = JSON.parse(atob(that.baseItem.document_content[0].contents))
        } catch (e) {
          console.log("Failed to read contents of item", that.baseItem)
          that.baseItemConfig = that.baseItem;
        }
      }

      if (!that.baseItemConfig.targetTable) {
        if (that.baseItemConfig.attributes && that.baseItemConfig.attributes.TableName) {
          that.baseItemConfig.targetTable = that.tableMap[that.baseItemConfig.attributes.TableName]
        } else if (that.baseItemConfig.target && that.baseItemConfig.target.name) {
          that.baseItemConfig.targetTable = that.tableMap[that.baseItemConfig.target.name]
        }
      }

      console.log("Base item config 2", that.baseItemConfig)
      that.$nextTick().then(function () {
        that.showComponent = true;
      })
    },
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
      showComponent: true,
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
      tableMap: {},
    }
  },
  mounted() {
    console.log("Mounted base view router", this.baseItem, this.baseConfig);
    const that = this;

    that.tableMap = {}

    for (var i = 0; i < that.baseConfig.items.length; i++) {
      var item1 = that.baseConfig.items[i];
      if (item1.type === "table") {
        that.tableMap[item1.label] = item1.targetTable
      }
    }


    if (!that.baseItem) {
      that.baseItemConfig = {}
      return
    }
    that.reloadBaseItem();

    console.log("Base item config 1", that.baseItemConfig)

  },
  watch: {
    'baseItem': function (e) {
      this.reloadBaseItem();
    }
  }
}
</script>

<style scoped>

</style>
