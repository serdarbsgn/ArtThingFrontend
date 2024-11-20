<template>
  <div class="register-container">
    <form @submit.prevent="login">
      <h2>Register</h2>
      <div>
        <label for="usernameRegister">Username:</label>
        <input class="dark-textarea" type="text" id="usernameRegister" v-model="username" required />
      </div>
      <div>
        <label for="emailRegister">Email:</label>
        <input class="dark-textarea" type="email" id="emailRegister" v-model="email" required />
      </div>
      <div>
        <label for="passwordRegister">Password:</label>
        <input class="dark-textarea" type="password" id="passwordRegister" v-model="password" required autocomplete="off"/>
      </div>
      <button class="dark-button" type="submit">Register</button>
      <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
    </form>
    <a href="#" @click.prevent="loginWithGoogle">Register using Google</a>
  </div>
</template>

<script>
import { backendMainAppAddress } from '@/config';
import axios from 'axios';

export default {
  props: {
    redirectOnLogin: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      username: '',
      email: '',
      password: '',
      errorMessage: '',
    };
  },
  methods: {
    async login() {
      this.errorMessage = '';
      try {
        const tokenResponse = await axios.get(`${backendMainAppAddress}/register`);
        const jwtToken = tokenResponse.data.token;

        const registerResponse = await axios.post(`${backendMainAppAddress}/register`, {
          username: this.username,
          email: this.email,
          password: this.password,
          token: jwtToken,
        });
        if(this.redirectOnLogin){
          this.$router.push({ name: 'Login' });
        }else{
          this.$emit("registerSuccess");
        }
        this.username = "";
        this.email="";
        this.password = "";
      } catch (error) {
        this.errorMessage = error.response.data.detail[0].loc[1] + error.response.data.detail[0].msg || 'Register failed. Please try again.';
      }
    },
  },
  async loginWithGoogle() {
    let currentUrl = window.location.pathname;
    if (currentUrl === "/login" || currentUrl === "/register") {
      currentUrl = "/";
    }
    const redirectUrl = `/api/google-register?url=${encodeURIComponent(currentUrl)}`;
    if (this.inIframe) {
      window.parent.location.href = redirectUrl;
    } else {
      window.location.href = redirectUrl;
    }
  }
};
</script>

<style scoped>
.register-container {
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