<template>
    <p v-if="isLoading">Loading...</p>
    <div v-if="!isLoading">
        <div v-if="errorMessage">
            <h2 class="error">{{ errorMessage }} <a v-if="errorCode === 401" href="#" @click.prevent="login">Log in</a>
            </h2>

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
            <div v-for="comment in parsedComments" :key="comment.id" :id="`comment-${comment.id}`" class="comment">
                <br>
                <div><strong
                        :class="{ 'comment-text': comment.parent_id === 0, 'reply-text': comment.parent_id !== 0 }">
                        {{ comment.content }}
                    </strong><br>
                    <i class="divider-text"> by </i><i class="username">{{ comment.username }}</i>
                    <i class="divider-text"> at </i><i class="timestamp">{{ new
                        Date(comment.changed_at).toLocaleString(undefined, {
                            year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }}</i>

                    <a href="#" class="like-link" :class="['like-button', { active: comment.l_d === 'Like' }]"
                        @click.prevent="likeComment(comment)"><span class="material-icons">thumb_up</span></a>
                    <span class="like-count"> {{ comment.likes }} </span>
                    <a href="#" class="dislike-link" :class="['dislike-button', { active: comment.l_d === 'Dislike' }]"
                        @click.prevent="dislikeComment(comment)"><span class="material-icons">thumb_down</span></a>
                    <a href="#" class="reply-link"
                        @click.prevent="toggleReplyField(comment)">{{ comment.replyFieldText }}</a>

                    <template v-if="isUserComment(comment.username)">
                        <a href="#" class="delete-link" @click.prevent="deleteComment(comment.id)">Delete</a>
                    </template>
                </div>
                <div>


                    <div :id="`reply-input-${comment.id}`" class="reply-input"
                        v-show="comment.replyFieldText === 'Hide'">
                        <textarea :id="`reply-content-${comment.id}`" placeholder="Type your comment here..."
                            @input="adjustTextareaHeight($event)" rows="1" class="dark-textarea"></textarea>
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
                        <div :style="{ marginLeft: margin_left + '%' }">
                            <CommentView v-if="comment.showReplies" :project_id="project_id" :parent_id="comment.id" />
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>




<script>
import { backendLayersAppAddress } from '@/config';
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
            isLoading: true
        };
    },
    watch: {
        project_id(newVal) {
            this.parsedComments=[];
            this.fetch_replies(this.parent_id, 0);
        },
    },
    mounted() {
        this.fetch_replies(this.parent_id, 0);
        this.isLoading = false;
    },
    methods: {
        async fetch_replies(parent_id, page) {
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
        },
        adjustTextareaHeight(event) {
            const textarea = event.target;
            textarea.style.height = 'auto'; // Reset height to calculate the new size
            textarea.style.height = `${textarea.scrollHeight}px`; // Set height based on scroll height
        },
        async submitReply(parentComment = { id: 0 }) {
            const token = sessionStorage.getItem('loginJwt');
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
                await axios.post(`${backendLayersAppAddress}/project/comment`, data, config);
                replyInput.value = '';
                replyInput.style.height = 'auto';
                this.fetch_replies(this.parent_id, 0);
            } catch (error) {
                if (error.status === 401) {
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
                const fetchCommentsResponse = await axios.get(`${backendLayersAppAddress}/project/${this.project_id}/comment/like`, config);
                const msg = fetchCommentsResponse.data.msg
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
                    this.errorMessage = "You need to log in first."
                    this.errorCode = error.status;
                }
            }

        },
        async dislikeComment(comment) {
            const config = this.prepare_config(comment.id)
            try {
                const fetchCommentsResponse = await axios.get(`${backendLayersAppAddress}/project/${this.project_id}/comment/dislike`, config);
                const msg = fetchCommentsResponse.data.msg
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
                    this.errorMessage = "You need to log in first."
                    this.errorCode = error.status;
                }
            }
        },
        async deleteComment(commentId) {
            const url = '/comment/dislike';
            const params = `commentid=${commentId}`;
            await fetch(`${url}?${params}`);
        },
        isUserComment(username) {
            return username === '{{user}}';
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
            this.$router.push({ name: 'Login' })
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
</style>