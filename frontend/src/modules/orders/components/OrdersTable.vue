<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <span>Orders</span>
      <v-spacer />
      <OrderDialog @created="handleOrderCreated" />
    </v-card-title>

    <v-card-text>
      <v-data-table
        :headers="headers"
        :items="orders"
        :loading="loading"
        :sort-by="ordersStore.sortBy"
        @update:sort-by="ordersStore.setSortBy"
      >
        <template #item.product="{ item }">
          {{ item.product?.name || 'N/A' }}
        </template>

        <template #item.created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>

        <template #item.actions="{ item }">
          <v-btn
            icon="mdi-delete"
            size="small"
            variant="text"
            color="error"
            @click="confirmDelete(item)"
          />
        </template>

        <template #no-data>
          <div class="text-center py-4">
            <p class="text-grey">No orders found</p>
          </div>
        </template>
      </v-data-table>
    </v-card-text>

    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete this order?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn
            color="error"
            variant="elevated"
            :loading="loading"
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
import { ref, onMounted } from 'vue'
import { useOrders } from '../composables/useOrders'
import { useOrdersStore } from '../stores/orders'

const { orders, loading, fetchOrders, deleteOrder } = useOrders()
const ordersStore = useOrdersStore()

const deleteDialog = ref(false)
const orderToDelete = ref(null)

const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'Product', key: 'product', sortable: false },
  { title: 'Quantity', key: 'quantity', sortable: true },
  { title: 'Created At', key: 'created_at', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' },
]

function formatDate(dateString) {
  return new Date(dateString).toLocaleString()
}

function handleOrderCreated() {
  fetchOrders()
}

function confirmDelete(order) {
  orderToDelete.value = order
  deleteDialog.value = true
}

async function handleDelete() {
  if (orderToDelete.value) {
    await deleteOrder(orderToDelete.value.id)
    deleteDialog.value = false
    orderToDelete.value = null
  }
}

onMounted(() => {
  fetchOrders()
})
</script>
