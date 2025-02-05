<template>
  <div class="flex items-center justify-center min-h-screen bg-amber-400">
    <div class="bg-white p-8 rounded-lg shadow-md w-96">
      <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="block text-gray-700">Email</label>
          <input v-model="email" type="email" class="w-full p-2 border rounded-lg" required />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700">Password</label>
          <input v-model="password" type="password" class="w-full p-2 border rounded-lg" required />
        </div>
        <button
          type="submit"
          class="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
        >
          Submit
        </button>
      </form>
      <p v-if="errorMessage" class="text-red-500 mt-4 text-center">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const email = ref('homework@eva.guru')
    const password = ref('Homeworkeva1**')
    const errorMessage = ref('')
    const store = useStore()
    const router = useRouter()

    const handleLogin = async () => {
      try {
        await store.dispatch('login', { email: email.value, password: password.value })
        await store.dispatch('getUserInfo', { email: email.value })
        router.push('/dashboard')
        if (store.state.error) {
          errorMessage.value = store.state.error
        }
      } catch (error) {
        errorMessage.value = 'Login failed! Please check your infos.' + error.message
      }
    }

    return { email, password, errorMessage, handleLogin }
  },
}
</script>
