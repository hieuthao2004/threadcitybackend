export const EVENTS = {
  // Socket connection events
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  
  // Authentication events
  AUTH: 'auth',
  LOGIN: 'login',
  REGISTER: 'register',
  
  // Post related events
  POST_CREATED: 'post_created',
  POST_UPDATED: 'post_updated',
  POST_DELETED: 'post_deleted',
  
  // Comment related events
  COMMENT_CREATED: 'comment_created',
  COMMENT_UPDATED: 'comment_updated',
  COMMENT_DELETED: 'comment_deleted',
  
  // Like related events
  LIKE_POST: 'like_post',
  UNLIKE_POST: 'unlike_post',
  
  // Image upload events
  UPLOAD_AVATAR: 'upload_avatar',
  UPLOAD_POST_IMAGE: 'upload_post_image',
  
  // Follow events
  FOLLOW_USER: 'follow_user',
  UNFOLLOW_USER: 'unfollow_user',
  
  // Notification events
  NOTIFICATION_RECEIVED: 'notification_received'
};

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    PROFILE: '/api/auth/me',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    VERIFY_RESET_TOKEN: '/api/auth/verify-reset-token'
  },
  POSTS: {
    BASE: '/api/posts',
    COMMENTS: (postId: string) => `/api/posts/${postId}/comments`
  },
  USERS: {
    BASE: '/api/users',
    PROFILE: (username: string) => `/api/users/${username}`,
    POSTS: (username: string) => `/api/users/${username}/posts`,
    FOLLOWERS: (username: string) => `/api/users/${username}/followers`,
    FOLLOWING: (username: string) => `/api/users/${username}/following`
  },
  NOTIFICATIONS: {
    BASE: '/api/notifications',
    MARK_READ: (notificationId: string) => `/api/notifications/${notificationId}/read`,
    MARK_ALL_READ: '/api/notifications/read-all'
  }
};