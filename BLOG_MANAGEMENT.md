# Blog Management System

A comprehensive CLI-based blog management system for the Ektubeshi CDN microservice.

## 🚀 Quick Start

### 1. Initialize the Blog Structure
```bash
make init-structure
```

### 2. Create Your First Post
```bash
make new-post LANG=en CATEGORY=tech TITLE="My First Blog Post"
```

### 3. Edit the Post
```bash
make edit-post FILE="content/en/tech/my-first-blog-post.md"
```

### 4. Publish the Post
```bash
make publish-post FILE="content/en/tech/my-first-blog-post.md"
```

### 5. Sync to CDN
```bash
make sync
```

## 📝 Blog Post Creation

### Full Post Creation
```bash
make new-post LANG=en CATEGORY=drama TITLE="My Dramatic Post"
```

**Parameters:**
- `LANG`: Language code (en, bn, hi)
- `CATEGORY`: Post category (drama, tech, lifestyle, travel, food)
- `TITLE`: Post title (will be converted to slug automatically)

### Quick Post Creation
```bash
make quick-post TITLE="Quick Post"
```
Creates a post with default values (LANG=en, CATEGORY=tech)

## 📁 Content Structure

```
content/
├── en/          # English content
│   ├── drama/
│   ├── tech/
│   ├── lifestyle/
│   ├── travel/
│   └── food/
├── bn/          # Bengali content
│   └── [categories]/
└── hi/          # Hindi content
    └── [categories]/
```

## 🏷️ Blog Post Template

Each post follows this structure:

```markdown
---
title: "Your Post Title"
date: "YYYY-MM-DD"
author: "Your Name"
status: "draft"           # draft or published
category: "Category"
excerpt: "Brief description"
tags: ["tag1", "tag2"]
language: "en"
featured: false
reading_time: 5
---

# Your Post Title

*Your subtitle here*

---

## Introduction

Start your blog post with an engaging introduction.

## Main Content

Your main content goes here.

## Conclusion

Wrap up your post with a compelling conclusion.

---

*"Your quote or call to action here"*

**Stay tuned for more content!**
```

## 🛠️ Available Commands

### Post Management
- `make new-post` - Create a new blog post
- `make quick-post` - Create a quick post with defaults
- `make edit-post` - Edit an existing post
- `make preview-post` - Preview a post
- `make publish-post` - Publish a draft post
- `make unpublish-post` - Unpublish a post

### Content Organization
- `make list-posts` - List all blog posts
- `make list-category` - List posts by category
- `make list-language` - List posts by language
- `make stats` - Show blog statistics

### Development & Deployment
- `make dev` - Start development server
- `make sync` - Sync content to CDN
- `make watch` - Watch for changes and auto-sync
- `make test-api` - Test API endpoints

### Utilities
- `make init-structure` - Initialize directory structure
- `make backup` - Create content backup
- `make restore` - Restore from backup
- `make clean-drafts` - Remove draft posts

## 📊 Blog Statistics

View comprehensive statistics about your blog:

```bash
make stats
```

**Output includes:**
- Total posts count
- Published vs draft posts
- Posts by language
- Posts by category

## 🔄 Content Workflow

### 1. Draft Creation
```bash
make new-post LANG=en CATEGORY=tech TITLE="My New Post"
```

### 2. Content Editing
```bash
make edit-post FILE="content/en/tech/my-new-post.md"
```

### 3. Preview & Review
```bash
make preview-post FILE="content/en/tech/my-new-post.md"
```

### 4. Publishing
```bash
make publish-post FILE="content/en/tech/my-new-post.md"
```

### 5. CDN Sync
```bash
make sync
```

## 🌐 API Integration

The blog posts are automatically available via the CDN API:

### Get Recent Posts
```bash
curl "http://localhost:8787/api/recent?lang=en"
```

### Get Posts by Category
```bash
curl "http://localhost:8787/api/posts/tech?lang=en"
```

### Get Specific Post
```bash
curl "http://localhost:8787/api/posts/tech/my-post?lang=en"
```

## 📝 Best Practices

### 1. Post Structure
- Use clear, descriptive titles
- Include compelling excerpts
- Add relevant tags
- Set appropriate reading time

### 2. Content Organization
- Use consistent categories
- Organize by language
- Keep drafts separate from published content

### 3. SEO Optimization
- Use descriptive slugs (auto-generated from title)
- Include relevant tags
- Write compelling excerpts
- Use proper markdown formatting

### 4. Workflow
- Always start with drafts
- Preview before publishing
- Sync to CDN after publishing
- Regular backups

## 🔧 Configuration

### Customizing the Makefile

Edit the `Makefile` to customize:

```makefile
# Available languages
LANGUAGES = en bn hi

# Available categories
CATEGORIES = drama tech lifestyle travel food

# Default editor
EDITOR ?= code
```

### Adding New Categories

1. Add to `CATEGORIES` in Makefile
2. Run `make init-structure` to create directories
3. Start creating posts in the new category

### Adding New Languages

1. Add language code to `LANGUAGES` in Makefile
2. Run `make init-structure` to create directories
3. Create content in the new language

## 🚨 Troubleshooting

### Common Issues

1. **Makefile syntax errors**
   - Ensure proper indentation (use tabs, not spaces)
   - Check for missing separators

2. **Post not syncing**
   - Verify the post is published (status: "published")
   - Check the sync script is running
   - Ensure proper file permissions

3. **API not returning posts**
   - Verify content is synced to CDN
   - Check language parameter is correct
   - Ensure post status is published

### Debug Commands

```bash
# Test API endpoints
make test-api

# Check post status
make list-posts

# Verify sync
make sync
```

## 📚 Advanced Usage

### Batch Operations

Create multiple posts:
```bash
for title in "Post 1" "Post 2" "Post 3"; do
    make new-post LANG=en CATEGORY=tech TITLE="$title"
done
```

### Automated Publishing

Publish all drafts in a category:
```bash
find content/en/tech -name "*.md" -exec grep -l 'status: "draft"' {} \; | while read file; do
    make publish-post FILE="$file"
done
```

### Content Migration

Restore from backup:
```bash
make restore BACKUP=backup-2025-08-08-12-00-00.tar.gz
```

## 🤝 Contributing

To contribute to the blog management system:

1. Follow the established workflow
2. Use consistent naming conventions
3. Test commands before committing
4. Update documentation for new features

## 📄 License

This blog management system is part of the Ektubeshi CDN project and follows the same license terms.
