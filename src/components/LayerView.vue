<template>
  <HeaderView v-if="!headerHide" />
  <p v-if="isLoading">Loading...</p>
  <div v-if="!isLoading">
    <h1><i>{{ title }}</i> by <a href=# @click="navigateToCreator(creator)">{{ creator }}</a></h1>
    <div ref="page" class="reactive-location" :class="{ vertical: isVertical }">
      <div>
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
        <div v-if="variations > 0">
          <button class="dark-button" @click.prevent="callPreviousVariant">Prev Variant</button>
          <button class="dark-button" @click.prevent="callNextVariant">Next Variant</button>
          <template v-if="currentVariant != 0 || variationsPerLayer.some(layer => layer !== 0)">
            <button class="dark-button" @click.prevent="callOriginal">Original</button>
            <p>Note: Image now contains AI generated variant, please don't judge original content according to it.</p>
          </template>
          <template v-else>
            <p>Try the slider and buttons to change how image looks.</p>
          </template>
          <div v-for="layer, index in variationsPerLayer">
            <div v-if="index + 1 >= slider_min && index + 1 <= slider_max" style="display: flex;">
              <h3>Layer #{{ index + 1 }}</h3>
              <button class="dark-button" @click.prevent="changeVariationPerLayer(index, -1)">Prev</button>
              <h3>Variant# {{ variationsPerLayer[index] }}</h3>
              <button class="dark-button" @click.prevent="changeVariationPerLayer(index, +1)">Next</button>
            </div>
          </div>
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
  <br>
  <FooterView />
</template>
<script>
import axios from 'axios';
import "@/assets/nouislider.css";
import noUiSlider from 'nouislider';
import { backendLayersAppAddress } from '@/config';
import CommentView from './CommentView.vue';
import HeaderView from './HeaderView.vue';
import FooterView from './FooterView.vue';
export default {
  components: {
    CommentView, HeaderView, FooterView
  },
  props: {
    projectName: {
      type: String,
      required: true,
    }, headerHide: {
      type: Boolean,
      default: false
    }
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
      isLoading: true,
      variations: 0,
      currentVariant: 0,
      variationsPerLayer: []
    };
  },
  watch: {
    async projectName() {
      this.layer_pos = [];
      this.images = [];
      this.title = "";
      this.creator = "";
      this.creator_id = "";
      this.content = "";
      this.likes = 0;
      this.created_at = null;
      this.userLike = null;
      this.viewingUser = null;
      this.isVertical = false;
      this.slider_min = 0;
      this.slider_max = 0;
      this.errorMessage = "";
      this.isLoading = true;
      this.scale = 1;
      this.maxWidth = 0;
      this.maxHeight = 0;
      this.variations = 0;
      this.currentVariant = 0;
      await this.getLayerViewPageInfo();
      this.layerCount = this.layer_pos.length;
      this.setup();
      window.addEventListener('resize', this.handle_resize);
    }, currentVariant() {
      this.variationsPerLayer = Array((this.layer_pos.length) - 1).fill(this.currentVariant);//-1 since no variations for bottom layer.
      this.setup(this.currentVariant);
    }
  },
  async mounted() {
    await this.getLayerViewPageInfo();
    this.layerCount = this.layer_pos.length;
    this.setup();
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
          const [, x, y] = item.replace('.webp', '').replace('.png', '').split('_').map(Number);
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
        this.variations = response.data.variations || 0;
        this.currentVariant = 0;
        this.variationsPerLayer = Array((this.layer_pos.length) - 1).fill(0);//-1 since no variations for bottom layer.
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
    loadImage(index, variant = 0) {
      return new Promise((resolve) => {
        const img = new Image();
        if (variant == 0){
          img.src = `${backendLayersAppAddress}/image/${this.projectName}/${index}_${this.layer_pos[index][0]}_${this.layer_pos[index][1]}.png`;
        }
        else if (variant > 0) {
          if (index == 0) {
          img.src = `${backendLayersAppAddress}/image/${this.projectName}/${index}_${this.layer_pos[index][0]}_${this.layer_pos[index][1]}.webp`;
        } 
          img.src = `${backendLayersAppAddress}/image/${this.projectName}/${index}_${this.layer_pos[index][0]}_${this.layer_pos[index][1]}_${variant}.webp`;
        }
        img.onload = () => resolve(img);
      });
    },
    callNextVariant() {
      const nextVariant = this.currentVariant + 1;
      if (nextVariant > this.variations) {
        this.currentVariant = 0;
      } else {
        this.currentVariant = nextVariant;
      }
    },
    callPreviousVariant() {
      const nextVariant = this.currentVariant - 1;
      if (nextVariant < 0) {
        this.currentVariant = this.variations;
      } else {
        this.currentVariant = nextVariant;
      }
    },
    callOriginal() {
      if (this.currentVariant === 0) {
        this.variationsPerLayer = Array((this.layer_pos.length) - 1).fill(this.currentVariant);
        this.drawLayersVariationsArray();
      }
      this.currentVariant = 0;
    },
    async loadAllImagesOfVariant(variant) {
      if (!this.images[variant]) {
        this.images[variant] = [];
      }
      const imagePromises = [];
      for (let i = 0; i < this.layerCount; i++) {
        if (!this.images[variant][i]) {
          imagePromises.push(this.loadImageOfVariant(i, variant));
        }
      }
      this.isLoading = false;
      if (imagePromises.length > 0) {
        await Promise.all(imagePromises);
      }
      this.adjust_canvas_w_slider();
      this.adjust_orientation();
      this.setupSlider();

      if (this.images[variant].length > 0) {
        this.drawLayersVariationsArray(this.slider_min, this.slider_max);
      }
    },
    async loadImageOfVariant(index, variant) {
      if (this.images[variant] === undefined) {
        this.images[variant] = [];
      }
      if (variant !== 0 && index === 0) {
        this.images[variant][index] = this.images[0][0];
        return;
      }
      if (this.images[variant][index] === undefined) {
        const img = await this.loadImage(index, variant);
        this.images[variant][index] = img;
        this.maxWidth = Math.max(this.maxWidth, img.width + this.layer_pos[index][0]);
        this.maxHeight = Math.max(this.maxHeight, img.height + this.layer_pos[index][1]);
      }
    },
    async setup(variant = 0) {
      this.isLoading = false;
      await this.loadAllImagesOfVariant(variant);
      this.adjust_canvas_w_slider();
      this.adjust_orientation();
      this.setupSlider();
      if (this.images[variant].length > 0) {
        this.drawLayersVariationsArray(this.slider_min, this.slider_max)
      }
    },
    getContentMaxHeight() {
      const scaledHeight = this.maxHeight * this.scale;
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
      this.drawLayersVariationsArray(this.slider_min, this.slider_max);
      this.adjust_orientation();
    },
    async changeVariationPerLayer(index, step) {
      const next = this.variationsPerLayer[index] + step;
      if (next < 0) {
        this.variationsPerLayer[index] = this.variations;
      } else if (next > this.variations) {
        this.variationsPerLayer[index] = 0;
      } else {
        this.variationsPerLayer[index] = next;
      }
      const v = this.variationsPerLayer[index];
      await this.loadImageOfVariant(index + 1, v);//+1 since no variations for bottom layer.
      this.drawLayersVariationsArray();
    },
    getClearCtx() {
      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return ctx;
    }
    , drawLayer(index, img, ctx) {
      const x = this.layer_pos[index][0] * this.scale;
      const y = this.layer_pos[index][1] * this.scale;
      const width = img.width * this.scale;
      const height = img.height * this.scale;
      ctx.drawImage(img, x, y, width, height);
    }
    ,
    drawLayersVariationsArray() {
      const ctx = this.getClearCtx();
      for (let i = this.slider_min; i <= this.slider_max; i++) {
        let img;
        if (i === 0) {
          img = this.images[0][0];
        } else {
          img = this.images[this.variationsPerLayer[i - 1]][i];
        }
        this.drawLayer(i, img, ctx);
      }
    },
    drawLayers(min, max) {
      const ctx = this.getClearCtx();
      for (let i = min; i <= max; i++) {
        const img = this.images[this.currentVariant][i];
        this.drawLayer(i, img, ctx);
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
        this.drawLayersVariationsArray(min, max);
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

.dark-button {
  font-size: 17px;
  background-color: #0c4511;
  color: #bdbdbd;
  border: 1px solid #555;
  margin: 7px;
  border-radius: 5px;
  cursor: pointer;
}

.dark-button:hover {
  background-color: #14631a;
  color: #ffffff;
  border-color: #777;
}
</style>