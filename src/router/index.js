import { createRouter, createWebHistory } from 'vue-router';
import LayerView from '../components/LayerView.vue';
import ProjectList from '../components/ProjectList.vue';
import HomeView from '../components/HomeView.vue';
import LoginView from '@/components/LoginView.vue';
import UploadProjectView from '@/components/UploadProjectView.vue';
import UploadProfilePictureView from '@/components/UploadProfilePictureView.vue';
import CreatorView from '@/components/CreatorView.vue';
import LayerWrapperView from '@/components/LayerWrapperView.vue';
import RegisterView from '@/components/RegisterView.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
  },
  {
    path: '/project',
    name: 'ProjectList',
    component: ProjectList,
  },
  {
    path: '/project/:projectName',
    name: 'Project',
    component: LayerView,
    props: true,
  },
  {
    path: '/upload-project',
    name: 'UploadProject',
    component: UploadProjectView,
  },
  {
    path: '/upload-profile-picture',
    name: 'UploadProfilePicture',
    component: UploadProfilePictureView,
  },
  {
    path: '/creator/:creatorUsername',
    name: 'Creator',
    component: CreatorView,
    props: true
  },
  {
    path: '/creator/:creatorUsername/artBook',
    name: 'CreatorArtbookCover',
    component: LayerWrapperView,
    props: true
  },
  {
    path: '/creator/:creatorUsername/artBook/:projectName',
    name: 'CreatorArtbookProject',
    component: LayerWrapperView,
    props: true
  }


];

const router = createRouter({
  history: createWebHistory('/vue'),
  routes,
});

export default router;
