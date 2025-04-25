//constants for socket events

export const EVENTS = {
    // Connection
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    
    // Authentication
    AUTH: 'auth',
    AUTH_ERROR: 'auth_error',
    AUTH_SUCCESS: 'auth_success',
    
    // Post
    POST_CREATED: 'post_created',
    POST_UPDATED: 'post_updated',
    POST_DELETED: 'post_deleted',
    POST_LIKED: 'post_liked',
    POST_UNLIKED: 'post_unliked',
    POST_SAVED: 'post_saved',
    
    // Comment
    COMMENT_CREATED: 'comment_created',
    COMMENT_UPDATED: 'comment_updated',
    COMMENT_DELETED: 'comment_deleted',
    JOIN_POST: 'join_post',
    LEAVE_POST: 'leave_post',
    
    // Notification
    NEW_NOTIFICATION: 'new_notification',
    READ_NOTIFICATION: 'read_notification',
    GET_NOTIFICATIONS: 'get_notifications',
    
    // User activity
    USER_ONLINE: 'user_online',
    USER_OFFLINE: 'user_offline',
    USER_TYPING: 'user_typing',
    USER_STOPPED_TYPING: 'user_stopped_typing',

    // Follow 
    FOLLOW_USER: 'follow_user',
    UNFOLLOW_USER: 'unfollow_user',
    GET_ONLINE_FOLLOWING: 'get_online_following',
    ONLINE_FOLLOWING: 'online_following'
  };