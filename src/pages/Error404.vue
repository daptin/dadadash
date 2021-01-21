<template>
  <div class="fixed-center text-center q-pa-md">
    <p>
      <img
        src="~assets/sad.svg"
        style="width:30vw;max-width:150px;"
      >
    </p>
    <p class="text-faded">
      Sorry, nothing here...<strong>(404)</strong>
    </p>
    <q-btn
      color="secondary"
      style="width:200px;"
      @click="$router.back()"
      label="Go back"
    /> <q-btn
      color="primary"
      style="width:200px;"
      @click="$router.push('/')"
      label="Home"
    />
  </div>
</template>

<script>
export default {
  name: 'Error404'
}
</script>
