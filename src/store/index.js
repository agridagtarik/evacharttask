import api from '@/api'
import { createStore } from 'vuex'

export default createStore({
  state: {
    error: null,
    token: sessionStorage.getItem('accessToken') || null,
    userInfo: sessionStorage.getItem('userInfo') || null,
    chartData: null,
    selectedDay: 14,
    salesDate: [],
    salesSkuList: null,
    skuRefundRate: null,
    isDaysCompare: 0,
  },
  mutations: {
    setToken(state, token) {
      state.token = token
      sessionStorage.setItem('accessToken', token)
    },
    setUserInfo(state, info) {
      state.userInfo = info
      sessionStorage.setItem('userInfo', JSON.stringify(info))
    },
    setChartData(state, data) {
      state.chartData = data
    },
    logout(state) {
      state.token = null
      state.userInfo = null
      sessionStorage.removeItem('accessToken')
    },
    setError(state, error) {
      state.error = error
    },
    setSelectedDay(state, day) {
      state.selectedDay = day
    },
    setSalesDate(state, date) {
      const [salesDate, salesDate2] = date
      const _salesDate = salesDate?.split(':').pop().toString().trim()
      const _salesDate2 = salesDate2?.split(':').pop().toString().trim()
      state.salesDate = [_salesDate, _salesDate2]
    },
    setSalesSkuList(state, data) {
      state.salesSkuList = data
    },
    setSkuRefundRate(state, rate) {
      state.skuRefundRate = rate
    },
    setIsDaysCompare(state, compare) {
      state.isDaysCompare = compare
    },
  },
  actions: {
    async login({ commit }, { email, password }) {
      try {
        const response = await api.post('/oauth/token', {
          GrantType: 'password',
          Scope: 'amazon_data',
          ClientId: 'C0001',
          ClientSecret: 'SECRET0001',
          RedirectUri: 'https://api.eva.guru',
          Email: email,
          Password: password,
        })

        if (response.data.ApiStatusCode === 200) {
          const token = response.data.Data.AccessToken
          commit('setToken', token)
        } else {
          const errorMessage = response.data.ApiStatusMessage
          commit('setError', `Login failed! please check your infos. ${errorMessage}`)
        }
      } catch (error) {
        console.error('Login failed', error)
        commit('setError', `Loagin failed: ${error}`)
      }
    },
    async getUserInfo({ commit, state }, { email }) {
      if (state.token) {
        try {
          const response = await api.post('/user/user-information', {
            email,
          })
          const userInfo = response.data.Data.user
          commit('setUserInfo', userInfo)
        } catch (error) {
          console.error('User Infos cannot be reached:', error)
        }
      }
    },
    async fetchSalesOverview({ commit, state }) {
      const userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
      const savedUser = userInfo ?? state.userInfo
      try {
        const response = await api.post('data/daily-sales-overview/', {
          marketplace: savedUser.store[0].marketplaceName,
          sellerId: savedUser.store[0].storeId,
          requestStatus: state.selectedDay[0],
          day: state?.selectedDay,
          excludeYoYData: true,
        })
        const chartData = response.data.Data
        commit('setChartData', chartData)
      } catch (error) {
        console.error('Chart datas cannot be reached:', error)
      }
    },
    async fetchDailySalesSkuList({ commit, state }) {
      const userInfo = JSON.parse(sessionStorage.getItem('userInfo')) ?? state.userInfo
      if (!state.salesDate[0] || (state.isDaysCompare && !state.salesDate[1])) return

      try {
        const { marketplaceName, storeId } = userInfo.store[0]
        const body =
          state.isDaysCompare === 1
            ? {
                marketplace: marketplaceName,
                sellerId: storeId,
                salesDate: state.salesDate[0],
                salesDate2: state.salesDate[1],
                pageSize: 30,
                pageNumber: 1,
                isDaysCompare: 1,
              }
            : {
                marketplace: marketplaceName,
                sellerId: storeId,
                salesDate: state.salesDate[0],
                pageSize: 30,
                pageNumber: 1,
                isDaysCompare: 0,
              }
        const response = await api.post('data/daily-sales-sku-list/', body)

        commit('setSalesSkuList', response.data.Data)
      } catch (error) {
        console.error('daily-sales-sku-list req failed:', error)
      }
    },
    async fetchSkuRefundRate({ commit, state }) {
      const userInfo = JSON.parse(sessionStorage.getItem('userInfo')) ?? state.userInfo
      if (!state.salesDate[0] || (state.isDaysCompare && !state.salesDate[1])) return

      try {
        const { marketplaceName, storeId } = userInfo.store[0]
        const response = await api.post('data/get-sku-refund-rate/', {
          marketplace: marketplaceName,
          sellerId: storeId,
          skuList: state.salesSkuList?.item?.skuList || [],
          requestedDay: state.salesDate[0],
        })
        const skuRefundRate = response.data.Data

        commit('setSkuRefundRate', skuRefundRate)
      } catch (error) {
        console.error('get-sku-refund-rate req failed:', error)
      }
    },
  },
  getters: {
    getSelectedDay: (state) => state.selectedDay,
    getSalesDate: (state) => state.salesDate,
    getSkuRefundRate: (state) => state.skuRefundRate,
  },
})
