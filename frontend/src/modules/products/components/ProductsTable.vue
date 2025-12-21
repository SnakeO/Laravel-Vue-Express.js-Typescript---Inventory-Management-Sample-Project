<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <span>Products</span>
      <v-spacer />
      <ProductDialog @created="handleProductCreated" />
    </v-card-title>

    <v-card-text>
      <v-row class="mb-4">
        <v-col cols="12" sm="4">
          <v-text-field
            v-model="productsStore.filters.name"
            clearable
            density="compact"
            hide-details
            label="Filter by name"
            prepend-inner-icon="mdi-magnify"
            @update:model-value="debouncedFetch"
          />
        </v-col>
        <v-col cols="12" sm="4">
          <v-text-field
            v-model="productsStore.filters.category"
            clearable
            density="compact"
            hide-details
            label="Filter by category"
            prepend-inner-icon="mdi-tag"
            @update:model-value="debouncedFetch"
          />
        </v-col>
        <v-col class="d-flex align-center" cols="12" sm="4">
          <v-btn
            size="small"
            variant="text"
            @click="clearFilters"
          >
            Clear Filters
          </v-btn>
        </v-col>
      </v-row>

      <v-data-table-server
        v-model:items-per-page="perPage"
        v-model:page="page"
        :headers="headers"
        :items="products"
        :items-length="totalItems"
        :loading="loading"
        :sort-by="productsStore.sortBy"
        @update:options="handleTableOptions"
        @update:sort-by="productsStore.setSortBy"
      >
        <template #item.price="{ item }">
          ${{ item.price.toFixed(2) }}
        </template>

        <template #item.actions="{ item }">
          <v-btn
            color="error"
            icon="mdi-delete"
            size="small"
            variant="text"
            @click="confirmDelete(item)"
          />
        </template>

        <template #no-data>
          <div class="text-center py-4">
            <p class="text-grey">No products found</p>
          </div>
        </template>
      </v-data-table-server>
    </v-card-text>

    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete "{{ productToDelete?.name }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn
            color="error"
            :loading="loading"
            variant="elevated"
            @click="handleDelete"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
  import { ref } from 'vue'
  import { useProducts } from '../composables/useProducts'
  import { useProductsStore } from '../stores/products'

  const { products, loading, totalItems, fetchProducts, deleteProduct } = useProducts()
  const productsStore = useProductsStore()

  const deleteDialog = ref(false)
  const productToDelete = ref(null)
  const page = ref(1)
  const perPage = ref(20)

  const headers = [
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Description', key: 'description', sortable: false },
    { title: 'Category', key: 'category', sortable: true },
    { title: 'Price', key: 'price', sortable: true },
    { title: 'Quantity', key: 'quantity', sortable: true },
    { title: 'Actions', key: 'actions', sortable: false, align: 'center' },
  ]

  function buildParams () {
    return {
      ...productsStore.filters,
      page: page.value,
      per_page: perPage.value,
    }
  }

  let debounceTimer = null
  function debouncedFetch () {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      page.value = 1
      fetchProducts(buildParams())
    }, 300)
  }

  function clearFilters () {
    productsStore.clearFilters()
    page.value = 1
    fetchProducts(buildParams())
  }

  function handleProductCreated () {
    fetchProducts(buildParams())
  }

  // v-data-table-server fires @update:options on any pagination/sort change
  function handleTableOptions () {
    fetchProducts(buildParams())
  }

  function confirmDelete (product) {
    productToDelete.value = product
    deleteDialog.value = true
  }

  async function handleDelete () {
    if (productToDelete.value) {
      await deleteProduct(productToDelete.value.id)
      deleteDialog.value = false
      productToDelete.value = null
    }
  }
</script>
