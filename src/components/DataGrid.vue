<template>
  <div
    v-if="(salesDate[0] || salesDate[1]) && processedSkuRefundRate"
    class="relative overflow-x-auto shadow-md sm:rounded-lg"
  >
    <div class="relative m-4">
      <input
        v-model="searchQuery"
        type="text"
        class="appearance-none w-full py-3 pl-10 pr-4 text-gray-700 leading-tight outline-none bg-white border rounded-full lg:w-1/4"
      />
      <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
      </div>
    </div>
    <table class="w-full text-left rtl:text-right text-gray-500 dark:text-gray-400">
      <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" class="px-6 py-3">SKU</th>
          <th scope="col" class="px-6 py-3">Product Name</th>
          <th v-if="salesDate[0]" scope="col" class="px-3 py-3">
            <span>{{ salesDate[0] }}</span>
            <br />
            <span> Sales / Units </span>
            <br />
            <span> Avg. Selling Price </span>
          </th>
          <th v-if="salesDate[1]" scope="col" class="px-3 py-3">
            <span>{{ salesDate[1] }}</span>
            <br />
            <span> Sales / Units </span>
            <br />
            <span> Avg. Selling Price </span>
          </th>
          <th v-if="salesDate[0] && salesDate[1]" scope="col" class="px-3 py-3"></th>
          <th scope="col" class="px-6 py-3">
            SKU Refund Rate <br /><span class="capitalize">Last {{ selectedDay }} days</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="({ sku, refundRate }, index) in paginatedData"
          :key="index"
          class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <td
            scope="row"
            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
          >
            {{ sku.sku }}
          </td>
          <td
            scope="row"
            class="px-6 py-4 font-small text-gray-900 whitespace-wrap dark:text-white"
          >
            {{ sku.productName }}
          </td>
          <td
            v-if="salesDate[0]"
            scope="row"
            class="px-6 py-4 font-small text-gray-900 whitespace-nowrap dark:text-white"
            style="color: green"
          >
            $ {{ sku.amount }} / {{ sku.qty }}
            <br />
            $
            {{
              sku.amount === 0 && sku.qty === 0 ? '-' : parseFloat(sku.amount / sku.qty).toFixed(2)
            }}
          </td>
          <td
            v-if="salesDate[1]"
            scope="row"
            class="px-6 py-4 font-small text-gray-900 whitespace-nowrap dark:text-white"
            style="color: #48a6a7"
          >
            $ {{ sku.amount2 }} / {{ sku.qty2 }}
            <br />
            $
            {{
              sku.amount2 === 0 && sku.qty2 === 0
                ? '-'
                : parseFloat(sku.amount2 / sku.qty2).toFixed(2)
            }}
          </td>
          <td v-if="sku.amount > sku.amount2 && salesDate[1]">
            <font-awesome-icon :icon="['fas', 'chevron-down']" color="red" />
          </td>
          <td v-if="sku.amount < sku.amount2 && salesDate[1]">
            <font-awesome-icon :icon="['fas', 'chevron-up']" color="green" />
          </td>
          <td v-if="sku.amount == sku.amount2 && salesDate[1]">
            <font-awesome-icon :icon="['fas', 'minus']" color="gray" />
          </td>
          <td
            scope="row"
            class="px-6 py-4 font-small text-gray-900 whitespace-nowrap dark:text-white"
          >
            % {{ refundRate }}
          </td>
        </tr>
      </tbody>
    </table>
    <div class="flex justify-end items-center p-4">
      <button
        @click="prevPage"
        :disabled="currentPage === 1"
        class="px-3 py-1 mx-1 border rounded-full disabled:bg-gray-200 hover:cursor-pointer"
      >
        <font-awesome-icon :icon="['fas', 'chevron-left']" />
      </button>
      <button
        v-for="page in totalPages"
        :key="page"
        @click="currentPage = page"
        :class="{
          'bg-blue-500 text-white': currentPage === page,
          border: true,
          'px-3 py-1 mx-1 rounded-full': true,
        }"
      >
        {{ page }}
      </button>
      <button
        @click="nextPage"
        :disabled="currentPage >= totalPages"
        class="px-3 py-1 mx-1 border rounded-full disabled:bg-gray-200 hover:cursor-pointer"
      >
        <font-awesome-icon :icon="['fas', 'chevron-right']" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const skuRefundRate = computed(() => store.getters['getSkuRefundRate'])
const salesDate = computed(() => store.state.salesDate)
const selectedDay = computed(() => store.state.selectedDay)

const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

const filteredSkuRefundRate = computed(() => {
  return (
    skuRefundRate.value?.filter(({ sku }) =>
      sku.productName.toLowerCase().includes(searchQuery.value.toLowerCase()),
    ) || []
  )
})

const totalPages = computed(() =>
  Math.ceil(filteredSkuRefundRate.value.length / itemsPerPage.value),
)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredSkuRefundRate.value.slice(start, start + itemsPerPage.value)
})

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const processedSkuRefundRate = computed(() => {
  return skuRefundRate?.value?.map((item) => {
    return {
      sku: {
        ...item.sku,
      },
      refundRate: item.refundRate,
    }
  })
})
</script>
