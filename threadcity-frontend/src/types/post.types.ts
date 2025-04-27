export interface Post {
    id: string;
    title: string;
    content: string;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
    likes: number;
    comments: number;
}

export interface CreatePostInput {
    title: string;
    content: string;
}

export interface UpdatePostInput {
    title?: string;
    content?: string;
}