import { Env, SyncPayload, PostMetadata, Post, CategoryInfo, APIResponse } from './types';

/**
 * Extract metadata from markdown frontmatter
 */
function extractMetadata(content: string): PostMetadata | null {
	const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
	if (!frontmatterMatch) return null;

	const frontmatter = frontmatterMatch[1];
	const metadata: Partial<PostMetadata> = {};

	// Parse frontmatter
	const lines = frontmatter.split('\n');
	for (const line of lines) {
		const [key, ...valueParts] = line.split(':');
		if (key && valueParts.length > 0) {
			const value = valueParts.join(':').trim();
			switch (key.trim().toLowerCase()) {
				case 'title':
					metadata.title = value;
					break;
				case 'date':
					metadata.date = value;
					break;
				case 'author':
					metadata.author = value;
					break;
				case 'status':
					metadata.status = value.toLowerCase() as 'draft' | 'published';
					break;
				case 'category':
					metadata.category = value;
					break;
				case 'excerpt':
					metadata.excerpt = value;
					break;
				case 'tags':
					metadata.tags = value.split(',').map((tag) => tag.trim());
					break;
				case 'language':
					metadata.language = value;
					break;
			}
		}
	}

	// Validate required fields
	if (!metadata.title || !metadata.date || !metadata.author || !metadata.category) {
		return null;
	}

	return metadata as PostMetadata;
}

/**
 * Store markdown content with metadata in KV
 */
export async function storeMarkdown(env: Env, payload: SyncPayload, status: 'draft' | 'published' = 'draft'): Promise<void> {
	const storageKey = `${status}:${payload.key}`;

	// Extract metadata if not provided
	let metadata = payload.metadata;
	if (!metadata) {
		const extractedMetadata = extractMetadata(payload.content);
		if (!extractedMetadata) {
			throw new Error('Invalid markdown: missing required frontmatter');
		}
		metadata = extractedMetadata;
	}

	// Store content
	await env.EKTUBESHI_CDN_KV.put(storageKey, payload.content);

	// Store metadata separately for faster access
	const metadataKey = `metadata:${status}:${payload.key}`;
	await env.EKTUBESHI_CDN_KV.put(metadataKey, JSON.stringify(metadata));

	// Handle language/category/slug structure
	const pathParts = payload.key.split('/');
	if (pathParts.length < 3 || status !== 'published') return;

	const language = pathParts[0];
	const category = pathParts[1];
	const slug = pathParts[2];
	const fullCategoryKey = `${language}/${category}`;

	// Update category index
	await updateCategoryIndex(env, fullCategoryKey, slug);

	// Update categories list
	await updateCategoriesList(env, fullCategoryKey);
}

/**
 * Update category index with new post
 */
async function updateCategoryIndex(env: Env, category: string, slug: string): Promise<void> {
	const catIndexKey = `index:${category}`;
	const catIndexRaw = await env.EKTUBESHI_CDN_KV.get(catIndexKey);
	let catIndex = catIndexRaw ? JSON.parse(catIndexRaw) : [];

	if (!catIndex.includes(slug)) {
		catIndex.push(slug);
		await env.EKTUBESHI_CDN_KV.put(catIndexKey, JSON.stringify(catIndex));
	}
}

/**
 * Update categories list
 */
async function updateCategoriesList(env: Env, category: string): Promise<void> {
	const categoriesKey = `index:categories`;
	const categoriesRaw = await env.EKTUBESHI_CDN_KV.get(categoriesKey);
	let categories = categoriesRaw ? JSON.parse(categoriesRaw) : [];

	if (!categories.includes(category)) {
		categories.push(category);
		await env.EKTUBESHI_CDN_KV.put(categoriesKey, JSON.stringify(categories));
	}
}

/**
 * Get markdown content by key and status
 */
export async function getMarkdown(env: Env, key: string, status: 'draft' | 'published' = 'published'): Promise<string | null> {
	return await env.EKTUBESHI_CDN_KV.get(`${status}:${key}`);
}

/**
 * Get post metadata by key and status
 */
export async function getPostMetadata(env: Env, key: string, status: 'draft' | 'published' = 'published'): Promise<PostMetadata | null> {
	const metadataKey = `metadata:${status}:${key}`;
	const raw = await env.EKTUBESHI_CDN_KV.get(metadataKey);
	return raw ? JSON.parse(raw) : null;
}

/**
 * Get complete post with metadata and content
 */
export async function getPost(env: Env, key: string, status: 'draft' | 'published' = 'published'): Promise<Post | null> {
	const pathParts = key.split('/');
	if (pathParts.length < 3) {
		return null;
	}

	// For language/category/slug format, extract the slug (last part)
	const slug = pathParts[pathParts.length - 1];
	const category = pathParts[pathParts.length - 2];

	const content = await getMarkdown(env, key, status);
	const metadata = await getPostMetadata(env, key, status);

	if (!content || !metadata) {
		return null;
	}

	return {
		slug,
		metadata,
		content,
	};
}

/**
 * Get all slugs in a category
 */
export async function getCategorySlugs(env: Env, category: string): Promise<string[]> {
	const raw = await env.EKTUBESHI_CDN_KV.get(`index:${category}`);
	return raw ? JSON.parse(raw) : [];
}

/**
 * Get all categories
 */
export async function getCategories(env: Env): Promise<string[]> {
	const raw = await env.EKTUBESHI_CDN_KV.get('index:categories');
	return raw ? JSON.parse(raw) : [];
}

/**
 * Get detailed category information
 */
export async function getCategoryInfo(env: Env, category: string): Promise<CategoryInfo | null> {
	const slugs = await getCategorySlugs(env, category);
	if (slugs.length === 0) return null;

	return {
		name: category,
		postCount: slugs.length,
		posts: slugs,
	};
}

/**
 * Search posts by query
 */
export async function searchPosts(
	env: Env,
	query: string,
	status: 'draft' | 'published' = 'published',
	language: string = 'en'
): Promise<Post[]> {
	const categories = await getCategories(env);
	const results: Post[] = [];

	for (const category of categories) {
		// Only search in categories for the specified language
		if (category.startsWith(`${language}/`)) {
			const slugs = await getCategorySlugs(env, category);
			for (const slug of slugs) {
				const key = `${category}/${slug}`;
				const post = await getPost(env, key, status);
				if (
					post &&
					(post.metadata.title.toLowerCase().includes(query.toLowerCase()) ||
						post.content.toLowerCase().includes(query.toLowerCase()) ||
						post.metadata.tags?.some((tag) => tag.toLowerCase().includes(query.toLowerCase())))
				) {
					results.push(post);
				}
			}
		}
	}

	return results;
}

/**
 * Get recent posts
 */
export async function getRecentPosts(
	env: Env,
	limit: number = 10,
	status: 'draft' | 'published' = 'published',
	language: string = 'en'
): Promise<Post[]> {
	const categories = await getCategories(env);

	const allPosts: Post[] = [];

	for (const category of categories) {
		// Only get posts from categories for the specified language
		if (category.startsWith(`${language}/`)) {
			const slugs = await getCategorySlugs(env, category);

			for (const slug of slugs) {
				const key = `${category}/${slug}`;

				const post = await getPost(env, key, status);
				if (post) {
					allPosts.push(post);
				}
			}
		}
	}

	// Sort by date and limit
	return allPosts.sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime()).slice(0, limit);
}
