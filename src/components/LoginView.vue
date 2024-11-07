<template>
  <div class="login-container">
    <form @submit.prevent="login">
      <h2>Login</h2>
      <div>
        <label for="username">Username:</label>
        <input class="dark-textarea" type="text" id="username" v-model="username" required autocomplete="username"/>
      </div>
      <div>
        <label for="password">Password:</label>
        <input class="dark-textarea" type="password" id="password" v-model="password" required autocomplete="current-password" />
      </div>
      <button class="dark-button" type="submit">Login</button>
      <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
    </form>
  </div>
</template>

<script>
import { backendMainAppAddress } from '@/config';
import { getUserinfo } from '@/utils/helpers';
import axios from 'axios';

export default {
  name: "LoginView",
  props: {
    redirectOnLogin: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      username: '',
      password: '',
      errorMessage: '',
    };
  },
  methods: {
    async login() {
      this.errorMessage = '';
      try {
        const tokenResponse = await axios.get(`${backendMainAppAddress}/login`);
        const jwtToken = tokenResponse.data.token;

        const loginResponse = await axios.post(`${backendMainAppAddress}/login`, {
          username: this.username,
          password: this.password,
          token: jwtToken,
        });
        const loginToken = loginResponse.data.token;
        sessionStorage.setItem('loginJwt', loginToken);
        getUserinfo()
        window.parent.postMessage({ response: 'Logged In' }, '*');
        if (this.redirectOnLogin) {
          this.$router.push({ name: 'Home' });
        }
      } catch (error) {
        this.errorMessage = error.response.data.detail.msg || 'Login failed. Please try again.';
      }
    },
  },
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: auto;
}

.error {
  color: red;
}
.dark-textarea {
    margin-top: auto;
    font-size: 18px;
    background-color: #333;
    color: #bdbdbd;
    border: 1px solid #555;
    resize: none;
    overflow: hidden;
    width: 100%;
    box-sizing: border-box;
}
.dark-button {
    font-size: 17px;
    background-color: #0c4511;
    color: #bdbdbd;
    border: 1px solid #555;
}
</style>