<template>
  <div>
    <h1>Upload Profile Picture</h1>
    <form @submit.prevent="uploadPP">
      <div>
        <label for="file">Select Profile Picture:</label>
        <input type="file" @change="handleFileUpload" accept=".jpg" required />
      </div>
      <button type="submit" class="dark-button">Upload</button>
    </form>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
  </div>
</template>

<script>
import axios from 'axios';
import { backendMainAppAddress } from '@/config';
import { removeUserinfo } from '@/utils/helpers';

export default {
  data() {
    return {
      file: null,
      errorMessage: '',
      successMessage: '',
    };
  },
  methods: {
    async handleFileUpload(event) {
      const selectedFile = event.target.files[0];
      this.file = selectedFile;
    },
    async uploadPP() {
      this.errorMessage = '';
      this.successMessage = '';

      const formData = new FormData();
      formData.append('file', this.file);

      try {
        const token = sessionStorage.getItem('loginJwt');
        const config = {
          headers: {
            Authorization: `${token}`,
            'Content-Type': 'multipart/form-data',
          },
        };
        const response = await axios.post(`${backendMainAppAddress}/add-profile-picture`, formData, config);
        this.successMessage = response.data.msg;
        removeUserinfo();
        this.$router.push({ name: 'Home' })
      } catch (error) {
        if (error.response && error.response.data) {
          this.errorMessage = error.response.data.detail || 'An error occurred while uploading the file.';
        } else {
          this.errorMessage = 'An unexpected error occurred.';
        }
      }
    },
  },
};
</script>

<style scoped>
.error {
  color: red;
}

.success {
  color: green;
}

.dark-button {
  font-size: 17px;
  background-color: #0c4511;
  color: #bdbdbd;
  border: 1px solid #555;
}
</style>