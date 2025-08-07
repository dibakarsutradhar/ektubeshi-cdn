import {
	getCategories,
	getCategorySlugs,
	getMarkdown,
	storeMarkdown,
	getPost,
	getPostMetadata,
	getCategoryInfo,
	searchPosts,
	getRecentPosts,
} from './kv';
import { Env, SyncPayload, APIResponse } from './types';

/**
 * Create a standardized API response
 */
function createResponse<T>(data: T, status: number = 200): Response {
	const response: APIResponse<T> = {
		success: status < 400,
		data,
	};

	return new Response(JSON.stringify(response), {
		status,
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'public, max-age=3600',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		},
	});
}

/**
 * Create an error response
 */
function createErrorResponse(message: string, status: number = 400): Response {
	const response: APIResponse = {
		success: false,
		error: message,
	};

	return new Response(JSON.stringify(response), {
		status,
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		},
	});
}

/**
 * Handle CORS preflight requests
 */
function handleCORS(request: Request): Response | null {
	if (request.method === 'OPTIONS') {
		return new Response(null, {
			status: 200,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type',
			},
		});
	}
	return null;
}

/**
 * Main request handler
 */
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// Handle CORS
		const corsResponse = handleCORS(request);
		if (corsResponse) return corsResponse;

		const url = new URL(request.url);
		const pathname = url.pathname;

		try {
			// Health check endpoint
			if (pathname === '/health') {
				return createResponse({ status: 'healthy', timestamp: new Date().toISOString() });
			}

			// Content sync endpoint
			if (pathname === '/sync' && request.method === 'POST') {
				return await handleSync(request, env);
			}

			// API endpoints
			if (pathname.startsWith('/api/')) {
				return await handleAPIEndpoints(pathname, url, env);
			}

			// Legacy endpoints (for backward compatibility)
			return await handleLegacyEndpoints(pathname, url, env);
		} catch (error) {
			console.error('Error handling request:', error);
			return createErrorResponse('Internal server error', 500);
		}
	},
} satisfies ExportedHandler<Env>;

/**
 * Handle content sync requests
 */
async function handleSync(request: Request, env: Env): Promise<Response> {
	try {
		const body: SyncPayload & { status?: 'draft' | 'published' } = await request.json();

		if (!body.key || !body.content) {
			return createErrorResponse('Missing key or content', 400);
		}

		const status = body.status === 'published' ? 'published' : 'draft';
		await storeMarkdown(env, body, status);

		return createResponse({ message: 'Content synced successfully' });
	} catch (error) {
		return createErrorResponse('Invalid JSON payload', 400);
	}
}

/**
 * Handle API endpoints
 */
async function handleAPIEndpoints(pathname: string, url: URL, env: Env): Promise<Response> {
	// GET /api/posts/:category/:slug
	const postMatch = pathname.match(/^\/api\/posts\/([^/]+)\/([^/]+)$/);
	if (postMatch) {
		const category = postMatch[1];
		const slug = postMatch[2];
		const language = url.searchParams.get('lang') || 'en';
		const key = `${language}/${category}/${slug}`;
		const statusParam = url.searchParams.get('status');
		const status = statusParam === 'draft' ? 'draft' : 'published';

		const post = await getPost(env, key, status);
		if (!post) {
			return createErrorResponse('Post not found', 404);
		}

		return createResponse(post);
	}

	// GET /api/posts/:category
	const categoryMatch = pathname.match(/^\/api\/posts\/([^/]+)$/);
	if (categoryMatch) {
		const category = categoryMatch[1];
		const language = url.searchParams.get('lang') || 'en';
		const statusParam = url.searchParams.get('status');
		const status = statusParam === 'draft' ? 'draft' : 'published';

		const slugs = await getCategorySlugs(env, `${language}/${category}`);
		const posts = [];

		for (const slug of slugs) {
			const key = `${language}/${category}/${slug}`;
			const post = await getPost(env, key, status);
			if (post) {
				posts.push(post);
			}
		}

		return createResponse(posts);
	}

	// GET /api/categories
	if (pathname === '/api/categories') {
		const language = url.searchParams.get('lang') || 'en';
		const categories = await getCategories(env);
		const categoryInfos = [];

		// Filter categories for the specified language
		for (const category of categories) {
			if (category.startsWith(`${language}/`)) {
				const categoryName = category.replace(`${language}/`, '');
				const info = await getCategoryInfo(env, category);
				if (info) {
					// Update the name to remove language prefix
					info.name = categoryName;
					categoryInfos.push(info);
				}
			}
		}

		return createResponse(categoryInfos);
	}

	// GET /api/categories/:category
	const categoryInfoMatch = pathname.match(/^\/api\/categories\/([^/]+)$/);
	if (categoryInfoMatch) {
		const category = categoryInfoMatch[1];
		const language = url.searchParams.get('lang') || 'en';
		const fullCategoryKey = `${language}/${category}`;
		const info = await getCategoryInfo(env, fullCategoryKey);

		if (!info) {
			return createErrorResponse('Category not found', 404);
		}

		// Update the name to remove language prefix
		info.name = category;
		return createResponse(info);
	}

	// GET /api/search
	if (pathname === '/api/search') {
		const query = url.searchParams.get('q');
		if (!query) {
			return createErrorResponse('Query parameter "q" is required', 400);
		}

		const language = url.searchParams.get('lang') || 'en';
		const statusParam = url.searchParams.get('status');
		const status = statusParam === 'draft' ? 'draft' : 'published';

		const results = await searchPosts(env, query, status, language);
		return createResponse(results);
	}

	// GET /api/recent
	if (pathname === '/api/recent') {
		const limit = parseInt(url.searchParams.get('limit') || '10');
		const language = url.searchParams.get('lang') || 'en';
		const statusParam = url.searchParams.get('status');
		const status = statusParam === 'draft' ? 'draft' : 'published';

		const posts = await getRecentPosts(env, limit, status, language);
		return createResponse(posts);
	}

	// GET /api/metadata/:category/:slug
	const metadataMatch = pathname.match(/^\/api\/metadata\/([^/]+)\/([^/]+)$/);
	if (metadataMatch) {
		const category = metadataMatch[1];
		const slug = metadataMatch[2];
		const language = url.searchParams.get('lang') || 'en';
		const key = `${language}/${category}/${slug}`;
		const statusParam = url.searchParams.get('status');
		const status = statusParam === 'draft' ? 'draft' : 'published';

		const metadata = await getPostMetadata(env, key, status);
		if (!metadata) {
			return createErrorResponse('Post metadata not found', 404);
		}

		return createResponse(metadata);
	}

	return createErrorResponse('API endpoint not found', 404);
}

/**
 * Handle legacy endpoints for backward compatibility
 */
async function handleLegacyEndpoints(pathname: string, url: URL, env: Env): Promise<Response> {
	// GET /posts/:category/:slug (legacy)
	const legacyPostMatch = pathname.match(/^\/posts\/([^/]+)\/([^/]+)$/);
	if (legacyPostMatch) {
		const category = legacyPostMatch[1];
		const slug = legacyPostMatch[2];
		const language = url.searchParams.get('lang') || 'en';
		const key = `${language}/${category}/${slug}`;
		const statusParam = url.searchParams.get('status');
		const status = statusParam === 'draft' ? 'draft' : 'published';

		const content = await getMarkdown(env, key, status);
		if (!content) {
			return new Response('Not found', { status: 404 });
		}

		return new Response(content, {
			headers: {
				'Content-Type': 'text/markdown',
				'Cache-Control': 'public, max-age=3600',
			},
		});
	}

	// GET /posts/:category (legacy)
	const legacyCategoryMatch = pathname.match(/^\/posts\/([^/]+)$/);
	if (legacyCategoryMatch) {
		const category = legacyCategoryMatch[1];
		const language = url.searchParams.get('lang') || 'en';
		const slugs = await getCategorySlugs(env, `${language}/${category}`);
		return new Response(JSON.stringify(slugs), {
			headers: { 'Content-Type': 'application/json' },
		});
	}

	// GET /categories (legacy)
	if (pathname === '/categories') {
		const language = url.searchParams.get('lang') || 'en';
		const categories = await getCategories(env);
		const languageCategories = categories.filter((cat) => cat.startsWith(`${language}/`)).map((cat) => cat.replace(`${language}/`, ''));

		return new Response(JSON.stringify(languageCategories), {
			headers: { 'Content-Type': 'application/json' },
		});
	}

	return createErrorResponse('Endpoint not found', 404);
}
