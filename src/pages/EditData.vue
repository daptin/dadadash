<template>

  <edit-data-table style="margin-top:50px" v-if="tableName"
                   :base-item="{targetTable: {TableName: this.$route.params.tableName}}"></edit-data-table>

</template>
<style>

</style>

<script>

export default {
  name: "TableDataEditor",
  data() {
    return {
      tableName: null
    }
  },
  mounted() {
    console.log("Mounted table data editor", this.$route.params.tableName)
    this.tableName = this.$route.params.tableName;
  }
}
</script>

<style scoped>

</style>
