<template>
    <p v-if="isLoading">Loading...</p>
    <div v-if="!isLoading">
        <div v-if="errorMessage">
            <h2 class="error">{{ errorMessage }}</h2>

        </div>
        <div ref="commentsContainer" class="commentsContainer">
            <template v-if="parent_id == 0">
                <div :id="`reply-input-${0}`" class="reply-input" style="display: block;">
                    <textarea :id="`reply-content-${0}`" placeholder="Type your comment here..."
                        @input="adjustTextareaHeight($event)" rows="1" class="dark-textarea"></textarea>
                </div>
                <div class="button-container">
                    <button @click.prevent="submitReply()" class="dark-button">Comment</button>
                </div>
            </template>
            <teleport to="body">
            <div v-if="showDeleteConfirm" class="modal-overlay">
                <div class="modal-content" ref="modalContent" v-on:blur="cancelDelete" tabindex="0">
                    <p>Are you sure you want to <strong>delete</strong> this comment?</p>
                    <br>
                    <div style="display: flex; justify-content:space-evenly;">
                        <button class="dark-button" @click="deleteComment">Yes</button>
                        <button class="dark-button" @click="cancelDelete">No</button>
                    </div>
                </div>
            </div>
        </teleport>
            <div v-for="comment in parsedComments" :key="comment.id" :id="`comment-${comment.id}`" class="comment">
                <br>
                <div><strong :class="{ 'comment-text': comment.parent_id === 0, 'reply-text': comment.parent_id !== 0 }"
                        v-html="comment.content">
                    </strong><br>
                    <i class="divider-text"> by </i><i class="username">{{ comment.username }}</i>
                    <i class="divider-text"> at </i><i class="timestamp">{{ new
                        Date(comment.changed_at).toLocaleString(undefined, {
                            year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                        }) }}</i>

                    <a href="#" :class="['like-button', { active: comment.l_d === 'Like' && username }]"
                        @click.prevent="likeComment(comment)"><span class="material-icons">thumb_up</span></a>
                    <span class="like-count"> {{ comment.likes }} </span>
                    <a href="#" :class="['dislike-button', { active: comment.l_d === 'Dislike' && username }]"
                        @click.prevent="dislikeComment(comment)"><span class="material-icons">thumb_down</span></a>
                    <a href="#" class="reply-link" @click.prevent="toggleReplyField(comment)">{{ comment.replyFieldText
                        }}</a>

                    <template v-if="comment.username === username">
                        <a href="#" class="delete-link" @click.prevent="confirmDeletePrompt(comment)">Delete</a>
                    </template>
                </div>
                <div>
                    <div :id="`reply-input-${comment.id}`" class="reply-input"
                        v-show="comment.replyFieldText === 'Hide'">
                        <textarea :id="`reply-content-${comment.id}`" placeholder="Type your comment here..."
                            @input="adjustTextareaHeight($event)" rows="1" class="dark-textarea"
                            v-focus="[comment.id, currentReplyFocus]"></textarea>
                        <div class="button-container">
                            <button @click.prevent="submitReply(comment)" class="dark-button">Reply</button>
                        </div>
                    </div>
                    <template v-if="comment.replies > 0">
                        <a href="#" class="show-replies-link"
                            @click.prevent="comment.showReplies = !comment.showReplies">
                            {{ showRepliesText(comment) }}
                        </a>
                    </template>
                    <template v-if="comment.replies > 0">
                        <div :style="{ marginLeft: margin_left + '%' }" v-if="comment.showReplies">
                            <CommentView :project_id="project_id" :parent_id="comment.id" />
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { nextTick } from 'vue';
const focusDirective = {
    updated(el, binding) {
        if (binding.value && binding.value[0] == binding.value[1]) {
            nextTick(() => {
                el.focus();
            });
        }
    }
};

const vFocus = focusDirective;
</script>



<script>
import { backendLayersAppAddress } from '@/config';
import { username,dropdownLoginVisible } from '@/utils/helpers';
import { nextTick } from 'vue';
import axios from 'axios';

export default {
    props: {
        project_id: {
            type: String,
            required: true,
        },
        parent_id: {
            type: Number,
            default: 0
        },
        page:{
            type:Number,
            default:0
        },
        margin_left: {
            type: Number,
            default: 2
        }
    },
    data() {
        return {
            errorMessage: '',
            errorCode: 0,
            parsedComments: [],
            isLoading: true,
            username,
            showDeleteConfirm: false,
            commentToDelete: null,
            currentReplyFocus: null
        };
    },
    watch: {
        project_id(newVal) {
            this.parsedComments = [];
            this.fetch_replies(this.parent_id, 0);
        },errorMessage(){
            setTimeout(() => {
                this.errorMessage="";
            }, 5000);
        }
    },
    mounted() {
        this.fetch_replies(this.parent_id, 0);
        this.isLoading = false;
    },
    methods: {
        async fetch_replies(parent_id, page) {
            if(this.parsedComments.length > 0){
                return;
            }
            this.errorMessage = '';
            const token = sessionStorage.getItem('loginJwt');
            try {
                const config = {
                    params: {
                        parent_id: parent_id,
                        page: page
                    },
                    headers: {
                        Authorization: token,
                    }
                };
                const fetchCommentsResponse = await axios.get(`${backendLayersAppAddress}/project/${this.project_id}/comments`, config);
                this.parsedComments = fetchCommentsResponse.data.replies.map(comment => ({ ...comment, showReplies: false, replyFieldText: "Reply" }));
            } catch (error) {
                this.errorMessage = error.response.data.detail || 'Something went wrong.';
                this.errorCode = error.status;
            }
        },
        toggleReplyField(comment) {
            comment.replyFieldText = comment.replyFieldText === "Reply" ? "Hide" : "Reply";
            this.currentReplyFocus = comment.id;
        },
        adjustTextareaHeight(event) {
            const textarea = event.target;
            textarea.style.height = 'auto'; // Reset height to calculate the new size
            textarea.style.height = `${textarea.scrollHeight}px`; // Set height based on scroll height
        },
        async submitReply(parentComment = { id: 0 }) {
            const token = sessionStorage.getItem('loginJwt');
            if(!token){//prevent sending request to backend if jwt doesnt exist.
                this.login();
                this.errorMessage = "You need to log in first.";
                this.errorCode = 401;
                return;
            }
            const replyInput = document.getElementById(`reply-content-${parentComment.id}`);
            const replyContent = replyInput.value;
            const data = {
                parent_id: parentComment.id,
                project_id: this.project_id,
                content: replyContent,
            };
            const config = {
                headers: {
                    Authorization: token,
                }
            };
            try {
                const reply = await axios.post(`${backendLayersAppAddress}/project/comment`, data, config);
                replyInput.value = '';
                replyInput.style.height = 'auto';
                if(parentComment.hasOwnProperty('replies')){//this is for root comments
                    parentComment.replies +=1;
                    parentComment.showReplies = false;
                }else{//this is for reply of a comment.
                    data["id"] = reply.data.id;
                    data["username"] = this.username;
                    data["changed_at"] = Date.now();
                    data["showReplies"] = false;
                    data["replyFieldText"] = "Reply"
                    data["likes"] = 0;
                    data["replies"] = 0;
                    this.parsedComments.push(data)
                }
            } catch (error) {
                if (error.status === 401) {
                    this.login();
                    this.errorMessage = "You need to log in first.";
                    this.errorCode = error.status;
                }
                else {
                    if ("string_too_short" === error.response.data.detail[0].type) {
                        this.errorMessage = "Comments should at least have 4 characters";
                    } else {
                        this.errorMessage = error.response.data.detail[0].msg
                    }
                    this.errorCode = error.status;
                }
            }
            if (parentComment.id != 0) {
                this.toggleReplyField(parentComment);
            }
        },

        cancelReply(commentId) {
            const replyInput = document.getElementById(`reply-content-${commentId}`);
            replyInput.value = '';
            replyInput.style.height = 'auto';
            this.toggleReplyField(commentId);
        },
        prepare_config(commentId) {
            const token = sessionStorage.getItem('loginJwt');
            return {
                params: {
                    comment_id: commentId
                }, headers: {
                    Authorization: token
                }
            };
        },
        async likeComment(comment) {
            const config = this.prepare_config(comment.id)
            try {
                const likeCommentsResponse = await axios.get(`${backendLayersAppAddress}/project/${this.project_id}/comment/like`, config);
                const msg = likeCommentsResponse.data.msg
                if (msg == "Liked") {
                    comment.likes += 1;
                    comment.l_d = "Like";
                } else if (msg == "Liked2") {
                    comment.likes += 2;
                    comment.l_d = "Like";
                } else if (msg == "Unliked") {
                    comment.likes -= 1;
                    comment.l_d = null;
                }
            } catch (error) {
                if (error.status === 401) {
                    this.login();
                    this.errorMessage = "You need to log in first."
                    this.errorCode = error.status;
                }
            }

        },
        async dislikeComment(comment) {
            const config = this.prepare_config(comment.id)
            try {
                const dislikeCommentsResponse = await axios.get(`${backendLayersAppAddress}/project/${this.project_id}/comment/dislike`, config);
                const msg = dislikeCommentsResponse.data.msg
                if (msg == "Disliked") {
                    comment.likes -= 1;
                    comment.l_d = "Dislike";
                } else if (msg == "Disliked2") {
                    comment.likes -= 2;
                    comment.l_d = "Dislike";
                } else if (msg == "Undisliked") {
                    comment.likes += 1;
                    comment.l_d = null;
                }
            } catch (error) {
                if (error.status === 401) {
                    this.login();
                    this.errorMessage = "You need to log in first."
                    this.errorCode = error.status;
                }
            }
        },
        async confirmDeletePrompt(comment) {
            this.commentToDelete = comment;
            this.showDeleteConfirm = true;
            nextTick(() => {
                this.$refs.modalContent.focus(); // Focus on the modal content
            });
        },
        cancelDelete() {
            setTimeout(() => {
                this.commentToDelete = null;
                this.showDeleteConfirm = false;
            }, 100);
        },
        async deleteComment() {
            const comment = this.commentToDelete;
            const config = this.prepare_config(comment.id);
            try {
                const deleteCommentsResponse = await axios.delete(`${backendLayersAppAddress}/project/comment`, config);
                const index = this.parsedComments.findIndex(el => el.id === comment.id);
                if (index !== -1) {
                    this.parsedComments.splice(index, 1);
                }
            } catch (error) {
                if (error.status === 401) {
                    this.login();
                    this.errorMessage = "You need to log in first.";
                    this.errorCode = error.status;
                }
                else {
                    this.errorMessage = error.detail;
                }
            }
        },
        showRepliesText(comment) {
            if (comment.showReplies) {
                return 'Hide';
            }
            if (comment.replies === 1) {
                return '1 Reply';
            }
            return `${comment.replies} Replies`;
        },
        async login() {
            dropdownLoginVisible.value = !dropdownLoginVisible.value;
        }
    },
};
</script>



<style scoped>
.comment-text {
    color: rgb(180, 180, 180);
    font-size: 20px;
}

.reply-text {
    color: rgb(180, 180, 180);
    font-size: 18px;
}

.like-button,
.dislike-button {
    font-size: 18px;
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

.button-container {
    display: flex;
    justify-content: flex-end;
}

.dark-button {
    font-size: 17px;
    background-color: #0c4511;
    color: #bdbdbd;
    border: 1px solid #555;
}

.error {
    color: red;
}

.username {
    color: #949494;
}

.timestamp {
    color: #636363;
}

.divider-text {
    color: #555555
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: rgb(27, 27, 27);
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
    text-align: center;
}
</style>