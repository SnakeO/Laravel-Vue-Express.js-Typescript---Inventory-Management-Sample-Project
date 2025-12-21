<template>
  <v-app>
    <v-navigation-drawer v-model="drawer">
      <v-list-item
        title="Inventory Manager"
        subtitle="Product & Order Management"
        class="py-4"
      />

      <v-divider />

      <v-list nav density="compact">
        <v-list-item
          prepend-icon="mdi-package-variant"
          title="Products"
          to="/products"
        />
        <v-list-item
          prepend-icon="mdi-cart"
          title="Orders"
          to="/orders"
        />
      </v-list>
    </v-navigation-drawer>

    <v-app-bar color="primary">
      <v-btn
        :icon="drawer ? 'mdi-chevron-left' : 'mdi-chevron-right'"
        variant="text"
        @click="drawer = !drawer"
      />
      <v-toolbar-title>Inventory Manager</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>

    <AppSnackbar />
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import AppSnackbar from '@/shared/components/AppSnackbar.vue'

const drawer = ref(true)
</script>
