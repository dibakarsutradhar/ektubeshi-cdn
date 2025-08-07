#!/usr/bin/env node

/**
 * Content Sync Utility
 *
 * This script reads markdown files from the content directory and syncs them
 * to the Cloudflare Worker via the /sync endpoint.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKER_URL = process.env.WORKER_URL || 'http://localhost:8787';
const CONTENT_DIR = path.join(__dirname, '../content');

/**
 * Read all markdown files recursively from a directory
 */
async function readMarkdownFiles(dir) {
	const files = [];

	async function scanDirectory(currentDir, relativePath = '') {
		const entries = await fs.readdir(currentDir, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = path.join(currentDir, entry.name);
			const relativeFilePath = path.join(relativePath, entry.name);

			if (entry.isDirectory()) {
				await scanDirectory(fullPath, relativeFilePath);
			} else if (entry.name.endsWith('.md')) {
				// Extract the key properly: remove language folder and .md extension
				// From: en/drama/my-first-post.md -> drama/my-first-post
				const keyPath = relativeFilePath.replace(/\.md$/, '');
				const pathParts = keyPath.split('/');

				// If we have a language folder (en, bn, etc.), remove it
				let finalKey = keyPath;
				if (pathParts.length > 1 && pathParts[0].length === 2) {
					// Assume first folder is language code if it's 2 characters
					finalKey = pathParts.slice(1).join('/');
				}

				files.push({
					path: fullPath,
					relativePath: finalKey,
					content: await fs.readFile(fullPath, 'utf-8'),
				});
			}
		}
	}

	await scanDirectory(dir);
	return files;
}

/**
 * Sync a single file to the worker
 */
async function syncFile(file) {
	try {
		const response = await fetch(`${WORKER_URL}/sync`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				key: file.relativePath,
				content: file.content,
				status: 'published',
			}),
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`HTTP ${response.status}: ${error}`);
		}

		const result = await response.json();
		console.log(`✅ Synced: ${file.relativePath}`);
		return result;
	} catch (error) {
		console.error(`❌ Failed to sync ${file.relativePath}:`, error.message);
		throw error;
	}
}

/**
 * Main sync function
 */
async function syncContent() {
	console.log('🚀 Starting content sync...');
	console.log(`📁 Reading from: ${CONTENT_DIR}`);
	console.log(`🌐 Syncing to: ${WORKER_URL}`);

	try {
		// Check if content directory exists
		try {
			await fs.access(CONTENT_DIR);
		} catch {
			console.error(`❌ Content directory not found: ${CONTENT_DIR}`);
			process.exit(1);
		}

		// Read all markdown files
		const files = await readMarkdownFiles(CONTENT_DIR);
		console.log(`📄 Found ${files.length} markdown files`);

		if (files.length === 0) {
			console.log('⚠️  No markdown files found to sync');
			return;
		}

		// Sync each file
		const results = [];
		for (const file of files) {
			try {
				const result = await syncFile(file);
				results.push({ file: file.relativePath, success: true, result });
			} catch (error) {
				results.push({ file: file.relativePath, success: false, error: error.message });
			}
		}

		// Summary
		const successful = results.filter((r) => r.success).length;
		const failed = results.filter((r) => !r.success).length;

		console.log('\n📊 Sync Summary:');
		console.log(`✅ Successful: ${successful}`);
		console.log(`❌ Failed: ${failed}`);

		if (failed > 0) {
			console.log('\n❌ Failed files:');
			results
				.filter((r) => !r.success)
				.forEach((r) => {
					console.log(`  - ${r.file}: ${r.error}`);
				});
			process.exit(1);
		}

		console.log('\n🎉 All content synced successfully!');
	} catch (error) {
		console.error('💥 Sync failed:', error.message);
		process.exit(1);
	}
}

/**
 * Watch for changes and auto-sync
 */
async function watchAndSync() {
	console.log('👀 Watching for changes...');

	const chokidar = await import('chokidar');
	const watcher = chokidar.default.watch(CONTENT_DIR, {
		ignored: /(^|[\/\\])\../, // ignore dotfiles
		persistent: true,
	});

	watcher
		.on('add', async (filePath) => {
			if (filePath.endsWith('.md')) {
				console.log(`📝 File added: ${filePath}`);
				await syncSingleFile(filePath);
			}
		})
		.on('change', async (filePath) => {
			if (filePath.endsWith('.md')) {
				console.log(`📝 File changed: ${filePath}`);
				await syncSingleFile(filePath);
			}
		})
		.on('unlink', async (filePath) => {
			if (filePath.endsWith('.md')) {
				console.log(`🗑️  File removed: ${filePath}`);
				// Note: Worker doesn't support deletion yet
			}
		});
}

/**
 * Sync a single file by path
 */
async function syncSingleFile(filePath) {
	try {
		const content = await fs.readFile(filePath, 'utf-8');
		const relativePath = path.relative(CONTENT_DIR, filePath).replace(/\.md$/, '');

		// Extract the key properly: remove language folder
		const pathParts = relativePath.split('/');
		let finalKey = relativePath;
		if (pathParts.length > 1 && pathParts[0].length === 2) {
			// Assume first folder is language code if it's 2 characters
			finalKey = pathParts.slice(1).join('/');
		}

		await syncFile({
			path: filePath,
			relativePath: finalKey,
			content,
		});
	} catch (error) {
		console.error(`❌ Failed to sync ${filePath}:`, error.message);
	}
}

// CLI
const command = process.argv[2];

switch (command) {
	case 'watch':
		watchAndSync();
		break;
	case 'sync':
	default:
		syncContent();
		break;
}
