import { describe, it, expect, beforeAll } from 'vitest';
import { unstable_dev } from 'wrangler';
import type { UnstableDevWorker } from 'wrangler';

describe('Ektubeshi CDN Microservice', () => {
	let worker: UnstableDevWorker;

	beforeAll(async () => {
		worker = await unstable_dev('src/index.ts', {
			experimental: { disableExperimentalWarning: true },
		});
	});

	afterAll(async () => {
		await worker.stop();
	});

	describe('Health Check', () => {
		it('should return healthy status', async () => {
			const resp = await worker.fetch('/health');
			expect(resp.status).toBe(200);

			const data = await resp.json();
			expect(data.success).toBe(true);
			expect(data.data.status).toBe('healthy');
			expect(data.data.timestamp).toBeDefined();
		});
	});

	describe('Content Sync', () => {
		it('should sync content successfully', async () => {
			const testContent = `---
title: Test Post
date: 2025-01-01
author: Test Author
status: published
category: test
excerpt: Test excerpt
tags: [test, demo]
language: en
---

# Test Content

This is a test post content.`;

			const resp = await worker.fetch('/sync', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					key: 'test/test-post',
					content: testContent,
					status: 'published',
				}),
			});

			expect(resp.status).toBe(200);

			const data = await resp.json();
			expect(data.success).toBe(true);
			expect(data.data.message).toBe('Content synced successfully');
		});

		it('should reject invalid sync payload', async () => {
			const resp = await worker.fetch('/sync', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					key: 'test/invalid',
					// Missing content
				}),
			});

			expect(resp.status).toBe(400);

			const data = await resp.json();
			expect(data.success).toBe(false);
			expect(data.error).toBe('Missing key or content');
		});
	});

	describe('API Endpoints', () => {
		beforeAll(async () => {
			// Setup test data
			const testContent = `---
title: API Test Post
date: 2025-01-01
author: API Test Author
status: published
category: api-test
excerpt: API test excerpt
tags: [api, test]
language: en
---

# API Test Content

This is an API test post content.`;

			await worker.fetch('/sync', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					key: 'api-test/api-test-post',
					content: testContent,
					status: 'published',
				}),
			});
		});

		describe('Get Post', () => {
			it('should return complete post data', async () => {
				const resp = await worker.fetch('/api/posts/api-test/api-test-post');
				expect(resp.status).toBe(200);

				const data = await resp.json();
				expect(data.success).toBe(true);
				expect(data.data.slug).toBe('api-test-post');
				expect(data.data.metadata.title).toBe('API Test Post');
				expect(data.data.metadata.author).toBe('API Test Author');
				expect(data.data.content).toContain('# API Test Content');
			});

			it('should return 404 for non-existent post', async () => {
				const resp = await worker.fetch('/api/posts/non-existent/non-existent-post');
				expect(resp.status).toBe(404);

				const data = await resp.json();
				expect(data.success).toBe(false);
				expect(data.error).toBe('Post not found');
			});
		});

		describe('Get Posts by Category', () => {
			it('should return all posts in category', async () => {
				const resp = await worker.fetch('/api/posts/api-test');
				expect(resp.status).toBe(200);

				const data = await resp.json();
				expect(data.success).toBe(true);
				expect(Array.isArray(data.data)).toBe(true);
				expect(data.data.length).toBeGreaterThan(0);
				expect(data.data[0].metadata.category).toBe('api-test');
			});
		});

		describe('Get Categories', () => {
			it('should return all categories with info', async () => {
				const resp = await worker.fetch('/api/categories');
				expect(resp.status).toBe(200);

				const data = await resp.json();
				expect(data.success).toBe(true);
				expect(Array.isArray(data.data)).toBe(true);

				// Should contain our test categories
				const categories = data.data.map((cat: any) => cat.name);
				expect(categories).toContain('api-test');
			});
		});

		describe('Get Category Info', () => {
			it('should return detailed category information', async () => {
				const resp = await worker.fetch('/api/categories/api-test');
				expect(resp.status).toBe(200);

				const data = await resp.json();
				expect(data.success).toBe(true);
				expect(data.data.name).toBe('api-test');
				expect(data.data.postCount).toBeGreaterThan(0);
				expect(Array.isArray(data.data.posts)).toBe(true);
			});

			it('should return 404 for non-existent category', async () => {
				const resp = await worker.fetch('/api/categories/non-existent');
				expect(resp.status).toBe(404);

				const data = await resp.json();
				expect(data.success).toBe(false);
				expect(data.error).toBe('Category not found');
			});
		});

		describe('Search Posts', () => {
			it('should search posts by query', async () => {
				const resp = await worker.fetch('/api/search?q=API Test');
				expect(resp.status).toBe(200);

				const data = await resp.json();
				expect(data.success).toBe(true);
				expect(Array.isArray(data.data)).toBe(true);
				expect(data.data.length).toBeGreaterThan(0);
			});

			it('should require query parameter', async () => {
				const resp = await worker.fetch('/api/search');
				expect(resp.status).toBe(400);

				const data = await resp.json();
				expect(data.success).toBe(false);
				expect(data.error).toBe('Query parameter "q" is required');
			});
		});

		describe('Recent Posts', () => {
			it('should return recent posts', async () => {
				const resp = await worker.fetch('/api/recent?limit=5');
				expect(resp.status).toBe(200);

				const data = await resp.json();
				expect(data.success).toBe(true);
				expect(Array.isArray(data.data)).toBe(true);
				expect(data.data.length).toBeLessThanOrEqual(5);
			});
		});

		describe('Get Post Metadata', () => {
			it('should return only metadata', async () => {
				const resp = await worker.fetch('/api/metadata/api-test/api-test-post');
				expect(resp.status).toBe(200);

				const data = await resp.json();
				expect(data.success).toBe(true);
				expect(data.data.title).toBe('API Test Post');
				expect(data.data.author).toBe('API Test Author');
				expect(data.data.content).toBeUndefined(); // Should not include content
			});
		});
	});

	describe('Legacy Endpoints', () => {
		describe('Get Raw Markdown', () => {
			it('should return raw markdown content', async () => {
				const resp = await worker.fetch('/posts/api-test/api-test-post');
				expect(resp.status).toBe(200);

				const content = await resp.text();
				expect(content).toContain('# API Test Content');
				expect(resp.headers.get('Content-Type')).toBe('text/markdown');
			});
		});

		describe('Get Category Slugs', () => {
			it('should return array of slugs', async () => {
				const resp = await worker.fetch('/posts/api-test');
				expect(resp.status).toBe(200);

				const data = await resp.json();
				expect(Array.isArray(data)).toBe(true);
				expect(data).toContain('api-test-post');
			});
		});

		describe('Get Categories List', () => {
			it('should return simple array of categories', async () => {
				const resp = await worker.fetch('/categories');
				expect(resp.status).toBe(200);

				const data = await resp.json();
				expect(Array.isArray(data)).toBe(true);
				expect(data).toContain('api-test');
			});
		});
	});

	describe('CORS Support', () => {
		it('should handle preflight requests', async () => {
			const resp = await worker.fetch('/health', {
				method: 'OPTIONS',
				headers: {
					Origin: 'https://example.com',
					'Access-Control-Request-Method': 'GET',
					'Access-Control-Request-Headers': 'Content-Type',
				},
			});

			expect(resp.status).toBe(200);
			expect(resp.headers.get('Access-Control-Allow-Origin')).toBe('*');
			expect(resp.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, OPTIONS');
		});

		it('should include CORS headers in responses', async () => {
			const resp = await worker.fetch('/health');
			expect(resp.headers.get('Access-Control-Allow-Origin')).toBe('*');
			expect(resp.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, OPTIONS');
		});
	});

	describe('Error Handling', () => {
		it('should return 404 for unknown endpoints', async () => {
			const resp = await worker.fetch('/unknown-endpoint');
			expect(resp.status).toBe(404);

			const data = await resp.json();
			expect(data.success).toBe(false);
			expect(data.error).toBe('Endpoint not found');
		});

		it('should handle invalid JSON in sync', async () => {
			const resp = await worker.fetch('/sync', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: 'invalid json',
			});

			expect(resp.status).toBe(400);

			const data = await resp.json();
			expect(data.success).toBe(false);
			expect(data.error).toBe('Invalid JSON payload');
		});
	});
});
