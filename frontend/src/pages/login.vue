<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuth } from '@/shared/composables/useAuth.js'
  import { useAppStore } from '@/shared/stores/app.js'

  definePage({
    meta: { layout: 'blank' },
  })

  const router = useRouter()
  const { login, isAuthenticated } = useAuth()
  const appStore = useAppStore()

  const email = ref('')
  const password = ref('')
  const loading = ref(false)
  const showPassword = ref(false)

  // Redirect if already authenticated
  if (isAuthenticated.value) {
    router.replace('/products')
  }

  async function handleSubmit () {
    if (!email.value || !password.value) return

    loading.value = true
    try {
      await login(email.value, password.value)
      router.push('/products')
    } catch (error) {
      appStore.showError(error.response?.data?.message || error.message || 'Login failed')
    } finally {
      loading.value = false
    }
  }
</script>

<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Inventory Manager</v-toolbar-title>
          </v-toolbar>

          <v-card-text>
            <v-form @submit.prevent="handleSubmit">
              <v-text-field
                v-model="email"
                label="Email"
                name="email"
                prepend-icon="mdi-email"
                type="email"
                autocomplete="email"
                :disabled="loading"
              />

              <v-text-field
                v-model="password"
                label="Password"
                name="password"
                prepend-icon="mdi-lock"
                :type="showPassword ? 'text' : 'password'"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                autocomplete="current-password"
                :disabled="loading"
                @click:append="showPassword = !showPassword"
              />

              <v-btn
                block
                color="primary"
                size="large"
                type="submit"
                :loading="loading"
                :disabled="!email || !password"
              >
                Sign In
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
