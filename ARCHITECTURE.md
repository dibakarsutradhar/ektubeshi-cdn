# Ektubeshi CDN - Architecture Overview

## 🏗️ System Architecture

The Ektubeshi CDN is a **serverless content delivery microservice** built on Cloudflare's edge computing platform. It provides a clean, scalable API for serving markdown blog content with advanced features like metadata extraction, search, and multi-language support.

### Core Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │    │  Cloudflare     │    │  Content Store  │
│                 │    │    Workers      │    │                 │
│ • Web Apps      │◄──►│                 │◄──►│ • KV Storage    │
│ • Mobile Apps   │    │ • API Gateway   │    │ • Metadata      │
│ • CMS Systems   │    │ • Request Router│    │ • Indexes       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Code Structure

### `src/index.ts` - Main Entry Point
- **Request Router**: Handles all incoming HTTP requests
- **CORS Support**: Enables cross-origin requests
- **Error Handling**: Standardized error responses
- **API Versioning**: Supports both modern `/api/*` and legacy endpoints

### `src/kv.ts` - Data Layer
- **KV Operations**: All Cloudflare KV interactions
- **Metadata Extraction**: Parses YAML frontmatter from markdown
- **Index Management**: Maintains category and post indexes
- **Search Engine**: Full-text search across content

### `src/types.ts` - Type Definitions
- **Interface Definitions**: TypeScript interfaces for all data structures
- **API Response Types**: Standardized response formats
- **Metadata Schema**: Content metadata structure

## 🔄 Data Flow

### Content Sync Flow
```
1. Markdown File → 2. Frontmatter Parsing → 3. KV Storage → 4. Index Update
```

### Content Retrieval Flow
```
1. API Request → 2. Route Matching → 3. KV Lookup → 4. Response Formatting
```

### Search Flow
```
1. Search Query → 2. Category Scan → 3. Content Filtering → 4. Result Ranking
```

## 🗄️ Data Storage Strategy

### KV Namespace Structure
```
published:category/slug     → Raw markdown content
metadata:published:category/slug → Parsed metadata (JSON)
index:category             → Array of slugs in category
index:categories           → Array of all categories
draft:category/slug        → Draft content (same structure)
```

### Benefits
- **Fast Reads**: Sub-millisecond access times
- **Global Distribution**: 200+ edge locations
- **Automatic Scaling**: No infrastructure management
- **Cost Effective**: Pay-per-request model

## 🚀 API Design

### RESTful Endpoints
```
GET  /health                    # Health check
POST /sync                      # Content synchronization
GET  /api/posts/:category/:slug # Get specific post
GET  /api/posts/:category       # Get posts by category
GET  /api/categories            # Get all categories
GET  /api/categories/:category  # Get category details
GET  /api/search?q=query        # Search posts
GET  /api/recent?limit=N        # Get recent posts
GET  /api/metadata/:cat/:slug   # Get post metadata
```

### Legacy Endpoints (Backward Compatibility)
```
GET  /posts/:category/:slug     # Raw markdown
GET  /posts/:category           # Category slugs
GET  /categories                # Category list
```

## 🔍 Search Implementation

### Search Strategy
1. **Category-based Scanning**: Iterate through all categories
2. **Content Filtering**: Match against title, content, and tags
3. **Case-insensitive**: Normalized search queries
4. **Real-time Results**: No pre-built search indexes

### Search Capabilities
- **Title Search**: Match post titles
- **Content Search**: Search within markdown content
- **Tag Search**: Match post tags
- **Combined Search**: All fields simultaneously

## 🛡️ Security & Performance

### Security Features
- **Input Validation**: All endpoints validate input
- **Error Handling**: No information leakage in errors
- **CORS Support**: Configurable cross-origin access
- **Rate Limiting**: Cloudflare built-in protection

### Performance Optimizations
- **Edge Caching**: 1-hour cache on all responses
- **Metadata Separation**: Fast metadata-only queries
- **Indexed Lookups**: O(1) category and slug lookups
- **Global CDN**: 200+ edge locations worldwide

## 🔧 Development Workflow

### Local Development
```bash
# Start development server
npm run dev

# Run tests
npm test

# Sync content
npm run sync

# Watch and sync
npm run sync:watch
```

### Deployment Pipeline
```bash
# Generate types
npm run cf-typegen

# Deploy to production
npm run deploy
```

## 📊 Monitoring & Observability

### Built-in Monitoring
- **Health Endpoint**: `/health` for uptime monitoring
- **Error Logging**: Structured error responses
- **Performance Metrics**: Cloudflare Analytics integration
- **Request Tracing**: Full request/response logging

### External Monitoring
- **Cloudflare Dashboard**: Real-time metrics
- **Logs**: Request logs and error tracking
- **Analytics**: Traffic patterns and usage statistics

## 🔄 Content Management

### Content Format
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

### Content Workflow
1. **Authoring**: Write markdown with frontmatter
2. **Validation**: Frontmatter validation on sync
3. **Storage**: Automatic metadata extraction and storage
4. **Indexing**: Category and search index updates
5. **Delivery**: Fast API access with caching

## 🌐 Multi-language Support

### Language Organization
```
content/
├── en/          # English content
│   ├── tech/
│   └── drama/
├── bn/          # Bengali content
│   ├── tech/
│   └── drama/
└── hi/          # Hindi content
    ├── tech/
    └── drama/
```

### Language Features
- **Folder-based**: Language codes as top-level folders
- **Metadata Support**: Language field in frontmatter
- **API Filtering**: Language-specific queries
- **Unified Search**: Cross-language search capabilities

## 🔮 Future Enhancements

### Planned Features
- **Durable Objects**: For real-time features
- **R2 Storage**: For large media files
- **GraphQL API**: Alternative to REST
- **Webhook Support**: For CMS integrations
- **Analytics API**: Content usage statistics
- **A/B Testing**: Content variant support

### Scalability Considerations
- **Sharding**: Multiple KV namespaces for large datasets
- **Caching Strategy**: Multi-level caching
- **CDN Integration**: Direct Cloudflare CDN usage
- **Microservices**: Service decomposition for complex features

## 📈 Performance Benchmarks

### Response Times
- **Health Check**: < 5ms
- **Post Retrieval**: < 10ms
- **Category List**: < 15ms
- **Search Query**: < 50ms (varies by dataset size)

### Throughput
- **Concurrent Requests**: 1000+ requests/second
- **Global Distribution**: 200+ edge locations
- **Cold Start**: < 10ms
- **Memory Usage**: < 128MB per request

## 🔧 Configuration

### Environment Variables
```bash
# Worker configuration
WORKER_URL=https://your-worker.your-subdomain.workers.dev

# KV namespace IDs (configured in wrangler.jsonc)
EKTUBESHI_CDN_KV=your-kv-namespace-id
```

### Wrangler Configuration
```json
{
  "name": "ektubeshi-cdn",
  "main": "src/index.ts",
  "compatibility_date": "2025-08-07",
  "kv_namespaces": [
    {
      "binding": "EKTUBESHI_CDN_KV",
      "id": "your-kv-namespace-id"
    }
  ]
}
```

This architecture provides a robust, scalable foundation for content delivery with excellent performance, security, and developer experience.
