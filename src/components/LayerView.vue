<template>
  <HeaderView v-if="!isLoading" />
  <p v-if="isLoading">Loading...</p>
  <div v-if="!isLoading">
    <h1><i>{{ title }}</i> by <a href=# @click="navigateToCreator(creator)">{{ creator }}</a></h1>
    <div ref="page" class="reactive-location" :class="{ vertical: isVertical }">
      <div>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/noUiSlider/15.8.0/nouislider.min.css">
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
        <canvas ref="canvas" width="0" height="0"></canvas>
        <div ref="slider"></div>
        <br>
        <div class="right-container">
          <a href="#" @click.prevent="projects">Back to Projects</a>
          <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
          <h3 class="likes"> <a href="#" :class="['like-button', { active: userLike === 'Like' }]"
              @click.prevent="toggleLike('Like')" title="Like">
              <span class="material-icons">thumb_up</span>
            </a> {{ likes }}
            <a href="#" :class="['dislike-button', { active: userLike === 'Dislike' }]"
              @click.prevent="toggleLike('Dislike')" title="Dislike">
              <span class="material-icons">thumb_down</span>
            </a>
          </h3>
        </div>
      </div>
      <div class="content-container" :class="{ vertical: isVertical }"
        :style="{ maxHeight: getContentMaxHeight() + 'px' }">
        <h2 class="content" v-html="content"></h2>
        <br>
        <h3>at: {{ created_at }}</h3> <br>
        <h1>Comments</h1><br>
        <CommentView :project_id="projectName" />
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import noUiSlider from 'nouislider';
import { backendLayersAppAddress } from '@/config';
import CommentView from './CommentView.vue';
import HeaderView from './HeaderView.vue';
export default {
  components: {
    CommentView,HeaderView
  },
  props: {
    projectName: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      layer_pos: [],
      layerCount: 0,
      images: [],
      title: "",
      creator: "",
      creator_id: "",
      content: "",
      likes: 0,
      created_at: null,
      scale: 1,
      userLike: null,
      viewingUser: null,
      isVertical: false,
      maxWidth: 0,
      maxHeight: 0,
      slider_min: 0,
      slider_max: 0,
      errorMessage: "",
      isLoading: true
    };
  },
  watch: {
    async projectName() {
      this.layer_pos = [];
      this.images = [];
      this.title = "";
      this.creator = "";
      this.creator_id = "";
      this.content="";
      this.likes = 0;
      this.created_at = null;
      this.userLike = null;
      this.viewingUser = null;
      this.isVertical = false;
      this.slider_min = 0;
      this.slider_max=0;
      this.errorMessage="";
      this.isLoading = true;
      this.scale = 1;
      this.maxWidth = 0;
      this.maxHeight = 0;
      await this.getLayerViewPageInfo();
      this.layerCount = this.layer_pos.length;
      this.loadAllImages();
      window.addEventListener('resize', this.handle_resize);
    },
  },
  async mounted() {
    await this.getLayerViewPageInfo();
    this.layerCount = this.layer_pos.length;
    this.loadAllImages();
    window.addEventListener('resize', this.handle_resize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handle_resize);
  },
  methods: {
    async getLayerViewPageInfo() {
      try {
        const token = sessionStorage.getItem('loginJwt');
        const config = {
          headers: {
            Authorization: `${token}`
          },
        };
        const response = await axios.get(`${backendLayersAppAddress}/project/${this.projectName}`, config);
        this.layer_pos = response.data.images.map(item => {
          const [, x, y] = item.replace('.png', '').split('_').map(Number);
          return [x, y];
        });
        this.title = response.data.title;
        this.creator = response.data.creator;
        this.creator_id = response.data.creator_id;
        this.content = response.data.content;
        this.likes = response.data.likes;
        this.created_at = new Date(response.data.created_at).toLocaleString(undefined, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
        this.userLike = response.data.user_like;
      } catch (error) {
        this.errorMessage = 'Unable to load project data. Please try again later.';
      }
    },
    async toggleLike(action) {
      try {
        const token = sessionStorage.getItem('loginJwt');
        const config = {
          headers: {
            Authorization: `${token}`,
          },
        };
        const url = `${backendLayersAppAddress}/project/${this.projectName}/${action === 'Like' ? 'like' : 'dislike'}`;
        const response = await axios.post(url, {}, config);
        if (['Liked', 'Unliked', 'Disliked', 'Undisliked'].includes(response.data.msg)) {
          if (this.userLike === null) {
            if (response.data.msg === 'Liked') {
              this.likes += 1;
              this.userLike = 'Like';
            } else if (response.data.msg === 'Disliked') {
              this.likes -= 1;
              this.userLike = 'Dislike';
            }
          } else if (this.userLike === 'Like') {
            if (response.data.msg === 'Unliked') {
              this.likes -= 1;
              this.userLike = null;
            } else if (response.data.msg === 'Disliked') {
              this.likes -= 2;
              this.userLike = 'Dislike';
            }
          } else if (this.userLike === 'Dislike') {
            if (response.data.msg === 'Undisliked') {
              this.likes += 1;
              this.userLike = null;
            } else if (response.data.msg === 'Liked') {
              this.likes += 2;
              this.userLike = 'Like';
            }
          }
        }
      } catch (error) {
        this.errorMessage = 'Log in first to leave a like/dislike.';
      }
    },
    loadImage(index) {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = `${backendLayersAppAddress}/image/${this.projectName}/${index}_${this.layer_pos[index][0]}_${this.layer_pos[index][1]}.png`;
        img.onload = () => resolve(img);
      });
    },
    async loadAllImages() {
      const imagePromises = [];
      for (let i = 0; i < this.layerCount; i++) {
        imagePromises.push(
          this.loadImage(i).then(img => {
            this.images[i] = img;
            this.maxWidth = Math.max(this.maxWidth, img.width + this.layer_pos[i][0]);
            this.maxHeight = Math.max(this.maxHeight, img.height + this.layer_pos[i][1]);
          })
        );
      }
      this.isLoading = false;
      await Promise.all(imagePromises);
      this.adjust_canvas_w_slider();
      this.adjust_orientation();
      this.setupSlider();
      
    },
    getContentMaxHeight() {
      const scaledHeight = this.maxHeight * this.scale ;
      let availableHeight = window.innerHeight - scaledHeight;
      if (this.isVertical) {
        availableHeight -= availableHeight * 0.2;// mind the gap (margin.)
      }
      return Math.max(scaledHeight, availableHeight);
    },
    adjust_canvas_w_slider() {
      const canvas = this.$refs.canvas;
      const aspectRatio = this.maxWidth / this.maxHeight;
      const screenAspectRatio = window.innerWidth / window.innerHeight;

      if (aspectRatio > screenAspectRatio) {
        canvas.width = window.innerWidth * 0.8;
        this.scale = canvas.width / this.maxWidth;
        canvas.height = this.maxHeight * this.scale;
      } else {
        canvas.height = window.innerHeight * 0.65;
        this.scale = canvas.height / this.maxHeight;
        canvas.width = this.maxWidth * this.scale;
      }
      const slider = this.$refs.slider;
      slider.style.width = `${canvas.width}px`;
    }
    ,
    adjust_orientation() {
      const canvas = this.$refs.canvas;
      if (canvas.width < window.innerWidth * 0.75) {
        this.isVertical = false;
      } else {
        this.isVertical = true;
      }
    },
    handle_resize() {
      this.adjust_canvas_w_slider();
      this.drawLayers(this.slider_min, this.slider_max);
      this.adjust_orientation();
    }
    ,
    drawLayers(min, max) {
      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = min; i <= max; i++) {
        const img = this.images[i];
        const x = this.layer_pos[i][0] * this.scale;
        const y = this.layer_pos[i][1] * this.scale;
        const width = img.width * this.scale;
        const height = img.height * this.scale;
        ctx.drawImage(img, x, y, width, height);
      }
    },
    setupSlider() {
      const slider = this.$refs.slider;
      if (slider.noUiSlider) {
        slider.noUiSlider.destroy();
      }
      noUiSlider.create(slider, {
        start: [0, this.layerCount - 1],
        connect: true,
        range: {
          min: 0,
          max: this.layerCount - 1,
        },
        step: 1,
      });

      slider.noUiSlider.on('update', (values) => {
        const [min, max] = values.map(Number);
        this.slider_min = min;
        this.slider_max = max;
        this.drawLayers(min, max);
      });
    },
    async projects() {
      this.$router.push({ name: 'ProjectList' })
    },
    async navigateToCreator(creator_username) {
      this.$router.push({ name: 'CreatorArtbookCover', params: { creatorUsername: creator_username } });
    }
  },
};
</script>

<style scoped>
canvas {
  border: 1px solid black;
  display: block;
  margin-bottom: 20px;
}

#slider {
  margin: 20px 0;
}

.like-button,
.dislike-button {
  font-size: 24px;
  margin: 0 10px;
  color: gray;
  text-decoration: none;
  transition: color 0.5s;
}

.like-button.active {
  color: rgb(255, 137, 137)
}

.dislike-button.active {
  color: rgb(137, 159, 255)
}

.error {
  color: red;
}
</style>

<style>
div.noUi-target .noUi-connect {
  background: rgb(86, 95, 125);
}

div.noUi-target .noUi-handle {
  background: rgb(255, 255, 255);
  border: 2px solid white;
}

div.noUi-target .noUi-handle:hover {
  background: rgb(218, 218, 218);
}

.reactive-location {
  display: flex;
  margin: 10px;
  word-break: break-word;
}

.reactive-location.vertical {
  flex-direction: column;
  align-items: flex-start;
}

.reactive-location:not(.vertical) {
  flex-direction: row;
}

.content-container.vertical {
  margin-top: 3%;
  overflow-y: auto;
}

.content-container:not(.vertical) {
  margin-left: 3%;
  padding-right: 0.5%;
  overflow-y: auto;
}

.right-container {
  display: flex;
  justify-content: flex-end;
}

.likes {
  font-size: 30px;
  font-family: 'Courier New', Courier, monospace;
}

.content {
  font-size: 24px;
  color: #aeaeae;
}

.content-container::-webkit-scrollbar {
  width: 10px;
  background-color: #383838;
}

.content-container::-webkit-scrollbar-thumb {
  background-color: #4d4d4d;
}

.content-container::-webkit-scrollbar-thumb:hover {
  background-color: #6e6e6e;
}
</style>