export interface Env {
	EKTUBESHI_CDN_KV: KVNamespace;
}

export interface SyncPayload {
	key: string;
	content: string;
	metadata?: PostMetadata;
}

export interface PostMetadata {
	title: string;
	date: string;
	author: string;
	status: 'draft' | 'published';
	category: string;
	excerpt?: string;
	tags?: string[];
	language?: string;
}

export interface Post {
	slug: string;
	metadata: PostMetadata;
	content: string;
}

export interface CategoryInfo {
	name: string;
	postCount: number;
	posts: string[];
}

export interface APIResponse<T = any> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}
