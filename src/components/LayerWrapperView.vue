<template>
    <HeaderView v-if="!isLoading" />
    <div class="perspective">
        <div style="flex-direction: row; display: flex;">
            <a href="#" @click.prevent="switchProjectBackward()">Previous Page</a>
            <a href="#" @click.prevent="switchProjectForward()">Next Page</a>
        </div>

        <transition name="page-transition" @before-enter="beforeEnter" @after-enter="afterEnter"
            @before-leave="beforeLeave">
            <div v-if="!isLoading" class="page" :key="projectName">
                <LayerView v-if="projectName" :projectName="projectName" :headerHide="true" />
                <div v-if="currentProjectIndex === -1" class="cover-page">
                    <h2>{{ creatorUsername }}'s ArtBook</h2>
                    <div v-if="isLoading">Loading projects...</div>
                    <div v-else-if="errorMessage">{{ errorMessage }}</div>
                    <img class="profile-picture" :src="creatorProfilePicture">
                    <h3>Contains {{ projectCount }} projects.</h3>
                    <h4>Cumulative Likes: {{ projectKarmaTotal }}</h4>
                    <h4>Joined at: {{ creatorJoinDate }}</h4>
                    <FooterView/>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import LayerView from './LayerView.vue';
import axios from 'axios';
import { backendLayersAppAddress, backendMainAppAddress } from '@/config';
import HeaderView from './HeaderView.vue';
import FooterView from './FooterView.vue';
export default {
    components: {
        LayerView,HeaderView,FooterView
    },
    props: {
        creatorUsername: {
            type: String,
            required: true,
        },
        projectName: {
            type: String,
            required: false,
        },
    },
    data() {
        return {
            isForward: true,
            isLoading: false,
            creatorJoinDate: null,
            creatorProfilePicture: null,
            projectCount: 0,
            projectKarmaTotal: 0,
            creatorProjects: [],
            returnedCreatorUsername: "",
            projectsPagination: 1,
            currentProjectIndex: 0,
            errorMessage: ""
        };
    },
    watch: {
        async projectName() {
            this.isLoading = false;
            if(this.projectName === undefined){
            this.currentProjectIndex = -1;
        }
        }
    },
    async mounted() {
        if(this.projectName === undefined){
            this.currentProjectIndex = -1;
        }
        this.fetchCreatorInfo();
        this.fetchCreatorProjects();
    },
    methods: {
        async fetchCreatorInfo() {
            try {
                const creatorInfoResponse = await axios.get(`${backendLayersAppAddress}/creator/${this.creatorUsername}`);
                if (creatorInfoResponse.status == 404) {
                    this.errorMessage = "This user doesn't exist."
                }
                this.creatorJoinDate = new Date(creatorInfoResponse.data.joinDate).toLocaleString(undefined, {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                });
                this.creatorProfilePicture = `${backendMainAppAddress}/profile-picture/${creatorInfoResponse.data.creatorProfilePicture}`;
                this.projectCount = creatorInfoResponse.data.projectCount;
                this.projectKarmaTotal = creatorInfoResponse.data.projectKarmaTotal;
            } catch (error) {
                console.log(error);
            }
        }, async fetchCreatorProjects() {
            try {
                const response = await axios.get(`${backendLayersAppAddress}/creator/${this.creatorUsername}/projects?page=${this.projectsPagination - 1}`);
                this.creatorProjects.push(...response.data.projects);
            } catch (error) {
                console.error('Failed to fetch projects:', error);
            }
        },
        async switchProjectForward() {
            this.isForward = true;
            this.pushForward();
        },
        async switchProjectBackward() {
            this.isForward = false;
            this.pushBackward();
        },
        async pushForward() {
            this.currentProjectIndex += 1;
            if (this.projectCount > this.projectsPagination * 10 && this.currentProjectIndex % 10 === 9) {
                this.projectsPagination += 1;
                await this.fetchCreatorProjects();
            } else if (this.creatorProjects.length === this.currentProjectIndex) {
                this.currentProjectIndex = -1;
                this.$router.push({ 
                name: 'CreatorArtbookCover', 
                params: { creatorUsername: this.creatorUsername } 
                });
            } else {
                const nextProject = this.creatorProjects[this.currentProjectIndex];
                this.$router.push({ 
                name: 'CreatorArtbookProject', 
                params: { 
                    creatorUsername: this.creatorUsername, 
                    projectName: nextProject.id
                } 
                });
            }
            this.isLoading = true;
        },
        async pushBackward() {
            this.currentProjectIndex -= 1;
            if (this.currentProjectIndex === -1) {
                this.currentProjectIndex = -1;
                this.$router.push({ 
                name: 'CreatorArtbookCover', 
                params: { creatorUsername: this.creatorUsername } 
                });
            } else if (this.currentProjectIndex < -1) {
                this.currentProjectIndex = this.creatorProjects.length - 1;
                const previousProject = this.creatorProjects[this.currentProjectIndex];
                this.$router.push({ 
                name: 'CreatorArtbookProject', 
                params: { 
                    creatorUsername: this.creatorUsername, 
                    projectName: previousProject.id
                } 
                });
            }
            else {
                const previousProject = this.creatorProjects[this.currentProjectIndex];
                this.$router.push({ 
                name: 'CreatorArtbookProject', 
                params: { 
                    creatorUsername: this.creatorUsername, 
                    projectName: previousProject.id
                } 
                });
                this.isLoading = true;
            }
        },

        beforeEnter(el) {
            el.classList.add(this.isForward ? 'next' : 'previous');
        },
        afterEnter(el) {
            el.classList.remove('next', 'previous');
        },
        beforeLeave(el) {
            el.classList.add(this.isForward ? 'next' : 'previous');
        }
    },
};
</script>

<style>
.page {
    position: absolute;
}

.perspective {
    perspective: 1000px;
}


.page-transition-enter-from.previous {
    transform-origin: left center;
    transition: none;
    transform: rotateY(-180deg);
}

.page-transition-enter-to.previous {
    transform-origin: left center;
    transition: transform 1s ease-out;
    transform: rotateY(0deg);
}

.page-transition-leave-from.previous {
    transform-origin: left center;
    transform: rotateY(0deg);
    opacity: 1;
    transition: transform 1.5s ease-out, opacity 2s ease-out;
}

.page-transition-leave-to.previous {
    transform-origin: left center;
    transform: rotateY(0deg);
    opacity: 0;
    transition: transform 1.5s ease-out, opacity 2s ease-out;
}


.page-transition-enter-from.next {
    transform-origin: left center;
    z-index: 1;
    transform: rotateY(0deg);
}

.page-transition-enter-to.next {
    transform-origin: left center;
    transition: transform 1.5s ease-out;
    transform: rotateY(0deg);
}

.page-transition-leave-to.next {
    transform-origin: left center;
    transform: rotateY(-180deg);
    z-index: 5;
    opacity: 0;
    transition: transform 1.5s ease-out, opacity 3s ease-out;
}
.cover-page {
    width: 80vw; 
    height: 80vh;      
    margin-left: 0;              
    display: flex;                
    flex-direction: column;       
    text-align: left;             
    background-color: rgba(68, 68, 68, 0.8);
    border-radius: 1vh;          
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); 
    padding: 2vh;                
}
.profile-picture{
    max-width: 50vw;
    max-height: 50vh;
    object-fit: contain;
}

</style>