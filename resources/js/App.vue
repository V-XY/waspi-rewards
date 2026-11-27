<template>
  <div class="waspi-root">
    <div class="container">
      <header class="header">
        <h1 class="logo">WASPI REWARDS</h1>
        <div v-if="user" class="profile">
          <span class="name">{{ user.name }}</span>
          <span class="points">{{ user.points }} points</span>
          <span v-if="user.badge" class="badge">{{ formatBadge(user.badge) }}</span>
          <span v-if="user.next_badge" class="next">Next badge: {{ formatBadge(user.next_badge) }}</span>
        </div>
      </header>

      <p v-if="errorMessage" class="notice error" role="alert">{{ errorMessage }}</p>
      <p v-else-if="isLoading && !comments.length" class="notice" aria-live="polite">Loading comments.</p>

      <section v-if="leaderboard.length" class="leaderboard">
        <h2>Top users</h2>
        <div v-for="(entry, index) in leaderboard" :key="entry.id" class="rank-item">
          <span class="rank-number">{{ index + 1 }}</span>
          <span class="rank-name">{{ entry.name }}</span>
          <span class="rank-badge">{{ formatBadge(entry.badge) }}</span>
          <span class="rank-points">{{ entry.points }} points</span>
        </div>
      </section>

      <button type="button" class="add-btn" @click="showModal">Add comment</button>

      <section class="feed" aria-label="Comments">
        <div v-for="comment in comments" :key="comment.id" class="post">
          <div class="post-header">
            <strong>{{ authorName(comment) }}</strong>
            <time class="date" :datetime="comment.created_at" :title="comment.created_at">{{ formatDate(comment.created_at) }}</time>
            <span v-if="comment.timestamp_source === 'seeded'" class="sample-label">Sample</span>
          </div>
          <p class="post-text">{{ comment.text }}</p>
          <div class="post-actions">
            <button
              type="button"
              class="like-btn"
              :class="{ 'is-liked': comment.viewer_vote === 'like' }"
              :disabled="busy"
              @click="toggleVote(comment, 'like')"
            >
              {{ comment.viewer_vote === 'like' ? 'Unlike' : 'Like' }}
              <span class="count">{{ comment.likes_count || 0 }}</span>
            </button>
            <button
              type="button"
              class="dislike-btn"
              :class="{ 'is-disliked': comment.viewer_vote === 'dislike' }"
              :disabled="busy"
              @click="toggleVote(comment, 'dislike')"
            >
              {{ comment.viewer_vote === 'dislike' ? 'Remove dislike' : 'Dislike' }}
            </button>
            <button
              v-if="isOwner(comment)"
              type="button"
              class="del-btn"
              :disabled="busy"
              @click="deleteComment(comment.id)"
            >
              Delete
            </button>
          </div>
        </div>

        <p v-if="!isLoading && !errorMessage && !comments.length" class="empty">No comments yet.</p>

        <div v-if="hasMore" class="more">
          <button type="button" class="more-btn" :disabled="isLoadingMore" @click="loadMore">
            {{ isLoadingMore ? 'Loading more comments.' : 'Load more comments' }}
          </button>
        </div>
      </section>

      <div v-if="isModalOpen" class="modal-overlay" @click.self="hideModal">
        <div
          class="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="comment-dialog-title"
          @keydown.esc="hideModal"
        >
          <h2 id="comment-dialog-title">Add comment</h2>
          <textarea
            v-model="newComment"
            placeholder="Write a comment"
            rows="4"
            maxlength="1000"
            aria-label="Comment text"
          ></textarea>
          <p v-if="postError" class="notice error" role="alert">{{ postError }}</p>
          <div class="modal-actions">
            <button type="button" class="cancel" @click="hideModal">Cancel</button>
            <button
              type="button"
              class="submit"
              :disabled="busy || !newComment.trim()"
              @click="submitComment"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const TOKEN_KEY = 'waspi.token';
const PAGE_SIZE = 20;
const LEADERBOARD_SIZE = 5;

// Every API call goes through this client. The timeout keeps a stalled
// request from leaving the page in a loading state forever.
const http = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { Accept: 'application/json' },
});

// Parallel callers share one token request instead of each asking for a token.
let tokenRequest = null;

function readStoredToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    // Some embedded or private contexts block storage. The token then lives in memory only.
    return null;
  }
}

function storeToken(token) {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Storage is optional here. The page keeps working until it is reloaded.
  }
}

function clearStoredToken() {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Nothing to clear when storage is unavailable.
  }
}

export default {
  data() {
    return {
      token: null,
      user: null,
      leaderboard: [],
      comments: [],
      nextCursor: null,
      newComment: '',
      isModalOpen: false,
      isLoading: false,
      isLoadingMore: false,
      busy: false,
      errorMessage: '',
      postError: '',
    };
  },

  computed: {
    hasMore() {
      return Boolean(this.nextCursor);
    },
  },

  async mounted() {
    this.token = readStoredToken();
    await this.loadFeed();
  },

  methods: {
    ensureToken() {
      if (this.token) {
        return Promise.resolve(this.token);
      }

      if (!tokenRequest) {
        tokenRequest = http
          .post('/demo-token')
          .then(({ data }) => {
            this.token = data.token;
            storeToken(data.token);
            return data.token;
          })
          .catch((error) => {
            if (error.response?.status === 404) {
              error.demoAccessError = 'disabled';
            } else if (error.response?.status === 503) {
              error.demoAccessError = 'account-missing';
            }

            throw error;
          })
          .finally(() => {
            tokenRequest = null;
          });
      }

      return tokenRequest;
    },

    // Sends an authenticated request. If the stored token has expired, one fresh
    // token is requested and the request is retried once.
    async request(method, url, options = {}) {
      await this.ensureToken();

      const send = () => http.request({ method, url, ...options, headers: this.authHeader() });

      try {
        return await send();
      } catch (error) {
        if (error.response?.status !== 401) {
          throw error;
        }

        this.token = null;
        clearStoredToken();
        await this.ensureToken();

        return send();
      }
    },

    authHeader() {
      return { Authorization: `Bearer ${this.token}` };
    },

    async loadFeed() {
      if (this.isLoading) return;

      this.isLoading = true;
      this.errorMessage = '';

      try {
        const [users, page] = await Promise.all([
          this.request('get', '/users'),
          this.request('get', '/comments', { params: { per_page: PAGE_SIZE } }),
        ]);

        this.applyUsers(users.data);
        this.comments = page.data.data;
        this.nextCursor = page.data.next_cursor;
      } catch (error) {
        this.errorMessage = this.describeError(error);
        console.error('Feed could not be loaded:', error);
      } finally {
        this.isLoading = false;
      }
    },

    async loadMore() {
      if (!this.hasMore || this.isLoadingMore) return;

      this.isLoadingMore = true;

      try {
        const page = await this.request('get', '/comments', {
          params: { per_page: PAGE_SIZE, cursor: this.nextCursor },
        });

        const known = new Set(this.comments.map((comment) => comment.id));
        const fresh = page.data.data.filter((comment) => !known.has(comment.id));

        this.comments = [...this.comments, ...fresh];
        this.nextCursor = page.data.next_cursor;
      } catch (error) {
        this.errorMessage = this.describeError(error);
      } finally {
        this.isLoadingMore = false;
      }
    },

    async refreshUsers() {
      try {
        const users = await this.request('get', '/users');
        this.applyUsers(users.data);
      } catch (error) {
        console.error('Leaderboard could not be refreshed:', error);
      }
    },

    applyUsers(payload) {
      const records = payload.data || [];
      const currentUserId = payload.meta?.authenticated_user_id;

      this.user = records.find((item) => item.id === currentUserId) || null;
      this.leaderboard = [...records]
        .sort((a, b) => b.points - a.points)
        .slice(0, LEADERBOARD_SIZE);
    },

    describeError(error) {
      const status = error.response?.status;

      if (!error.response) {
        return 'The server could not be reached. Check your connection and reload the page.';
      }
      if (status === 429) {
        return 'Too many requests. Wait a minute and try again.';
      }
      if (error.demoAccessError === 'disabled') {
        return 'Demo access is disabled for this deployment. Please contact the site owner.';
      }
      if (error.demoAccessError === 'account-missing') {
        return 'The demo account is not configured. Please contact the site owner.';
      }
      if (status === 404) {
        return 'The requested item could not be found. Reload the page and try again.';
      }
      if (status === 503) {
        return 'The service is temporarily unavailable. Please try again shortly.';
      }
      return 'Something went wrong. Reload the page to try again.';
    },

    showModal() {
      this.postError = '';
      this.isModalOpen = true;
    },

    hideModal() {
      this.isModalOpen = false;
    },

    async submitComment() {
      const text = this.newComment.trim();
      if (!text || this.busy) return;

      this.busy = true;
      this.postError = '';

      try {
        const { data } = await this.request('post', '/comments', { data: { text } });

        this.comments = [data.comment, ...this.comments];
        this.newComment = '';
        this.isModalOpen = false;
        await this.refreshUsers();
      } catch (error) {
        this.postError = error.response?.status === 422
          ? 'A comment must be between 1 and 1000 characters.'
          : this.describeError(error);
      } finally {
        this.busy = false;
      }
    },

    async toggleVote(comment, type) {
      if (this.busy) return;

      this.busy = true;
      const currentVote = comment.viewer_vote || (comment.liked_by_user ? 'like' : null);
      const nextVote = currentVote === type ? null : type;

      try {
        const response = nextVote
          ? await this.request('post', `/comments/${comment.id}/vote`, { data: { type: nextVote } })
          : await this.request('delete', `/comments/${comment.id}/vote`);

        comment.viewer_vote = response.data.viewer_vote;
        comment.liked_by_user = response.data.viewer_vote === 'like';
        comment.likes_count = response.data.likes_count;

        if (currentVote === 'like' || nextVote === 'like') {
          await this.refreshUsers();
        }
      } catch (error) {
        this.errorMessage = this.describeError(error);
      } finally {
        this.busy = false;
      }
    },

    async deleteComment(id) {
      if (this.busy || !window.confirm('Delete this comment?')) return;

      this.busy = true;

      try {
        await this.request('delete', `/comments/${id}`);
        this.comments = this.comments.filter((comment) => comment.id !== id);
        await this.refreshUsers();
      } catch (error) {
        this.errorMessage = this.describeError(error);
      } finally {
        this.busy = false;
      }
    },

    isOwner(comment) {
      return Boolean(this.user) && comment.user_id === this.user.id;
    },

    authorName(comment) {
      return comment.user?.name || 'Unknown user';
    },

    formatBadge(badge) {
      if (!badge) return 'No badge';

      return badge
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    },

    formatDate(value) {
      const date = new Date(value);

      if (Number.isNaN(date.getTime())) return '';

      return date.toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      });
    },
  },
};
</script>

<style lang="scss" src="../scss/app.scss"></style>