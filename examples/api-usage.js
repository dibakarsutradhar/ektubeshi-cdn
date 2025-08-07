/**
 * API Usage Examples
 *
 * This file demonstrates how to use the Ektubeshi CDN API endpoints
 * from a client application.
 */

const API_BASE = 'https://your-worker.your-subdomain.workers.dev';

/**
 * Example: Get all categories
 */
async function getCategories() {
	try {
		const response = await fetch(`${API_BASE}/api/categories`);
		const data = await response.json();

		if (data.success) {
			console.log('Categories:', data.data);
			return data.data;
		} else {
			console.error('Error:', data.error);
		}
	} catch (error) {
		console.error('Request failed:', error);
	}
}

/**
 * Example: Get posts from a category
 */
async function getPostsByCategory(category) {
	try {
		const response = await fetch(`${API_BASE}/api/posts/${category}`);
		const data = await response.json();

		if (data.success) {
			console.log(`Posts in ${category}:`, data.data);
			return data.data;
		} else {
			console.error('Error:', data.error);
		}
	} catch (error) {
		console.error('Request failed:', error);
	}
}

/**
 * Example: Get a specific post
 */
async function getPost(category, slug) {
	try {
		const response = await fetch(`${API_BASE}/api/posts/${category}/${slug}`);
		const data = await response.json();

		if (data.success) {
			console.log('Post:', data.data);
			return data.data;
		} else {
			console.error('Error:', data.error);
		}
	} catch (error) {
		console.error('Request failed:', error);
	}
}

/**
 * Example: Search posts
 */
async function searchPosts(query) {
	try {
		const response = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query)}`);
		const data = await response.json();

		if (data.success) {
			console.log(`Search results for "${query}":`, data.data);
			return data.data;
		} else {
			console.error('Error:', data.error);
		}
	} catch (error) {
		console.error('Request failed:', error);
	}
}

/**
 * Example: Get recent posts
 */
async function getRecentPosts(limit = 5) {
	try {
		const response = await fetch(`${API_BASE}/api/recent?limit=${limit}`);
		const data = await response.json();

		if (data.success) {
			console.log(`Recent posts (${limit}):`, data.data);
			return data.data;
		} else {
			console.error('Error:', data.error);
		}
	} catch (error) {
		console.error('Request failed:', error);
	}
}

/**
 * Example: Get post metadata only
 */
async function getPostMetadata(category, slug) {
	try {
		const response = await fetch(`${API_BASE}/api/metadata/${category}/${slug}`);
		const data = await response.json();

		if (data.success) {
			console.log('Post metadata:', data.data);
			return data.data;
		} else {
			console.error('Error:', data.error);
		}
	} catch (error) {
		console.error('Request failed:', error);
	}
}

/**
 * Example: Sync content (for admin use)
 */
async function syncContent(key, content, status = 'published') {
	try {
		const response = await fetch(`${API_BASE}/sync`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				key,
				content,
				status,
			}),
		});

		const data = await response.json();

		if (data.success) {
			console.log('Content synced successfully');
			return data.data;
		} else {
			console.error('Error:', data.error);
		}
	} catch (error) {
		console.error('Request failed:', error);
	}
}

/**
 * Example: React component using the API
 */
function BlogPost({ category, slug }) {
	const [post, setPost] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		async function fetchPost() {
			try {
				const response = await fetch(`${API_BASE}/api/posts/${category}/${slug}`);
				const data = await response.json();

				if (data.success) {
					setPost(data.data);
				} else {
					setError(data.error);
				}
			} catch (err) {
				setError('Failed to fetch post');
			} finally {
				setLoading(false);
			}
		}

		fetchPost();
	}, [category, slug]);

	if (loading) return <div>Loading...</div>;
	if (error) return <div>Error: {error}</div>;
	if (!post) return <div>Post not found</div>;

	return (
		<article>
			<h1>{post.metadata.title}</h1>
			<div className="meta">
				<span>By {post.metadata.author}</span>
				<span>{new Date(post.metadata.date).toLocaleDateString()}</span>
			</div>
			<div className="content">
				{/* Render markdown content here */}
				<pre>{post.content}</pre>
			</div>
		</article>
	);
}

/**
 * Example: Next.js API route
 */
// pages/api/posts/[category]/[slug].js
export default async function handler(req, res) {
	const { category, slug } = req.query;

	try {
		const response = await fetch(`${API_BASE}/api/posts/${category}/${slug}`);
		const data = await response.json();

		if (data.success) {
			res.status(200).json(data.data);
		} else {
			res.status(404).json({ error: data.error });
		}
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
	}
}

// Export functions for use in other modules
export { getCategories, getPostsByCategory, getPost, searchPosts, getRecentPosts, getPostMetadata, syncContent };
