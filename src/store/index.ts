import { createStore, Store } from 'vuex'
import api from '../api/index.ts'

interface UserInfo {
  store: { marketplaceName: string; storeId: string }[]
}

interface State {
  error: string | null
  token: string | null
  userInfo: UserInfo | null
  chartData: any
  selectedDay: number
  salesDate: (string | null)[]
  salesSkuList: any
  skuRefundRate: any
  isDaysCompare: number
}

export default createStore<State>({
  state: {
    error: null,
    token: sessionStorage.getItem('accessToken') || null,
    userInfo: JSON.parse(sessionStorage.getItem('userInfo') || 'null'),
    chartData: null,
    selectedDay: 14,
    salesDate: [],
    salesSkuList: null,
    skuRefundRate: null,
    isDaysCompare: 0,
  },
  mutations: {
    setToken(state: State, token: string) {
      state.token = token
      sessionStorage.setItem('accessToken', token)
    },
    setUserInfo(state: State, info: UserInfo) {
      state.userInfo = info
      sessionStorage.setItem('userInfo', JSON.stringify(info))
    },
    setChartData(state: State, data: any) {
      state.chartData = data
    },
    logout(state: State) {
      state.token = null
      state.userInfo = null
      sessionStorage.removeItem('accessToken')
    },
    setError(state: State, error: string) {
      state.error = error
    },
    setSelectedDay(state: State, day: number) {
      state.selectedDay = day
    },
    setSalesDate(state: State, date: [string, string]) {
      const [salesDate, salesDate2] = date
      state.salesDate = [salesDate?.trim(), salesDate2?.trim()]
    },
    setSalesSkuList(state: State, data: any) {
      state.salesSkuList = data
    },
    setSkuRefundRate(state: State, rate: any) {
      state.skuRefundRate = rate
    },
    setIsDaysCompare(state: State, compare: number) {
      state.isDaysCompare = compare
    },
  },
  actions: {
    async login(
      { commit }: { commit: Function },
      { email, password }: { email: string; password: string },
    ) {
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
          commit('setToken', response.data.Data.AccessToken)
        } else {
          commit('setError', `Login failed! ${response.data.ApiStatusMessage}`)
        }
      } catch (error) {
        console.error('Login failed', error)
        commit('setError', `Login failed: ${error}`)
      }
    },
    async getUserInfo(
      { commit, state }: { commit: Function; state: State },
      { email }: { email: string },
    ) {
      if (state.token) {
        try {
          const response = await api.post('/user/user-information', { email })
          commit('setUserInfo', response.data.Data.user)
        } catch (error) {
          console.error('User Infos cannot be reached:', error)
        }
      }
    },
    async fetchSalesOverview({ commit, state }: { commit: Function; state: State }) {
      if (!state.userInfo) return
      try {
        const { marketplaceName, storeId } = state.userInfo.store[0]
        const response = await api.post('data/daily-sales-overview/', {
          marketplace: marketplaceName,
          sellerId: storeId,
          requestStatus: 0,
          day: state.selectedDay,
          excludeYoYData: true,
          customDateData: null,
        })
        commit('setChartData', response.data.Data)
      } catch (error) {
        console.error('Chart datas cannot be reached:', error)
      }
    },
    async fetchDailySalesSkuList({ commit, state }: { commit: Function; state: State }) {
      if (!state.salesDate[0] || (state.isDaysCompare && !state.salesDate[1])) return
      if (!state.userInfo) return
      const { marketplaceName, storeId } = state.userInfo.store[0]
      try {
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
    async fetchSkuRefundRate({ commit, state }: { commit: Function; state: State }) {
      if (!state.salesDate[0] || (state.isDaysCompare && !state.salesDate[1])) return
      if (!state.userInfo) return
      const { marketplaceName, storeId } = state.userInfo.store[0]
      try {
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
    getSelectedDay: (state: State) => state.selectedDay,
    getSalesDate: (state: State) => state.salesDate,
    getSkuRefundRate: (state: State) => state.skuRefundRate,
  },
})
