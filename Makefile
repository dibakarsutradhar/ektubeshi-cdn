# Ektubeshi CDN Blog Management Makefile
# Usage: make <command> [ARGS]

# Configuration
CONTENT_DIR = content
LANGUAGES = en bn hi
CATEGORIES = drama tech lifestyle travel food
EDITOR ?= code
DATE_FORMAT = $(shell date +%Y-%m-%d)
TIMESTAMP = $(shell date +%Y-%m-%d-%H-%M-%S)

# Colors for output
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[1;33m
BLUE = \033[0;34m
PURPLE = \033[0;35m
CYAN = \033[0;36m
WHITE = \033[1;37m
NC = \033[0m # No Color

# Help target
.PHONY: help
help: ## Show this help message
	@echo "$(CYAN)Ektubeshi CDN Blog Management$(NC)"
	@echo "$(YELLOW)Available commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

# Blog post creation
.PHONY: new-post
new-post: ## Create a new blog post (usage: make new-post LANG=en CATEGORY=drama TITLE="My Post Title")
	@if [ -z "$(LANG)" ] || [ -z "$(CATEGORY)" ] || [ -z "$(TITLE)" ]; then \
		echo "$(RED)Error: LANG, CATEGORY, and TITLE are required$(NC)"; \
		echo "$(YELLOW)Usage: make new-post LANG=en CATEGORY=drama TITLE=\"My Post Title\"$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)Creating new blog post...$(NC)"
	@mkdir -p $(CONTENT_DIR)/$(LANG)/$(CATEGORY)
	@SLUG=$$(echo "$(TITLE)" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/-\+/-/g' | sed 's/^-*//' | sed 's/-*$$//'); \
	FILE_PATH="$(CONTENT_DIR)/$(LANG)/$(CATEGORY)/$$SLUG.md"; \
	echo "$(BLUE)Creating: $$FILE_PATH$(NC)"; \
	echo "---" > "$$FILE_PATH"; \
	echo "title: \"$(TITLE)\"" >> "$$FILE_PATH"; \
	echo "date: $(DATE_FORMAT)" >> "$$FILE_PATH"; \
	echo "author: \"Your Name\"" >> "$$FILE_PATH"; \
	echo "status: \"draft\"" >> "$$FILE_PATH"; \
	echo "category: \"$(CATEGORY)\"" >> "$$FILE_PATH"; \
	echo "excerpt: \"Brief description of your post\"" >> "$$FILE_PATH"; \
	echo "tags: [\"$(CATEGORY)\", \"tag1\", \"tag2\"]" >> "$$FILE_PATH"; \
	echo "language: \"$(LANG)\"" >> "$$FILE_PATH"; \
	echo "featured: false" >> "$$FILE_PATH"; \
	echo "reading_time: 5" >> "$$FILE_PATH"; \
	echo "---" >> "$$FILE_PATH"; \
	echo "" >> "$$FILE_PATH"; \
	echo "# $(TITLE)" >> "$$FILE_PATH"; \
	echo "" >> "$$FILE_PATH"; \
	echo "*Your subtitle here*" >> "$$FILE_PATH"; \
	echo "" >> "$$FILE_PATH"; \
	echo "---" >> "$$FILE_PATH"; \
	echo "" >> "$$FILE_PATH"; \
	echo "## Introduction" >> "$$FILE_PATH"; \
	echo "" >> "$$FILE_PATH"; \
	echo "Start your blog post with an engaging introduction that hooks the reader." >> "$$FILE_PATH"; \
	echo "" >> "$$FILE_PATH"; \
	echo "## Main Content" >> "$$FILE_PATH"; \
	echo "" >> "$$FILE_PATH"; \
	echo "Your main content goes here. Use markdown formatting to make your content readable and engaging." >> "$$FILE_PATH"; \
	echo "" >> "$$FILE_PATH"; \
	echo "## Conclusion" >> "$$FILE_PATH"; \
	echo "" >> "$$FILE_PATH"; \
	echo "Wrap up your post with a compelling conclusion." >> "$$FILE_PATH"; \
	echo "" >> "$$FILE_PATH"; \
	echo "---" >> "$$FILE_PATH"; \
	echo "" >> "$$FILE_PATH"; \
	echo "*\"Your quote or call to action here\"*" >> "$$FILE_PATH"; \
	echo "" >> "$$FILE_PATH"; \
	echo "**Stay tuned for more content!**" >> "$$FILE_PATH"
	@echo "$(GREEN)✓ Blog post created: $$FILE_PATH$(NC)"
	@echo "$(YELLOW)Next steps:$(NC)"
	@echo "  1. Edit the post: $(EDITOR) \"$$FILE_PATH\""
	@echo "  2. Preview: make preview-post FILE=\"$$FILE_PATH\""
	@echo "  3. Publish: make publish-post FILE=\"$$FILE_PATH\""

# Quick post creation with default values
.PHONY: quick-post
quick-post: ## Create a quick post with minimal setup (usage: make quick-post TITLE="My Post")
	@if [ -z "$(TITLE)" ]; then \
		echo "$(RED)Error: TITLE is required$(NC)"; \
		echo "$(YELLOW)Usage: make quick-post TITLE=\"My Post\"$(NC)"; \
		exit 1; \
	fi
	@$(MAKE) new-post LANG=en CATEGORY=tech TITLE="$(TITLE)"

# Edit a post
.PHONY: edit-post
edit-post: ## Edit an existing post (usage: make edit-post FILE=path/to/post.md)
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)Error: FILE is required$(NC)"; \
		echo "$(YELLOW)Usage: make edit-post FILE=content/en/drama/my-post.md$(NC)"; \
		exit 1; \
	fi
	@if [ ! -f "$(FILE)" ]; then \
		echo "$(RED)Error: File $(FILE) not found$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)Opening $(FILE) for editing...$(NC)"
	@$(EDITOR) "$(FILE)"

# Preview a post
.PHONY: preview-post
preview-post: ## Preview a post (usage: make preview-post FILE=path/to/post.md)
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)Error: FILE is required$(NC)"; \
		echo "$(YELLOW)Usage: make preview-post FILE=content/en/drama/my-post.md$(NC)"; \
		exit 1; \
	fi
	@if [ ! -f "$(FILE)" ]; then \
		echo "$(RED)Error: File $(FILE) not found$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)Previewing $(FILE)...$(NC)"
	@cat "$(FILE)" | head -20
	@echo "$(YELLOW)... (showing first 20 lines)$(NC)"

# Publish a post
.PHONY: publish-post
publish-post: ## Publish a post by changing status to published (usage: make publish-post FILE=path/to/post.md)
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)Error: FILE is required$(NC)"; \
		echo "$(YELLOW)Usage: make publish-post FILE=content/en/drama/my-post.md$(NC)"; \
		exit 1; \
	fi
	@if [ ! -f "$(FILE)" ]; then \
		echo "$(RED)Error: File $(FILE) not found$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)Publishing $(FILE)...$(NC)"
	@sed -i '' 's/status: "draft"/status: "published"/' "$(FILE)"
	@echo "$(GREEN)✓ Post published!$(NC)"
	@echo "$(YELLOW)Next: Sync to CDN: make sync$(NC)"

# Unpublish a post
.PHONY: unpublish-post
unpublish-post: ## Unpublish a post by changing status to draft (usage: make unpublish-post FILE=path/to/post.md)
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)Error: FILE is required$(NC)"; \
		echo "$(YELLOW)Usage: make unpublish-post FILE=content/en/drama/my-post.md$(NC)"; \
		exit 1; \
	fi
	@if [ ! -f "$(FILE)" ]; then \
		echo "$(RED)Error: File $(FILE) not found$(NC)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)Unpublishing $(FILE)...$(NC)"
	@sed -i '' 's/status: "published"/status: "draft"/' "$(FILE)"
	@echo "$(GREEN)✓ Post unpublished!$(NC)"

# List all posts
.PHONY: list-posts
list-posts: ## List all blog posts
	@echo "$(CYAN)📝 All Blog Posts:$(NC)"
	@find $(CONTENT_DIR) -name "*.md" -type f | sort | while read file; do \
		STATUS=$$(grep '^status:' "$$file" | head -1 | sed 's/status: *"\([^"]*\)"/\1/'); \
		TITLE=$$(grep '^title:' "$$file" | head -1 | sed 's/title: *"\([^"]*\)"/\1/'); \
		DATE=$$(grep '^date:' "$$file" | head -1 | sed 's/date: *"\([^"]*\)"/\1/'); \
		REL_PATH=$${file#$(CONTENT_DIR)/}; \
		if [ "$$STATUS" = "published" ]; then \
			echo "$(GREEN)✓ $(REL_PATH)$(NC) - $$TITLE ($$DATE)"; \
		else \
			echo "$(YELLOW)📝 $(REL_PATH)$(NC) - $$TITLE ($$DATE)"; \
		fi; \
	done

# List posts by category
.PHONY: list-category
list-category: ## List posts in a category (usage: make list-category CATEGORY=drama)
	@if [ -z "$(CATEGORY)" ]; then \
		echo "$(RED)Error: CATEGORY is required$(NC)"; \
		echo "$(YELLOW)Usage: make list-category CATEGORY=drama$(NC)"; \
		exit 1; \
	fi
	@echo "$(CYAN)📝 Posts in category: $(CATEGORY)$(NC)"
	@find $(CONTENT_DIR) -path "*/$(CATEGORY)/*.md" -type f | sort | while read file; do \
		STATUS=$$(grep '^status:' "$$file" | head -1 | sed 's/status: *"\([^"]*\)"/\1/'); \
		TITLE=$$(grep '^title:' "$$file" | head -1 | sed 's/title: *"\([^"]*\)"/\1/'); \
		REL_PATH=$${file#$(CONTENT_DIR)/}; \
		if [ "$$STATUS" = "published" ]; then \
			echo "$(GREEN)✓ $(REL_PATH)$(NC) - $$TITLE"; \
		else \
			echo "$(YELLOW)📝 $(REL_PATH)$(NC) - $$TITLE"; \
		fi; \
	done

# List posts by language
.PHONY: list-language
list-language: ## List posts in a language (usage: make list-language LANG=en)
	@if [ -z "$(LANG)" ]; then \
		echo "$(RED)Error: LANG is required$(NC)"; \
		echo "$(YELLOW)Usage: make list-language LANG=en$(NC)"; \
		exit 1; \
	fi
	@echo "$(CYAN)📝 Posts in language: $(LANG)$(NC)"
	@find $(CONTENT_DIR)/$(LANG) -name "*.md" -type f | sort | while read file; do \
		STATUS=$$(grep '^status:' "$$file" | head -1 | sed 's/status: *"\([^"]*\)"/\1/'); \
		TITLE=$$(grep '^title:' "$$file" | head -1 | sed 's/title: *"\([^"]*\)"/\1/'); \
		REL_PATH=$${file#$(CONTENT_DIR)/}; \
		if [ "$$STATUS" = "published" ]; then \
			echo "$(GREEN)✓ $(REL_PATH)$(NC) - $$TITLE"; \
		else \
			echo "$(YELLOW)📝 $(REL_PATH)$(NC) - $$TITLE"; \
		fi; \
	done

# Sync content to CDN
.PHONY: sync
sync: ## Sync all content to the CDN
	@echo "$(GREEN)🔄 Syncing content to CDN...$(NC)"
	@node scripts/sync-content.js
	@echo "$(GREEN)✓ Content synced!$(NC)"

# Watch and sync content
.PHONY: watch
watch: ## Watch for changes and auto-sync
	@echo "$(GREEN)👀 Watching for changes...$(NC)"
	@node scripts/sync-content.js watch

# Development server
.PHONY: dev
dev: ## Start development server
	@echo "$(GREEN)🚀 Starting development server...$(NC)"
	@pnpm run dev

# Test the API
.PHONY: test-api
test-api: ## Test the API endpoints
	@echo "$(CYAN)🧪 Testing API endpoints...$(NC)"
	@echo "$(BLUE)Testing health endpoint...$(NC)"
	@curl -s "http://localhost:8787/health" | jq .
	@echo "$(BLUE)Testing categories endpoint...$(NC)"
	@curl -s "http://localhost:8787/api/categories?lang=en" | jq .
	@echo "$(BLUE)Testing recent posts endpoint...$(NC)"
	@curl -s "http://localhost:8787/api/recent?lang=en" | jq .

# Create directory structure
.PHONY: init-structure
init-structure: ## Initialize the content directory structure
	@echo "$(GREEN)📁 Creating content directory structure...$(NC)"
	@for lang in $(LANGUAGES); do \
		for cat in $(CATEGORIES); do \
			mkdir -p $(CONTENT_DIR)/$$lang/$$cat; \
		done; \
	done
	@echo "$(GREEN)✓ Directory structure created!$(NC)"
	@echo "$(YELLOW)Available languages: $(LANGUAGES)$(NC)"
	@echo "$(YELLOW)Available categories: $(CATEGORIES)$(NC)"

# Clean up draft posts
.PHONY: clean-drafts
clean-drafts: ## Remove all draft posts (use with caution!)
	@echo "$(RED)⚠️  This will delete all draft posts!$(NC)"
	@read -p "Are you sure? (y/N): " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		find $(CONTENT_DIR) -name "*.md" -type f -exec grep -l 'status: "draft"' {} \; | xargs rm -f; \
		echo "$(GREEN)✓ Draft posts removed!$(NC)"; \
	else \
		echo "$(YELLOW)Operation cancelled.$(NC)"; \
	fi

# Backup content
.PHONY: backup
backup: ## Create a backup of all content
	@echo "$(GREEN)💾 Creating backup...$(NC)"
	@tar -czf "backup-$(TIMESTAMP).tar.gz" $(CONTENT_DIR)
	@echo "$(GREEN)✓ Backup created: backup-$(TIMESTAMP).tar.gz$(NC)"

# Restore from backup
.PHONY: restore
restore: ## Restore content from backup (usage: make restore BACKUP=backup-file.tar.gz)
	@if [ -z "$(BACKUP)" ]; then \
		echo "$(RED)Error: BACKUP is required$(NC)"; \
		echo "$(YELLOW)Usage: make restore BACKUP=backup-2025-08-07-12-00-00.tar.gz$(NC)"; \
		exit 1; \
	fi
	@if [ ! -f "$(BACKUP)" ]; then \
		echo "$(RED)Error: Backup file $(BACKUP) not found$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)🔄 Restoring from backup...$(NC)"
	@tar -xzf "$(BACKUP)"
	@echo "$(GREEN)✓ Content restored!$(NC)"

# Show statistics
.PHONY: stats
stats: ## Show blog statistics
	@echo "$(CYAN)📊 Blog Statistics:$(NC)"
	@TOTAL=$$(find $(CONTENT_DIR) -name "*.md" | wc -l | tr -d ' '); \
	PUBLISHED=$$(find $(CONTENT_DIR) -name "*.md" -exec grep -l 'status: "published"' {} \; | wc -l | tr -d ' '); \
	DRAFTS=$$(find $(CONTENT_DIR) -name "*.md" -exec grep -l 'status: "draft"' {} \; | wc -l | tr -d ' '); \
	echo "  Total posts: $$TOTAL"; \
	echo "  Published: $$PUBLISHED"; \
	echo "  Drafts: $$DRAFTS"; \
	echo ""; \
	echo "$(BLUE)By language:$(NC)"; \
	for lang in $(LANGUAGES); do \
		COUNT=$$(find $(CONTENT_DIR)/$$lang -name "*.md" 2>/dev/null | wc -l | tr -d ' '); \
		echo "  $$lang: $$COUNT posts"; \
	done; \
	echo ""; \
	echo "$(BLUE)By category:$(NC)"; \
	for cat in $(CATEGORIES); do \
		COUNT=$$(find $(CONTENT_DIR) -path "*/$$cat/*.md" 2>/dev/null | wc -l | tr -d ' '); \
		echo "  $$cat: $$COUNT posts"; \
	done

# Default target
.DEFAULT_GOAL := help
