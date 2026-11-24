<template>
  <div id="app">
    <div class="container">
      <!-- Sticky Header -->
      <header class="header">
        <h1 class="logo">WASPI REWARDS</h1>
        <div v-if="user" class="profile">
          <span class="name">{{ user.name }}</span>
          <span class="points">⭐ {{ user.points }} pts</span>
          <span v-if="user.badge" class="badge">{{ user.badge }}</span>
          <span v-if="user.next_badge" class="next">Next: {{ user.next_badge }}</span>
        </div>
      </header>

      <!-- Leaderboard -->
      <div v-if="leaderboard.length" class="leaderboard">
        <h2>🏆 Top Users</h2>
        <div v-for="(user, index) in leaderboard" :key="user.id" class="rank-item">
          <span class="rank-number">{{ index + 1 }}</span>
          <span class="rank-name">{{ user.name }}</span>
          <span class="rank-badge">{{ user.badge || '—' }}</span>
          <span class="rank-points">{{ user.points }} pts</span>
        </div>
      </div>

      <button class="add-btn" @click="showModal">+ Add Comment</button>

      <!-- Comments Feed -->
      <div class="feed">
        <div v-for="comment in comments" :key="comment.id" class="post">
          <div class="post-header">
            <strong>{{ comment.user.name }}</strong>
            <span class="date">{{ formatDate(comment.created_at) }}</span>
          </div>
          <p class="post-text">{{ comment.text }}</p>
          <div class="post-actions">
            <button
              class="like-btn"
              :class="{ 'is-liked': comment.liked_by_user }"
              @click="toggleLike(comment)"
            >
              {{ comment.liked_by_user ? 'Unlike' : 'Like' }} · {{ comment.likes_count || 0 }}
            </button>
            <button v-if="comment.user_id === user?.id" class="del-btn" @click="deleteComment(comment.id)">
              🗑️
            </button>
          </div>
        </div>
        <p v-if="!comments.length" class="empty">No comments yet. Be the first!</p>
      </div>

      <!-- Modal -->
      <div v-if="isModalOpen" class="modal-overlay" @click.self="hideModal">
        <div class="modal">
          <h2>Add Comment</h2>
          <textarea v-model="newComment" placeholder="What's on your mind?" rows="4"></textarea>
          <div class="modal-actions">
            <button class="cancel" @click="hideModal">Cancel</button>
            <button class="submit" @click="submitComment">Post</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      user: null,
      comments: [],
      leaderboard: [],
      newComment: '',
      token: null,
      isModalOpen: false,
      isLoading: false,
    };
  },
  mounted() {
    this.token = localStorage.getItem('token');
    if (!this.token) {
      this.getToken();
    } else {
      this.fetchData();
    }
  },
  methods: {
    async getToken() {
      try {
        const res = await axios.post('/api/demo-token');
        this.token = res.data.token;
        localStorage.setItem('token', this.token);
        this.fetchData();
      } catch (e) {
        console.error('Token fetch failed:', e);
      }
    },
    async fetchData() {
      if (this.isLoading) return;
      this.isLoading = true;

      try {
        if (!this.token) {
          await this.getToken();
          return;
        }

        const config = { headers: { Authorization: `Bearer ${this.token}` } };

        const users = await axios.get('/api/users', config);
        if (users.data.data.length) {
          this.user = users.data.data.find((item) => item.id === users.data.meta?.authenticated_user_id) || null;
          // Sort by points descending for leaderboard
          this.leaderboard = [...users.data.data]
            .sort((a, b) => b.points - a.points)
            .slice(0, 5);
        }

        const comments = await axios.get('/api/comments', config);
        this.comments = comments.data.data || [];
      } catch (e) {
        console.error('Data fetch failed:', e);
        if (e.response?.status === 401) {
          localStorage.removeItem('token');
          this.token = null;
          this.getToken();
        }
      } finally {
        this.isLoading = false;
      }
    },
    showModal() {
      this.isModalOpen = true;
    },
    hideModal() {
      this.isModalOpen = false;
    },
    async submitComment() {
      if (!this.newComment.trim()) return;

      try {
        await axios.post(
          '/api/comments',
          { text: this.newComment },
          { headers: { Authorization: `Bearer ${this.token}` } }
        );
        this.newComment = '';
        this.hideModal();
        this.fetchData();
      } catch (e) {
        console.error('Comment post failed:', e);
      }
    },
    async toggleLike(comment) {
      try {
        const config = { headers: { Authorization: `Bearer ${this.token}` } };

        if (comment.liked_by_user) {
          await axios.delete(`/api/comments/${comment.id}/like`, config);
        } else {
          await axios.post(`/api/comments/${comment.id}/like`, {}, config);
        }

        this.fetchData();
      } catch (e) {
        console.error('Like action failed:', e);
      }
    },
    async deleteComment(id) {
      if (!confirm('Delete this comment?')) return;

      try {
        await axios.delete(`/api/comments/${id}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        this.fetchData();
      } catch (e) {
        console.error('Delete failed:', e);
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    },
  },
};
</script>

<style lang="scss" src="../scss/app.scss"></style>