<template>
  <v-dialog v-model="dialog" max-width="500" persistent>
    <template #activator="{ props }">
      <v-btn v-bind="props" color="primary" prepend-icon="mdi-plus">
        Add Product
      </v-btn>
    </template>

    <v-card>
      <v-card-title>Create Product</v-card-title>

      <v-card-text>
        <v-form ref="formRef" v-model="valid" @submit.prevent="handleSubmit">
          <v-text-field
            v-model="form.name"
            class="mb-2"
            label="Name"
            :rules="[rules.required]"
          />

          <v-textarea
            v-model="form.description"
            class="mb-2"
            label="Description"
            rows="3"
          />

          <v-text-field
            v-model="form.category"
            class="mb-2"
            label="Category"
            :rules="[rules.required]"
          />

          <v-text-field
            v-model.number="form.price"
            class="mb-2"
            label="Price"
            min="0"
            prefix="$"
            :rules="[rules.required, rules.positive]"
            step="0.01"
            type="number"
          />

          <v-text-field
            v-model.number="form.quantity"
            label="Quantity"
            min="0"
            :rules="[rules.required, rules.nonNegative]"
            type="number"
          />
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="handleClose">Cancel</v-btn>
        <v-btn
          color="primary"
          :disabled="!valid"
          :loading="loading"
          variant="elevated"
          @click="handleSubmit"
        >
          Create
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import { reactive, ref } from 'vue'
  import { rules } from '@/shared/utils/validationRules'
  import { useProducts } from '../composables/useProducts'

  const emit = defineEmits(['created'])

  const { createProduct } = useProducts()

  const dialog = ref(false)
  const valid = ref(false)
  const loading = ref(false)
  const formRef = ref(null)

  const form = reactive({
    name: '',
    description: '',
    category: '',
    price: null,
    quantity: 0,
  })

  function resetForm () {
    form.name = ''
    form.description = ''
    form.category = ''
    form.price = null
    form.quantity = 0
    formRef.value?.resetValidation()
  }

  function handleClose () {
    dialog.value = false
    resetForm()
  }

  async function handleSubmit () {
    const { valid: isValid } = await formRef.value.validate()
    if (!isValid) {
      return
    }

    loading.value = true
    try {
      await createProduct({ ...form })
      emit('created')
      handleClose()
    } catch {
      // Stay open on error to give the user a chance to fix it. error is shown via snackbar
    } finally {
      loading.value = false
    }
  }
</script>
