<template>
  <v-app>
    <v-navigation-drawer v-model="drawer">
      <v-list-item
        class="py-4"
        subtitle="Product & Order Management"
        title="Inventory Manager"
      />

      <v-divider />

      <v-list density="compact" nav>
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

      <template #append>
        <div v-if="user" class="pa-2">
          <v-divider class="mb-2" />
          <v-list-item
            :subtitle="user.email"
            :title="user.name"
            prepend-icon="mdi-account"
          />
          <v-btn
            block
            color="error"
            variant="outlined"
            prepend-icon="mdi-logout"
            @click="handleLogout"
          >
            Sign Out
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar color="primary">
      <v-btn
        :icon="drawer ? 'mdi-chevron-left' : 'mdi-chevron-right'"
        variant="text"
        @click="drawer = !drawer"
      />
      <v-toolbar-title>Inventory Manager</v-toolbar-title>

      <v-spacer />

      <template v-if="user">
        <span class="text-body-2 mr-2">{{ user.name }}</span>
        <v-btn icon="mdi-logout" variant="text" @click="handleLogout" />
      </template>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>

    <AppSnackbar />
  </v-app>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuth } from '@/shared/composables/useAuth.js'

  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuth()

  const drawer = ref(true)

  // Redirect to login if not authenticated
  if (!isAuthenticated.value) {
    router.replace('/login')
  }

  async function handleLogout () {
    await logout()
    router.push('/login')
  }
</script>
