<template>
  <div>
    <h1>Upload PSD File</h1>
    <form @submit.prevent="uploadPsd">
      <div>
        <label for="title">Title:</label>
        <input type="text" class="dark-textarea" v-model="title" required />
      </div>
      <div>
        <label for="content">Content:</label>
        <textarea class="dark-textarea" v-model="content" required></textarea>
      </div>
      <label for="file">Select PSD File:</label>
      <div>
        <input type="file" @change="handleFileUpload" accept=".psd" required ref="fileInput" style="display: none;" />
      </div>
      <div class="buttons-container">
        <button type="button" class="dark-button" @click="triggerFileInput">
          Select File
        </button>
        <button type="submit" class="dark-button">Upload</button>
        <h2 v-if="file">{{ file.name }}</h2>
      </div>
    </form>
    <h1 v-if="errorMessage" class="error">{{ errorMessage }}</h1>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
  </div>
</template>

<script>
import axios from 'axios';
import { backendLayersAppAddress } from '@/config';

export default {
  data() {
    return {
      title: '',
      content: '',
      file: null,
      errorMessage: '',
      successMessage: ''
    };
  },
  methods: {
    async handleFileUpload(event) {
      const selectedFile = event.target.files[0];
      this.file = selectedFile;
    }, triggerFileInput() {
      this.$refs.fileInput.click();
    },
    async uploadPsd() {
      this.errorMessage = '';
      this.successMessage = '';

      const formData = new FormData();
      formData.append('file', this.file);
      formData.append('title', this.title);
      formData.append('content', this.content);

      try {
        const token = sessionStorage.getItem('loginJwt');
        const config = {
          headers: {
            Authorization: `${token}`,
            'Content-Type': 'multipart/form-data',
          },
        };

        const response = await axios.post(`${backendLayersAppAddress}/project`, formData, config);
        this.successMessage = response.data.msg;
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
  margin: 10px 15px 0px 0px;
}

.buttons-container {
  display: flex;
  flex-direction: row;
}
</style>