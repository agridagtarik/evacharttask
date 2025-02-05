<template>
  <div class="m-10 relative">
    <div class="flex justify-end align-bottom absolute top-1 right-2 z-10">
      <select v-model="selectedDay" @change="onDayChange">
        <option v-for="option in selectOptions" :key="option.value" :value="option.value">
          {{ option.name }}
        </option>
      </select>
    </div>
    <div class="sm:grid-cols-1">
      <highcharts class="block" :options="chartOptions"></highcharts>
    </div>
  </div>

  <div class="m-6">
    <DataGrid />
  </div>
</template>

<script>
import { computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import HighchartsVue from 'highcharts-vue'
import DataGrid from '@/components/DataGrid.vue'

export default {
  name: 'SalesChart',
  components: {
    highcharts: HighchartsVue.components,
    DataGrid,
  },
  setup() {
    const store = useStore()
    const selectedDay = computed({
      get: () => store.state.selectedDay,
      set: (value) => store.commit('setSelectedDay', Number(value)),
    })
    const salesDate = computed({
      get: () => store.state.salesDate,
      set: (value) => store.commit('setSalesDate', value),
    })

    const salesData = computed(() => store.state.chartData)
    const skuRefundRate = computed(() => store.state.skuRefundRate)

    const chartOptions = computed(() => ({
      chart: {
        type: 'column',
        height: 650,
      },
      title: { text: 'Daily Sales', align: 'left' },
      xAxis: {
        categories: salesData.value?.item.map((item) => formatDate(item.date)) || [],
        crosshair: {
          enabled: true,
        },
      },
      labels: {
        rotation: -45,
        align: 'right',
        style: {
          fontSize: '10px',
          fontWeight: 'bold',
        },
        y: 10,
      },
      yAxis: {
        title: { text: 'Amount ($)' },
        gridLineDashStyle: 'Dash',
        stackLabels: {
          enabled: true,
          style: {
            fontWeight: 'normal',
            color: 'white',
          },
          verticalAlign: 'middle',

          formatter: function () {
            if (this.total != 0) {
              return '$ ' + this.total
            }
          },
          rotation: -90,
        },
        min: 0,
      },
      series: [
        {
          name: 'Profit',
          data: salesData.value?.item?.map((item) => item.profit) || [],
          color: '#03F6CA',
          states: {
            inactive: {
              enabled: false,
            },
          },
        },
        {
          name: 'FBA Sales',
          data: salesData.value?.item?.map((item) => item.fbaAmount) || [],
          color: '#8C65F4',
          states: {
            inactive: {
              enabled: false,
            },
          },
        },
        {
          name: 'FBM Sales',
          data: salesData.value?.item?.map((item) => item.fbmAmount) || [],
          color: '#7602E1',
          states: {
            inactive: {
              enabled: false,
            },
          },
        },
      ],
      tooltip: {
        formatter: function () {
          const { fbaAmount, fbmAmount, fbaShippingAmount, profit } =
            salesData.value.item[this.point.index]
          return `<br>
                  <b>Total Sales: ${Number(fbaAmount + fbmAmount).toFixed(2)}$</b>
                  <br>
                  <b>Shipping: ${fbaShippingAmount}$</b>
                  <br>
                  <b>Profit: ${profit}$</b>
                  <br>
                  <b>FBA Sales: ${fbaAmount}$</b>
                  <br>
                  <b>FBM Sales: ${fbmAmount}$</b>
                  <br>
                  `
        },
      },
      plotOptions: {
        column: {
          stacking: 'normal',
          events: {
            click: function (event) {
              const selectedSalesDate = event.point.category
              store.commit('setSalesDate', [selectedSalesDate])

              const chart = this.chart

              const fbaSeriesIndex = chart.series.findIndex((s) => s.name === 'FBA Sales')
              const fbmSeriesIndex = chart.series.findIndex((s) => s.name === 'FBM Sales')

              if (fbaSeriesIndex !== -1 && fbmSeriesIndex !== -1) {
                const pointIndex = chart.series[0].data.findIndex(
                  (point) => point.category === selectedSalesDate,
                )
                if (pointIndex !== -1) {
                  if (!chart.clickedColors) {
                    chart.clickedColors = []
                  }
                  if (
                    chart.clickedColors.length === 2 &&
                    !chart.clickedColors.find((c) => c.date === selectedSalesDate)
                  ) {
                    chart.series.forEach((series) => {
                      series.data.forEach((point) => {
                        if (point.color_original) {
                          point.update({ color: point.color_original })
                          delete point.color_original
                        }
                      })
                    })
                    chart.clickedColors = []
                  }
                  const existingClickIndex = chart.clickedColors.findIndex(
                    (c) => c.date === selectedSalesDate,
                  )
                  if (existingClickIndex !== -1) {
                    const clickedColumn = chart.clickedColors[existingClickIndex]
                    const fbaPoint = chart.series[fbaSeriesIndex].data[pointIndex]
                    const fbmPoint = chart.series[fbmSeriesIndex].data[pointIndex]
                    fbaPoint.update({ color: clickedColumn.fbaOriginalColor })
                    fbmPoint.update({ color: clickedColumn.fbmOriginalColor })

                    chart.clickedColors.splice(existingClickIndex, 1)
                    const pickedSalesDate = chart.clickedColors.map((c) => c.date)
                    const isDaysCompare =
                      Array.isArray(pickedSalesDate) && pickedSalesDate.length === 2 ? 1 : 0
                    store.commit('setSalesDate', pickedSalesDate)
                    store.commit('setIsDaysCompare', isDaysCompare)
                    return
                  }
                  const color = chart.clickedColors.length === 0 ? 'green' : '#48A6A7'
                  const fbaPoint = chart.series[fbaSeriesIndex].data[pointIndex]
                  const fbmPoint = chart.series[fbmSeriesIndex].data[pointIndex]

                  if (!fbaPoint.color_original) {
                    fbaPoint.color_original = fbaPoint.color
                  }
                  if (!fbmPoint.color_original) {
                    fbmPoint.color_original = fbmPoint.color
                  }

                  fbaPoint.update({ color: color })
                  fbmPoint.update({ color: color })
                  chart.clickedColors.push({
                    date: selectedSalesDate,
                    fbaOriginalColor: fbaPoint.color_original,
                    fbmOriginalColor: fbmPoint.color_original,
                  })
                }
              }
              const pickedSalesDate = chart.clickedColors.map((c) => c.date)
              const isDaysCompare =
                Array.isArray(pickedSalesDate) && pickedSalesDate.length === 2 ? 1 : 0
              store.commit('setSalesDate', pickedSalesDate)
              store.commit('setIsDaysCompare', isDaysCompare)
            },
          },
        },
      },
      accessibility: { enabled: false },
      credits: { enabled: false },
    }))

    const updateChart = async () => await store.dispatch('fetchSalesOverview')

    const fetchDailySalesSkuList = async () =>
      await store
        .dispatch('fetchDailySalesSkuList')
        .then(() => store.dispatch('fetchSkuRefundRate'))

    const formatDate = (date) => {
      const _date = new Date(date)
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const dayName = days[_date.getDay()]

      return `${dayName}, ${_date.toISOString().split('T')[0]}`
    }

    const selectOptions = [
      { value: 60, name: 'Last 60 Days' },
      { value: 30, name: 'Last 30 Days' },
      { value: 14, name: 'Last 14 Days' },
      { value: 7, name: 'Last 7 Days' },
    ]

    const onDayChange = () => updateChart()

    watch(selectedDay, () => {
      updateChart()
    })
    watch(salesDate, () => {
      fetchDailySalesSkuList()
    })

    onMounted(async () => {
      await updateChart()
    })

    return {
      selectedDay,
      chartOptions,
      updateChart,
      onDayChange,
      selectOptions,
      skuRefundRate,
    }
  },
}
</script>
