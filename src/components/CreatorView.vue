<template>
  <HeaderView v-if="!isLoading" />
  <div class="container">
    <div ref="page" class="page-content">
      <h1>This will be the page to show user with the username {{ creatorUsername }}</h1>
    </div>
    <button @click="turnPage">Turn Page</button>
    <button @click="resetPage">Reset</button>
  </div>
  <FooterView/>
</template>

<script>
import { backendMainAppAddress } from '@/config';
import { backendLayersAppAddress } from '@/config';
import axios from 'axios';
import HeaderView from './HeaderView.vue';
import FooterView from './FooterView.vue';
export default {
  components: { HeaderView,FooterView },
  props: {
    creatorUsername: {
      type: String,
      required: true,
    }
  },
  data() {
    return {
      picture: '',
      projectCount: 0,
      projectKarmaTotal: 0,
      projectCommentCount: 0,
      projectCommentKarmaTotal: 0,
      errorMessage: '',
      isLoading: false,
    };
  },
  methods: {
    turnPage() {
      const element = this.$refs.page;
      if (element) {
        element.style.transformOrigin = "left center"; // Set the rotation origin to the left edge
        element.style.transition = "transform 1.5s ease"; // Smooth transition over 0.5 seconds
        element.style.transform = "rotateY(-180deg)"; // Rotate the element by 180 degrees for a full page turn
      }
    },
    resetPage() {
      const element = this.$refs.page;
      if (element) {
        element.style.transform = "rotateY(0deg)"; // Reset the element to its original position
      }
    },
  },
};
</script>

<style scoped>
.container {
  perspective: 1000px; /* Add perspective to the container for a 3D effect */
  width: 30%;
}

.page-content {
  width: 100%;
  height: 400px;
  background-color: #939393;
  border: 1px solid #ccc;
  transform-style: preserve-3d; /* Enable 3D transformations */
  backface-visibility: hidden; /* Hide the back side when rotated */
}
</style>
