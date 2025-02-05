<template>
  <header class="bg-[#13003B] text-white">
    <div class="container mx-auto flex justify-between items-center py-4 px-8">
      <div>
        <img
          src="https://eva.guru/wp-content/themes/evacommerce/assets/img/logo.svg"
          alt="eva_logo"
        />
      </div>

      <nav class="flex space-x-6">
        <router-link
          to="/dashboard"
          class="font-bold py-2 px-4 hover:bg-blue-800 rounded"
          active-class="border-b-2 border-white bg-[#47AE70]"
        >
          Home
        </router-link>
        <router-link
          to="/"
          class="font-bold py-2 px-4 hover:bg-blue-800 rounded"
          active-class="border-b-2 border-white bg-[#47AE70]"
        >
          Logout
        </router-link>
      </nav>

      <div v-if="parsedUserData" class="font-medium">Welcome, {{ parsedUserData.firstName }}!</div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useStore } from 'vuex'

const store = useStore()

const userData = store?.state?.userInfo
const parsedUserData = typeof userData == 'string' ? JSON.parse(userData) : userData
</script>
