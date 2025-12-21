<template>
  <v-snackbar
    v-model="appStore.snackbar.show"
    :color="appStore.snackbar.color"
    location="bottom right"
    :timeout="appStore.snackbar.timeout"
  >
    {{ appStore.snackbar.message }}

    <template #actions>
      <v-btn variant="text" @click="appStore.hideSnackbar()">
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
  import { useAppStore } from '@/shared/stores/app'

  const appStore = useAppStore()
</script>
