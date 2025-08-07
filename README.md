# Ektubeshi CDN - Content Delivery Microservice

A high-performance, scalable content delivery microservice built with Cloudflare Workers and KV storage. This service provides a clean API for serving markdown blog content with metadata extraction, search capabilities, and multi-language support.

## 🏗️ Architecture

- **Runtime**: Cloudflare Workers (edge computing)
- **Storage**: Cloudflare KV (key-value store)
- **Content**: Markdown files with YAML frontmatter
- **API**: RESTful endpoints with JSON responses
- **Caching**: Built-in edge caching with configurable TTL

## 🚀 Features

- **Content Management**: Store and retrieve markdown content with metadata
- **Metadata Extraction**: Automatic parsing of YAML frontmatter
- **Search**: Full-text search across titles, content, and tags
- **Categories**: Organize content by categories and languages
- **Draft Support**: Separate draft and published content workflows
- **CORS Support**: Cross-origin resource sharing enabled
- **Backward Compatibility**: Legacy endpoints maintained
- **Health Monitoring**: Built-in health check endpoint

## 📁 Project Structure

```
ektubeshi-cdn/
├── src/
│   ├── index.ts      # Main worker entry point
│   ├── kv.ts         # KV storage operations
│   └── types.ts      # TypeScript type definitions
├── content/          # Sample content (for reference)
│   └── en/
│       └── drama/
│           └── my-first-post.md
├── test/             # Test files
├── wrangler.jsonc    # Cloudflare Workers configuration
└── package.json      # Dependencies and scripts
```

## 🔧 Setup & Deployment

### Prerequisites

- Node.js 18+ and pnpm
- Cloudflare account with Workers and KV enabled
- Wrangler CLI installed globally

### Installation

```bash
# Install dependencies
pnpm install

# Generate Cloudflare types
pnpm run cf-typegen

# Start development server
pnpm run dev

# Deploy to production
pnpm run deploy
```

### Environment Configuration

The service uses Cloudflare KV for storage. Ensure your `wrangler.jsonc` is configured with:

```json
{
  "kv_namespaces": [
    {
      "binding": "EKTUBESHI_CDN_KV",
      "id": "your-kv-namespace-id",
      "preview_id": "your-preview-kv-namespace-id"
    }
  ]
}
```

## 📚 API Reference

### Base URL
```
https://your-worker.your-subdomain.workers.dev
```

### Response Format
All API responses follow this structure:
```json
{
  "success": true,
  "data": { ... },
  "error": "Error message (if any)"
}
```

### Endpoints

#### Health Check
```http
GET /health
```
Returns service status and timestamp.

#### Content Sync
```http
POST /sync
Content-Type: application/json

{
  "key": "language/category/slug",
  "content": "---\ntitle: Post Title\ndate: 2025-01-01\nauthor: Author Name\nstatus: published\ncategory: Category\n---\n\nContent here...",
  "status": "published"
}
```

#### Get Post
```http
GET /api/posts/{category}/{slug}?lang={language}&status=published
```
Returns complete post with metadata and content.

#### Get Posts by Category
```http
GET /api/posts/{category}?lang={language}&status=published
```
Returns all posts in a category for the specified language.

#### Get Categories
```http
GET /api/categories?lang={language}
```
Returns list of all categories with post counts for the specified language.

#### Get Category Info
```http
GET /api/categories/{category}?lang={language}
```
Returns detailed information about a specific category.

#### Search Posts
```http
GET /api/search?q={query}&lang={language}&status=published
```
Searches across titles, content, and tags within the specified language.

#### Recent Posts
```http
GET /api/recent?limit=10&lang={language}&status=published
```
Returns most recent posts sorted by date for the specified language.

#### Get Post Metadata
```http
GET /api/metadata/{category}/{slug}?lang={language}&status=published
```
Returns only post metadata without content.

### Legacy Endpoints (Backward Compatibility)

#### Get Raw Markdown
```http
GET /posts/{category}/{slug}?lang={language}&status=published
```
Returns raw markdown content.

#### Get Category Slugs
```http
GET /posts/{category}?lang={language}
```
Returns array of slugs in a category for the specified language.

#### Get Categories List
```http
GET /categories?lang={language}
```
Returns simple array of category names for the specified language.

## 📝 Content Format

Posts should be written in Markdown with YAML frontmatter:

```markdown
---
title: Post Title
date: 2025-01-01
author: Author Name
status: published
category: Category Name
excerpt: Brief description
tags: [tag1, tag2]
language: en
---

# Content Title

Your markdown content here...
```

### Required Frontmatter Fields
- `title`: Post title
- `date`: Publication date (YYYY-MM-DD)
- `author`: Author name
- `status`: `draft` or `published`
- `category`: Category name

### Optional Frontmatter Fields
- `excerpt`: Brief description
- `tags`: Array of tags
- `language`: Language code (e.g., `en`, `bn`)

## 🔍 Search Capabilities

The search endpoint supports:
- **Title search**: Matches post titles
- **Content search**: Searches within post content
- **Tag search**: Matches post tags
- **Case-insensitive**: All searches are case-insensitive

## 🌐 CORS Support

All endpoints support CORS with the following headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

## 🧪 Testing

```bash
# Run tests
pnpm run test

# Run tests in watch mode
pnpm run test --watch
```

## 📊 Performance

- **Edge Caching**: 1-hour cache on all responses
- **KV Storage**: Sub-millisecond read times
- **Global Distribution**: 200+ edge locations worldwide
- **Cold Start**: < 10ms

## 🔒 Security

- Input validation on all endpoints
- Error handling without information leakage
- Rate limiting (Cloudflare built-in)
- HTTPS only

## 🚀 Deployment

The service is designed to be deployed as a Cloudflare Worker:

1. **Development**: `pnpm run dev`
2. **Staging**: Deploy to preview environment
3. **Production**: `pnpm run deploy`

## 📈 Monitoring

- Built-in health check endpoint
- Cloudflare Analytics integration
- Error logging and monitoring
- Performance metrics via Cloudflare dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
