import { ScrapingSource, ScrapedProduct, PricingInfo, ProductMetadata, SellerInfo, ReviewInfo } from './types';

export class ContentExtractor {
    /**
     * Extract structured product data from HTML content
     */
    public extractProductData(
        html: string,
        markdown: string,
        url: string,
        source: ScrapingSource,
        metadata?: any
    ): Partial<ScrapedProduct> {
        try {
            // Create a virtual DOM for parsing (server-side safe)
            const doc = this.parseHTML(html);

            const title = this.extractTitle(doc, source, metadata);
            const description = this.extractDescription(doc, source, markdown);
            const pricing = this.extractPricing(doc, source, markdown);
            const features = this.extractFeatures(doc, source, markdown);
            const images = this.extractImages(doc, source, url);
            const seller = this.extractSellerInfo(doc, source);
            const reviews = this.extractReviewInfo(doc, source);
            const productMetadata = this.extractMetadata(doc, source, metadata, markdown);

            return {
                title,
                description,
                pricing,
                features,
                images,
                seller,
                reviews,
                metadata: productMetadata,
                content: markdown || this.extractTextContent(doc)
            };
        } catch (error) {
            console.error('Content extraction error:', error);
            return {
                title: this.fallbackTitleExtraction(markdown, metadata),
                description: this.fallbackDescriptionExtraction(markdown),
                pricing: { type: 'free' },
                features: [],
                images: [],
                content: markdown || '',
                metadata: this.createBasicMetadata(url, source)
            };
        }
    }

    /**
     * Parse HTML content (server-side safe)
     */
    private parseHTML(html: string): Document {
        // Use a simple regex-based approach for server-side parsing
        // In a real implementation, you might want to use a proper HTML parser like jsdom
        return {
            querySelector: (selector: string) => this.querySelector(html, selector),
            querySelectorAll: (selector: string) => this.querySelectorAll(html, selector),
            textContent: html.replace(/<[^>]*>/g, ''),
            innerHTML: html
        } as any;
    }

    /**
     * Simple querySelector implementation using regex
     */
    private querySelector(html: string, selector: string): any {
        const elements = this.querySelectorAll(html, selector);
        return elements.length > 0 ? elements[0] : null;
    }

    /**
     * Simple querySelectorAll implementation using regex
     */
    private querySelectorAll(html: string, selector: string): any[] {
        // This is a simplified implementation
        // In production, use a proper HTML parser
        const results: any[] = [];

        try {
            // Handle common selectors - simplified approach
            if (selector.startsWith('.')) {
                const className = selector.slice(1).split(' ')[0]; // Take first class only
                const regex = new RegExp(`class="[^"]*${className}[^"]*"[^>]*>([^<]*)<`, 'gi');
                let match;
                while ((match = regex.exec(html)) !== null) {
                    results.push({
                        textContent: match[1].trim(),
                        innerHTML: match[1].trim()
                    });
                }
            } else if (selector.startsWith('#')) {
                const id = selector.slice(1);
                const regex = new RegExp(`id="${id}"[^>]*>([^<]*)<`, 'gi');
                let match;
                while ((match = regex.exec(html)) !== null) {
                    results.push({
                        textContent: match[1].trim(),
                        innerHTML: match[1].trim()
                    });
                }
            } else if (selector.includes(',')) {
                // Handle multiple selectors - try each one
                const selectors = selector.split(',').map(s => s.trim());
                for (const singleSelector of selectors) {
                    const singleResults = this.querySelectorAll(html, singleSelector);
                    results.push(...singleResults);
                    if (results.length > 0) break; // Use first successful selector
                }
            } else {
                // Handle simple tag selectors
                const tagName = selector.split(' ')[0]; // Take first tag only
                const regex = new RegExp(`<${tagName}[^>]*>([^<]*)</${tagName}>`, 'gi');
                let match;
                while ((match = regex.exec(html)) !== null) {
                    results.push({
                        textContent: match[1].trim(),
                        innerHTML: match[1].trim()
                    });
                }
            }
        } catch (error) {
            console.warn('Selector parsing error:', error);
            // Return empty results on error
        }

        return results;
    }

    /**
     * Extract product title
     */
    private extractTitle(doc: Document, source: ScrapingSource, metadata?: any): string {
        // Try source-specific selectors first
        if (source.selectors?.title) {
            const titleElement = doc.querySelector(source.selectors.title);
            if (titleElement?.textContent?.trim()) {
                return this.cleanText(titleElement.textContent);
            }
        }

        // Try metadata
        if (metadata?.title) {
            return this.cleanText(metadata.title);
        }

        // Fallback to common selectors
        const fallbackSelectors = ['h1', '.title', '.product-title', '[data-testid*="title"]'];
        for (const selector of fallbackSelectors) {
            const element = doc.querySelector(selector);
            if (element?.textContent?.trim()) {
                return this.cleanText(element.textContent);
            }
        }

        return 'Untitled Product';
    }

    /**
     * Extract product description
     */
    private extractDescription(doc: Document, source: ScrapingSource, markdown: string): string {
        // Try source-specific selectors first
        if (source.selectors?.description) {
            const descElement = doc.querySelector(source.selectors.description);
            if (descElement?.textContent?.trim()) {
                return this.cleanText(descElement.textContent);
            }
        }

        // Try to extract from markdown
        if (markdown) {
            const paragraphs = markdown.split('\n\n').filter(p =>
                p.length > 50 &&
                !p.startsWith('#') &&
                !p.startsWith('*') &&
                !p.includes('$')
            );

            if (paragraphs.length > 0) {
                return paragraphs.slice(0, 3).join('\n\n');
            }
        }

        // Fallback selectors
        const fallbackSelectors = ['.description', '.product-description', '.content', 'p'];
        for (const selector of fallbackSelectors) {
            const element = doc.querySelector(selector);
            if (element?.textContent?.trim() && element.textContent.length > 20) {
                return this.cleanText(element.textContent);
            }
        }

        return 'No description available';
    }

    /**
     * Extract pricing information
     */
    private extractPricing(doc: Document, source: ScrapingSource, markdown: string): PricingInfo {
        const pricing: PricingInfo = { type: 'free' };

        // Try source-specific selectors
        if (source.selectors?.price) {
            const priceElement = doc.querySelector(source.selectors.price);
            if (priceElement?.textContent) {
                const priceInfo = this.parsePriceText(priceElement.textContent);
                Object.assign(pricing, priceInfo);
            }
        }

        // Try to find price in markdown
        if (!pricing.amount && markdown) {
            const priceMatches = markdown.match(/\$[\d,]+\.?\d*/g);
            if (priceMatches) {
                const priceInfo = this.parsePriceText(priceMatches[0]);
                Object.assign(pricing, priceInfo);
            }
        }

        // Look for common price patterns
        const priceRegex = /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/;
        const priceMatch = doc.textContent?.match(priceRegex);
        if (priceMatch && !pricing.amount) {
            pricing.amount = parseFloat(priceMatch[1].replace(',', ''));
            pricing.currency = 'USD';
            pricing.type = 'one-time';
        }

        return pricing;
    }

    /**
     * Parse price text to extract pricing information
     */
    private parsePriceText(priceText: string): Partial<PricingInfo> {
        const pricing: Partial<PricingInfo> = {};

        // Remove common currency symbols and clean text
        const cleanPrice = priceText.replace(/[^\d.,\$€£¥]/g, '');

        // Extract amount
        const amountMatch = cleanPrice.match(/[\d,]+\.?\d*/);
        if (amountMatch) {
            pricing.amount = parseFloat(amountMatch[0].replace(',', ''));
        }

        // Detect currency
        if (priceText.includes('$')) pricing.currency = 'USD';
        else if (priceText.includes('€')) pricing.currency = 'EUR';
        else if (priceText.includes('£')) pricing.currency = 'GBP';
        else if (priceText.includes('¥')) pricing.currency = 'JPY';
        else pricing.currency = 'USD';

        // Detect pricing type
        if (priceText.toLowerCase().includes('free')) {
            pricing.type = 'free';
            pricing.amount = 0;
        } else if (priceText.toLowerCase().includes('month')) {
            pricing.type = 'subscription';
            pricing.interval = 'monthly';
        } else if (priceText.toLowerCase().includes('year')) {
            pricing.type = 'subscription';
            pricing.interval = 'yearly';
        } else {
            pricing.type = 'one-time';
        }

        return pricing;
    }

    /**
     * Extract product features
     */
    private extractFeatures(doc: Document, source: ScrapingSource, markdown: string): string[] {
        const features: string[] = [];

        // Try source-specific selectors
        if (source.selectors?.features) {
            const featureElements = doc.querySelectorAll(source.selectors.features);
            featureElements.forEach(element => {
                if (element.textContent?.trim()) {
                    features.push(this.cleanText(element.textContent));
                }
            });
        }

        // Extract from markdown lists
        if (markdown) {
            const listItems = markdown.match(/^[\*\-\+]\s+(.+)$/gm);
            if (listItems) {
                listItems.forEach(item => {
                    const feature = item.replace(/^[\*\-\+]\s+/, '').trim();
                    if (feature.length > 3 && feature.length < 200) {
                        features.push(feature);
                    }
                });
            }
        }

        // Fallback to common list selectors
        if (features.length === 0) {
            const listSelectors = ['ul li', '.features li', '.feature-list li'];
            for (const selector of listSelectors) {
                const elements = doc.querySelectorAll(selector);
                elements.forEach(element => {
                    if (element.textContent?.trim()) {
                        features.push(this.cleanText(element.textContent));
                    }
                });
                if (features.length > 0) break;
            }
        }

        return features.slice(0, 20); // Limit to 20 features
    }

    /**
     * Extract product images
     */
    private extractImages(doc: Document, source: ScrapingSource, baseUrl: string): string[] {
        const images: string[] = [];
        const seenUrls = new Set<string>();

        // Try source-specific selectors
        if (source.selectors?.images) {
            const imgElements = doc.querySelectorAll(source.selectors.images);
            imgElements.forEach(img => {
                const src = (img as any).src || (img as any).getAttribute?.('src');
                if (src) {
                    const fullUrl = this.resolveUrl(src, baseUrl);
                    if (fullUrl && !seenUrls.has(fullUrl)) {
                        images.push(fullUrl);
                        seenUrls.add(fullUrl);
                    }
                }
            });
        }

        // Fallback to all images
        if (images.length === 0) {
            const allImages = doc.querySelectorAll('img');
            allImages.forEach(img => {
                const src = (img as any).src || (img as any).getAttribute?.('src');
                if (src && !src.includes('icon') && !src.includes('logo')) {
                    const fullUrl = this.resolveUrl(src, baseUrl);
                    if (fullUrl && !seenUrls.has(fullUrl)) {
                        images.push(fullUrl);
                        seenUrls.add(fullUrl);
                    }
                }
            });
        }

        return images.slice(0, 10); // Limit to 10 images
    }

    /**
     * Extract seller information
     */
    private extractSellerInfo(doc: Document, source: ScrapingSource): SellerInfo | undefined {
        if (!source.selectors?.seller) return undefined;

        const sellerElement = doc.querySelector(source.selectors.seller);
        if (!sellerElement?.textContent) return undefined;

        return {
            name: this.cleanText(sellerElement.textContent),
            verified: false // Default, could be enhanced with verification detection
        };
    }

    /**
     * Extract review information
     */
    private extractReviewInfo(doc: Document, source: ScrapingSource): ReviewInfo | undefined {
        if (!source.selectors?.rating && !source.selectors?.reviews) return undefined;

        const reviewInfo: Partial<ReviewInfo> = {};

        // Extract rating
        if (source.selectors?.rating) {
            const ratingElement = doc.querySelector(source.selectors.rating);
            if (ratingElement?.textContent) {
                const ratingMatch = ratingElement.textContent.match(/(\d+\.?\d*)/);
                if (ratingMatch) {
                    reviewInfo.averageRating = parseFloat(ratingMatch[1]);
                }
            }
        }

        // Extract review count
        if (source.selectors?.reviews) {
            const reviewElements = doc.querySelectorAll(source.selectors.reviews);
            reviewInfo.totalReviews = reviewElements.length;
        }

        return reviewInfo.averageRating !== undefined || reviewInfo.totalReviews !== undefined
            ? reviewInfo as ReviewInfo
            : undefined;
    }

    /**
     * Extract metadata
     */
    private extractMetadata(
        doc: Document,
        source: ScrapingSource,
        firecrawlMetadata?: any,
        markdown?: string
    ): ProductMetadata {
        const metadata: ProductMetadata = {
            category: this.detectCategory(doc, source, markdown),
            tags: this.extractTags(doc, markdown),
            language: firecrawlMetadata?.language || 'en'
        };

        // Add SEO data if available
        if (firecrawlMetadata) {
            metadata.seoData = {
                metaTitle: firecrawlMetadata.title,
                metaDescription: firecrawlMetadata.description,
                ogImage: firecrawlMetadata.ogImage
            };
        }

        return metadata;
    }

    /**
     * Detect product category
     */
    private detectCategory(doc: Document, source: ScrapingSource, markdown?: string): string {
        // Use source categories as hints
        const sourceCategories = source.categories;

        // Look for category indicators in content
        const content = (doc.textContent || '') + (markdown || '');
        const lowerContent = content.toLowerCase();

        const categoryKeywords = {
            'template': ['template', 'design', 'layout'],
            'course': ['course', 'tutorial', 'lesson', 'learn'],
            'ebook': ['ebook', 'book', 'pdf', 'guide'],
            'software': ['software', 'app', 'tool', 'program'],
            'graphics': ['graphic', 'image', 'vector', 'illustration'],
            'font': ['font', 'typeface', 'typography'],
            'music': ['music', 'audio', 'sound', 'track'],
            'video': ['video', 'movie', 'film', 'animation']
        };

        for (const [category, keywords] of Object.entries(categoryKeywords)) {
            if (keywords.some(keyword => lowerContent.includes(keyword))) {
                return category;
            }
        }

        return sourceCategories[0] || 'digital-product';
    }

    /**
     * Extract tags from content
     */
    private extractTags(doc: Document, markdown?: string): string[] {
        const tags: string[] = [];
        const content = (doc.textContent || '') + (markdown || '');

        // Look for hashtags
        const hashtagMatches = content.match(/#[\w]+/g);
        if (hashtagMatches) {
            tags.push(...hashtagMatches.map(tag => tag.slice(1)));
        }

        // Extract common keywords
        const words = content.toLowerCase().match(/\b\w{3,}\b/g) || [];
        const wordFreq = new Map<string, number>();

        words.forEach(word => {
            if (word.length > 3 && !this.isStopWord(word)) {
                wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
            }
        });

        // Get most frequent words as tags
        const sortedWords = Array.from(wordFreq.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word]) => word);

        tags.push(...sortedWords);

        return [...new Set(tags)].slice(0, 15); // Remove duplicates and limit
    }

    /**
     * Utility methods
     */
    private cleanText(text: string): string {
        return text
            .replace(/\s+/g, ' ')
            .replace(/[^\w\s\-.,!?()]/g, '')
            .trim();
    }

    private resolveUrl(url: string, baseUrl: string): string {
        try {
            return new URL(url, baseUrl).href;
        } catch {
            return url.startsWith('http') ? url : '';
        }
    }

    private extractTextContent(doc: Document): string {
        return doc.textContent?.replace(/\s+/g, ' ').trim() || '';
    }

    private isStopWord(word: string): boolean {
        const stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
            'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
            'this', 'that', 'these', 'those', 'you', 'your', 'our', 'we', 'they'
        ]);
        return stopWords.has(word);
    }

    private fallbackTitleExtraction(markdown?: string, metadata?: any): string {
        if (metadata?.title) return metadata.title;
        if (markdown) {
            const firstLine = markdown.split('\n')[0];
            if (firstLine.startsWith('#')) {
                return firstLine.replace(/^#+\s*/, '');
            }
        }
        return 'Untitled Product';
    }

    private fallbackDescriptionExtraction(markdown?: string): string {
        if (!markdown) return 'No description available';

        const lines = markdown.split('\n').filter(line =>
            line.trim() &&
            !line.startsWith('#') &&
            line.length > 20
        );

        return lines.slice(0, 3).join('\n') || 'No description available';
    }

    private createBasicMetadata(url: string, source: ScrapingSource): ProductMetadata {
        return {
            category: source.categories[0] || 'digital-product',
            tags: [],
            language: 'en'
        };
    }
}