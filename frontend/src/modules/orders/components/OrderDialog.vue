<template>
  <v-dialog v-model="dialog" max-width="500" persistent>
    <template #activator="{ props }">
      <v-btn v-bind="props" color="primary" prepend-icon="mdi-plus">
        Create Order
      </v-btn>
    </template>

    <v-card>
      <v-card-title>Create Order</v-card-title>

      <v-card-text>
        <v-form ref="formRef" v-model="valid" @submit.prevent="handleSubmit">
          <v-select
            v-model="form.product_id"
            class="mb-2"
            item-title="name"
            item-value="id"
            :items="products"
            label="Product"
            :loading="productsLoading"
            :rules="[rules.required]"
          >
            <template #item="{ item, props: itemProps }">
              <v-list-item v-bind="itemProps">
                <template #subtitle>
                  ${{ item.raw.price.toFixed(2) }} - {{ item.raw.quantity }} in stock
                </template>
              </v-list-item>
            </template>
          </v-select>

          <v-text-field
            v-model.number="form.quantity"
            label="Quantity"
            min="1"
            :rules="[rules.required, rules.positive, rules.maxStock(selectedProduct)]"
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
  import { computed, reactive, ref, watch } from 'vue'
  import { useProducts } from '@/modules/products'
  import { rules } from '@/shared/utils/validationRules'
  import { useOrders } from '../composables/useOrders'

  const emit = defineEmits(['created'])

  const { products, loading: productsLoading, fetchProducts } = useProducts()
  const { createOrder } = useOrders()

  const dialog = ref(false)
  const valid = ref(false)
  const loading = ref(false)
  const formRef = ref(null)

  const form = reactive({
    product_id: null,
    quantity: 1,
  })

  const selectedProduct = computed(() => {
    return products.value.find(p => p.id === form.product_id)
  })

  function resetForm () {
    form.product_id = null
    form.quantity = 1
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
      await createOrder(form)
      emit('created')
      handleClose()
    } catch {
      // Stay open on error to give the user a chance to fix it. error is shown via snackbar
    } finally {
      loading.value = false
    }
  }

  watch(dialog, isOpen => {
    if (isOpen) {
      fetchProducts()
    }
  })
</script>
