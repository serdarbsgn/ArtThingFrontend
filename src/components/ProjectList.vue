<template>
  <HeaderView v-if="!isLoading" />
  <div class="centered-content">
    <h1>Project List</h1>
    <ul class="project-list">
      <li v-for="project in projects" :key="project.id" @click="navigateToProject(project.id)" class="project-item">
        <img :src="getThumbnailUrl(project.id)" :alt="`Thumbnail for ${project.title}`" class="thumbnail" />
        <div class="project-item-info">
          <h3>{{ project.title }}</h3>
          <p>by {{ project.creator }}</p>
          <p>{{ new Date(project.created_at).toLocaleString(undefined, {
            year: 'numeric', month: '2-digit', day:
              '2-digit', hour: '2-digit', minute: '2-digit'
          }) }}</p>
          <p>Likes: {{ project.likes }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { backendLayersAppAddress } from '@/config';
import HeaderView from './HeaderView.vue';
const projects = ref([]);
const router = useRouter();

onMounted(async () => {
  await fetchProjects();
});

async function fetchProjects() {
  try {
    const response = await axios.get(`${backendLayersAppAddress}/projects`);
    projects.value = response.data.projects;
  } catch (error) {
    console.error('Failed to fetch projects:', error);
  }
}

function navigateToProject(id) {
  router.push({ name: 'Project', params: { "projectName": id } });
}
function getThumbnailUrl(id) {
  return `${backendLayersAppAddress}/image/${id}/thumbnail.png`;
}
</script>

<style scoped>
ul {
  list-style-type: none;
  padding: 0;
}

li {
  cursor: pointer;
  padding: 5px;
}

li:hover {
  background-color: #79797980;
}

.project-list {
  display: flex;
  flex-wrap: wrap;
}

.project-item {
  width: calc(33%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  box-sizing: border-box;
}

.thumbnail {
  max-width: 100%;
  margin-top: auto;
}

.project-item-info {
  margin-top: auto;
  /* this pushes it to the bottom of the project-item container */
}

.centered-content {
  flex-direction: column;
  justify-content: center;
  text-align: center;
  min-height: 100vh;
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
</style>