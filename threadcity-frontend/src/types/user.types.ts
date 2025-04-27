export interface User {
    id: string;
    username: string;
    email: string;
    profilePicture?: string;
    bio?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Follow {
    followerId: string;
    followingId: string;
    createdAt: Date;
}