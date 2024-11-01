<template>
  <div class="centered-content">
    <HeaderView v-if="!isLoading" :parentView="$route.name" @logout="logout"/>
    <p v-if="isLoading">Loading...</p>
    <div v-if="username">
      <h1>Welcome {{ username }}, to the Home Page!</h1>
      <div v-if="isProfilePictureClicked">
        <a href="#" @click.prevent="change_profile_picture">Change Picture</a>
        <a href="#" @click.prevent="remove_profile_picture">Remove Picture</a>
      </div>
      <img :src="picture" class="picture" title="Click to Change or Remove"
        @click.prevent="toggle_profile_picture_options" />
      <p>Here are some stats about you:</p>
      <p>Project Count: {{ projectCount }}</p>
      <p>Project Karma Total: {{ projectKarmaTotal }}</p>
      <p>Comment Count: {{ projectCommentCount }}</p>
      <p>Comment Karma Total: {{ projectCommentKarmaTotal }}</p>
      <a href="#" @click.prevent="artbook">See your ArtBook</a>
      <p>
        <a href="#" @click.prevent="logout">Logout</a>
      </p>
      <p>
        <a href="#" @click.prevent="project_upload">Upload Your Project</a>
      </p>
    </div>
    <div v-else>
      <h1>Welcome to the Home Page!</h1>
      <p>Please <a href="#" @click.prevent="login">login</a> to access your profile.</p>
      <p>or <a href="#" @click.prevent="register">register</a> to create your profile.</p>
    </div>
    <a href="#" @click.prevent="projects">Click Here For Projects</a>
  </div>
</template>

<script>
import { backendMainAppAddress } from '@/config';
import { getUserinfo, removeUserinfo, getUserProjectStats, removeUserstats } from '@/utils/helpers';
import axios from 'axios';
import HeaderView from './HeaderView.vue';
export default {
  components: { HeaderView, },
  data() {
    return {
      username: '',
      picture: '',
      projectCount: 0,
      projectKarmaTotal: 0,
      projectCommentCount: 0,
      projectCommentKarmaTotal: 0,
      errorMessage: '',
      isLoading: false,
      isProfilePictureClicked: false,
    };
  },
  methods: {
    async home() {
      this.errorMessage = '';
      this.isLoading = true;
      try {
        const userInfo = await getUserinfo();

        if (userInfo) {
          this.username = userInfo.username;
          this.picture = userInfo.picture;
        }
        const userStats = await getUserProjectStats();
        if (userStats) {
          this.projectCount = userStats.projectCount;
          this.projectKarmaTotal = userStats.projectKarmaTotal;
          this.projectCommentCount = userStats.projectCommentCount;
          this.projectCommentKarmaTotal = userStats.projectCommentKarmaTotal;
        }

      } catch (error) {
        this.errorMessage = error.response?.data?.detail || 'Failed to load data. Please try again.';
        if (error.response?.status === 401) {
          this.logout();
        }
      } finally {
        this.isLoading = false;
      }
    },
    async logout() {
      sessionStorage.removeItem('loginJwt');
      removeUserinfo();
      removeUserstats();
      this.username = "";
      this.$router.push({ name: 'Home' });
    },
    async login() {
      this.$router.push({ name: 'Login' })
    },
    async register() {
      this.$router.push({ name: 'Register' })
    },
    async projects() {
      this.$router.push({ name: 'ProjectList' })
    },
    async project_upload() {
      this.$router.push({ name: 'UploadProject' })
    },
    async change_profile_picture() {
      this.$router.push({ name: 'UploadProfilePicture' })
    },
    artbook(){
      this.$router.push({ name: 'CreatorArtbookCover' , params: { "creatorUsername": this.username } })
    },
    async remove_profile_picture() {
      try {
        removeUserinfo();
        const token = sessionStorage.getItem('loginJwt');
        const config = {
          headers: {
            Authorization: `${token}`,
          },
        };
        await axios.get(`${backendMainAppAddress}/remove-profile-picture`, config);
      } catch (error) {
        this.errorMessage = error.response.data.detail || 'Login failed. Please try again.';
      } finally {
        this.home();
      }
    },
    toggle_profile_picture_options() {
      this.isProfilePictureClicked = !this.isProfilePictureClicked;
    }
  },
  created() {
    this.home();
  },
};
</script>

<style scoped>
.centered-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 100vh;
}
.picture{
  max-width: 20vw;
}
.picture:hover{
  opacity: 0.8;
  transform: scale(0.85);
  cursor: pointer;
}

</style>