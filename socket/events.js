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
    ONLINE_FOLLOWING: 'online_following',

    // Image-related events
    UPLOAD_AVATAR: 'upload_avatar',
    AVATAR_UPLOADED: 'avatar_uploaded',
    UPLOAD_POST_IMAGE: 'upload_post_image',
    POST_IMAGE_UPLOADED: 'post_image_uploaded',

    //Forgot password
    REQUEST_PASSWORD_RESET: 'request_password_reset',
    PASSWORD_RESET_REQUEST: 'password_reset_request',
    VERIFY_RESET_TOKEN: 'verify_reset_token',
    TOKEN_VERIFICATION: 'token_verification',
    RESET_PASSWORD: 'reset_password',
    PASSWORD_RESET: 'password_reset',
    // Error
    ERROR: 'error',
};