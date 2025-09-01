import { ScrapingSource } from './types';

// Curated scraping sources for digital products
export const SCRAPING_SOURCES: Record<string, ScrapingSource> = {
    // Creative & Design Marketplaces
    etsy: {
        name: 'Etsy',
        domain: 'etsy.com',
        categories: ['digital-downloads', 'printables', 'templates', 'graphics'],
        endpoints: ['shop', 'listing', 'search'],
        rateLimit: 100, // requests per hour
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '[data-test-id="listing-page-title"], h1',
            price: '.currency-value, .notranslate',
            description: '[data-test-id="listing-page-description"], .shop2-listing-description',
            images: '.listing-page-image img, .carousel-image img',
            seller: '.shop2-shop-info-name, .shop-name',
            features: '.listing-page-overview-component li',
            reviews: '.shop2-review-review',
            rating: '.stars-svg'
        }
    },

    gumroad: {
        name: 'Gumroad',
        domain: 'gumroad.com',
        categories: ['software', 'ebooks', 'courses', 'templates', 'digital-art'],
        endpoints: ['product', 'discover'],
        rateLimit: 200,
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '.product-title, h1.title',
            price: '.price, .product-price',
            description: '.product-description, .description',
            images: '.product-images img, .gallery img',
            seller: '.creator-name, .profile-name',
            features: '.product-features li, .feature-list li'
        }
    },

    creativeMarket: {
        name: 'Creative Market',
        domain: 'creativemarket.com',
        categories: ['templates', 'graphics', 'fonts', 'photos'],
        endpoints: ['product', 'shop', 'category'],
        rateLimit: 50,
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '.product-title, h1',
            price: '.price, .product-price',
            description: '.product-description',
            images: '.product-gallery img',
            seller: '.shop-name, .designer-name'
        }
    },

    // Educational Platforms
    udemy: {
        name: 'Udemy',
        domain: 'udemy.com',
        categories: ['courses', 'tutorials'],
        endpoints: ['course', 'search', 'instructor'],
        rateLimit: 100,
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '[data-purpose="course-title"], h1',
            price: '.price-text, .course-price',
            description: '[data-purpose="course-description"]',
            images: '.course-image img',
            seller: '.instructor-name',
            rating: '.rating-number'
        }
    },

    skillshare: {
        name: 'Skillshare',
        domain: 'skillshare.com',
        categories: ['classes', 'workshops'],
        endpoints: ['class', 'teacher', 'browse'],
        rateLimit: 75,
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '.class-title, h1',
            description: '.class-description',
            images: '.class-image img',
            seller: '.teacher-name'
        }
    },

    // SaaS & Tools
    productHunt: {
        name: 'Product Hunt',
        domain: 'producthunt.com',
        categories: ['apps', 'tools', 'productivity'],
        endpoints: ['posts', 'products', 'makers'],
        rateLimit: 500,
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '.product-name, h1',
            description: '.product-description',
            images: '.product-gallery img',
            seller: '.maker-name'
        }
    },

    // Content & Media
    shutterstock: {
        name: 'Shutterstock',
        domain: 'shutterstock.com',
        categories: ['images', 'vectors', 'templates'],
        endpoints: ['search', 'image', 'contributor'],
        rateLimit: 1000,
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '.asset-title, h1',
            description: '.asset-description',
            images: '.asset-image img',
            seller: '.contributor-name'
        }
    },

    // E-commerce Templates
    shopify: {
        name: 'Shopify',
        domain: 'themes.shopify.com',
        categories: ['themes', 'apps'],
        endpoints: ['themes', 'apps', 'partners'],
        rateLimit: 40,
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '.theme-name, h1',
            price: '.theme-price',
            description: '.theme-description',
            images: '.theme-preview img',
            seller: '.theme-author'
        }
    },

    // Freelance Platforms
    fiverr: {
        name: 'Fiverr',
        domain: 'fiverr.com',
        categories: ['gigs', 'services', 'digital-products'],
        endpoints: ['gigs', 'sellers', 'categories'],
        rateLimit: 150,
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '.gig-title, h1',
            price: '.gig-price, .price',
            description: '.gig-description',
            images: '.gig-gallery img',
            seller: '.seller-name',
            rating: '.gig-rating'
        }
    },

    upwork: {
        name: 'Upwork',
        domain: 'upwork.com',
        categories: ['services', 'talent', 'projects'],
        endpoints: ['jobs', 'freelancers', 'agencies'],
        rateLimit: 100,
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '.job-title, h1',
            description: '.job-description',
            seller: '.freelancer-name'
        }
    },

    // Ad Intelligence & Market Research
    facebookAdsLibrary: {
        name: 'Facebook Ads Library',
        domain: 'facebook.com',
        categories: ['ads', 'marketing-intelligence', 'digital-products'],
        endpoints: ['ads/library'],
        rateLimit: 200, // Facebook has API limits
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '[data-testid="ad-title"], .ad-creative-title',
            description: '[data-testid="ad-body"], .ad-creative-body',
            images: '.ad-creative-image img, [data-testid="ad-image"]',
            seller: '.advertiser-name, [data-testid="advertiser-name"]',
            features: '.ad-creative-text li'
        }
    },

    // SaaS & Software Intelligence
    whop: {
        name: 'Whop',
        domain: 'whop.com',
        categories: ['saas', 'software', 'digital-products', 'communities'],
        endpoints: ['explore', 'products', 'creators'],
        rateLimit: 120,
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '.product-title, h1',
            price: '.price, .product-price',
            description: '.product-description',
            images: '.product-image img',
            seller: '.creator-name',
            features: '.feature-list li'
        }
    },

    saasLibrary: {
        name: 'SaaS Library',
        domain: 'saaslibrary.com',
        categories: ['saas', 'software', 'tools'],
        endpoints: ['tools', 'categories', 'trending'],
        rateLimit: 100,
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '.tool-title, h1',
            description: '.tool-description',
            images: '.tool-screenshot img',
            features: '.features li'
        }
    },

    betalist: {
        name: 'BetaList',
        domain: 'betalist.com',
        categories: ['startups', 'saas', 'beta-products'],
        endpoints: ['startups', 'categories'],
        rateLimit: 80,
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '.startup-name, h1',
            description: '.startup-description',
            images: '.startup-image img'
        }
    },

    // Product Discovery & Analytics
    similarweb: {
        name: 'SimilarWeb',
        domain: 'similarweb.com',
        categories: ['analytics', 'market-intelligence', 'saas'],
        endpoints: ['website', 'top-websites', 'trending'],
        rateLimit: 50, // Lower due to data sensitivity
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '.website-title, h1',
            description: '.website-description'
        }
    },

    builtwith: {
        name: 'BuiltWith',
        domain: 'builtwith.com',
        categories: ['technology', 'saas', 'tools'],
        endpoints: ['trends', 'technologies', 'websites'],
        rateLimit: 60,
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '.technology-name, h1',
            description: '.technology-description'
        }
    },

    // Indie Maker & Startup Communities
    indiehackers: {
        name: 'Indie Hackers',
        domain: 'indiehackers.com',
        categories: ['startups', 'saas', 'indie-products'],
        endpoints: ['products', 'interviews', 'milestones'],
        rateLimit: 100,
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '.product-name, h1',
            description: '.product-description',
            seller: '.founder-name'
        }
    },

    makerlog: {
        name: 'Makerlog',
        domain: 'getmakerlog.com',
        categories: ['products', 'makers', 'saas'],
        endpoints: ['products', 'makers', 'trending'],
        rateLimit: 120,
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '.product-title, h1',
            description: '.product-description',
            seller: '.maker-name'
        }
    },

    // App Stores & Marketplaces
    chromeWebStore: {
        name: 'Chrome Web Store',
        domain: 'chrome.google.com',
        categories: ['extensions', 'apps', 'productivity'],
        endpoints: ['webstore/category', 'webstore/detail'],
        rateLimit: 200,
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '.e-f-w, h1',
            description: '.C-b-p-j-Pb',
            rating: '.rsw-stars'
        }
    },

    microsoftAppSource: {
        name: 'Microsoft AppSource',
        domain: 'appsource.microsoft.com',
        categories: ['business-apps', 'saas', 'productivity'],
        endpoints: ['marketplace', 'product'],
        rateLimit: 100,
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '.product-title, h1',
            description: '.product-description',
            seller: '.publisher-name'
        }
    },

    // Design & Development Tools
    figmaCommunity: {
        name: 'Figma Community',
        domain: 'figma.com',
        categories: ['design', 'templates', 'ui-kits'],
        endpoints: ['community', 'file'],
        rateLimit: 150,
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '.file_title, h1',
            description: '.file_description',
            seller: '.profile_name'
        }
    },

    dribbble: {
        name: 'Dribbble',
        domain: 'dribbble.com',
        categories: ['design', 'templates', 'graphics'],
        endpoints: ['shots', 'designers', 'marketplace'],
        rateLimit: 100,
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '.shot-title, h1',
            description: '.shot-description',
            seller: '.display-name'
        }
    },

    // Code & Development
    github: {
        name: 'GitHub',
        domain: 'github.com',
        categories: ['code', 'tools', 'open-source'],
        endpoints: ['trending', 'explore', 'marketplace'],
        rateLimit: 5000, // GitHub has generous API limits
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '.js-repo-name, h1',
            description: '.repository-content .f4',
            seller: '.author'
        }
    },

    // Analytics & Intelligence Platforms
    semrush: {
        name: 'SEMrush',
        domain: 'semrush.com',
        categories: ['seo-tools', 'marketing', 'analytics'],
        endpoints: ['analytics', 'keyword-magic-tool'],
        rateLimit: 30, // Conservative due to premium nature
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '.tool-title, h1',
            description: '.tool-description'
        }
    },

    ahrefs: {
        name: 'Ahrefs',
        domain: 'ahrefs.com',
        categories: ['seo-tools', 'marketing', 'analytics'],
        endpoints: ['blog', 'tools'],
        rateLimit: 30,
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '.post-title, h1',
            description: '.post-excerpt'
        }
    },

    // E-learning & Course Platforms
    teachable: {
        name: 'Teachable',
        domain: 'teachable.com',
        categories: ['courses', 'education', 'digital-products'],
        endpoints: ['courses', 'schools'],
        rateLimit: 100,
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '.course-title, h1',
            price: '.course-price',
            description: '.course-description',
            seller: '.instructor-name'
        }
    },

    thinkific: {
        name: 'Thinkific',
        domain: 'thinkific.com',
        categories: ['courses', 'education'],
        endpoints: ['courses', 'marketplace'],
        rateLimit: 100,
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '.course-title, h1',
            description: '.course-description',
            seller: '.instructor-name'
        }
    },

    // Subscription & Membership Platforms
    patreon: {
        name: 'Patreon',
        domain: 'patreon.com',
        categories: ['subscriptions', 'content', 'creators'],
        endpoints: ['explore', 'creators'],
        rateLimit: 80,
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '.creator-name, h1',
            description: '.creator-description'
        }
    },

    substack: {
        name: 'Substack',
        domain: 'substack.com',
        categories: ['newsletters', 'content', 'subscriptions'],
        endpoints: ['discover', 'publication'],
        rateLimit: 120,
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '.publication-name, h1',
            description: '.publication-description'
        }
    },

    // Affiliate & Marketing Networks
    clickbank: {
        name: 'ClickBank',
        domain: 'clickbank.com',
        categories: ['affiliate-products', 'digital-products', 'marketing'],
        endpoints: ['marketplace', 'categories'],
        rateLimit: 60,
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '.product-title, h1',
            description: '.product-description',
            price: '.product-price'
        }
    },

    // Trending & Discovery Platforms
    trendhunter: {
        name: 'Trend Hunter',
        domain: 'trendhunter.com',
        categories: ['trends', 'innovation', 'products'],
        endpoints: ['trends', 'innovation'],
        rateLimit: 100,
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '.trend-title, h1',
            description: '.trend-description'
        }
    },

    // API & Developer Tools
    rapidapi: {
        name: 'RapidAPI',
        domain: 'rapidapi.com',
        categories: ['apis', 'developer-tools', 'saas'],
        endpoints: ['hub', 'api'],
        rateLimit: 200,
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '.api-title, h1',
            description: '.api-description',
            seller: '.provider-name'
        }
    },

    // Social Media Intelligence
    socialBlade: {
        name: 'Social Blade',
        domain: 'socialblade.com',
        categories: ['social-media', 'analytics', 'creators'],
        endpoints: ['youtube', 'twitch', 'instagram'],
        rateLimit: 100,
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '.YouTubeUserTopInfo h1, h1',
            description: '.YouTubeUserTopInfo p'
        }
    },

    // Marketplace Intelligence
    jungle_scout: {
        name: 'Jungle Scout',
        domain: 'junglescout.com',
        categories: ['amazon', 'ecommerce', 'product-research'],
        endpoints: ['product-database', 'keyword-scout'],
        rateLimit: 50,
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '.product-title, h1',
            description: '.product-description'
        }
    },

    helium10: {
        name: 'Helium 10',
        domain: 'helium10.com',
        categories: ['amazon', 'ecommerce', 'product-research'],
        endpoints: ['tools', 'black-box'],
        rateLimit: 50,
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '.tool-title, h1',
            description: '.tool-description'
        }
    },

    // Crypto & Web3 Platforms
    opensea: {
        name: 'OpenSea',
        domain: 'opensea.io',
        categories: ['nft', 'crypto', 'digital-collectibles'],
        endpoints: ['collection', 'assets'],
        rateLimit: 100,
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '.collection-name, h1',
            description: '.collection-description',
            seller: '.creator-name'
        }
    },

    // Business Intelligence
    crunchbase: {
        name: 'Crunchbase',
        domain: 'crunchbase.com',
        categories: ['startups', 'funding', 'business-intelligence'],
        endpoints: ['organization', 'search'],
        rateLimit: 40,
        respectRobots: true,
        useFirecrawl: true,
        selectors: {
            title: '.profile-name, h1',
            description: '.description-content'
        }
    }
};

// Source categories for easier filtering
export const SOURCE_CATEGORIES = {
    CREATIVE: ['etsy', 'creativeMarket', 'shutterstock', 'dribbble', 'figmaCommunity'],
    EDUCATIONAL: ['udemy', 'skillshare', 'teachable', 'thinkific'],
    SAAS: ['productHunt', 'whop', 'saasLibrary', 'betalist', 'microsoftAppSource'],
    ECOMMERCE: ['shopify', 'jungle_scout', 'helium10'],
    FREELANCE: ['fiverr', 'upwork'],
    SOFTWARE: ['gumroad', 'productHunt', 'github', 'rapidapi'],
    INTELLIGENCE: ['facebookAdsLibrary', 'similarweb', 'builtwith', 'semrush', 'ahrefs', 'socialBlade', 'crunchbase'],
    INDIE_MAKERS: ['indiehackers', 'makerlog', 'betalist'],
    CONTENT_CREATORS: ['patreon', 'substack', 'socialBlade'],
    MARKETPLACES: ['chromeWebStore', 'opensea', 'clickbank'],
    TRENDS: ['trendhunter', 'productHunt'],
    ALL: Object.keys(SCRAPING_SOURCES)
};

// Get source by domain
export function getSourceByDomain(url: string): ScrapingSource | null {
    try {
        const domain = new URL(url).hostname.replace('www.', '');

        for (const source of Object.values(SCRAPING_SOURCES)) {
            if (domain.includes(source.domain) || source.domain.includes(domain)) {
                return source;
            }
        }

        return null;
    } catch {
        return null;
    }
}

// Get sources by category
export function getSourcesByCategory(category: keyof typeof SOURCE_CATEGORIES): ScrapingSource[] {
    const sourceNames = SOURCE_CATEGORIES[category] || [];
    return sourceNames.map(name => SCRAPING_SOURCES[name]).filter(Boolean);
}

// Check if URL is supported
export function isSupportedUrl(url: string): boolean {
    return getSourceByDomain(url) !== null;
}

// Get rate limit for source
export function getRateLimit(source: string): number {
    return SCRAPING_SOURCES[source]?.rateLimit || 60; // Default 60 requests per hour
}

// Get sources for winning product research
export function getWinningProductSources(): ScrapingSource[] {
    const winningProductSourceNames = [
        'facebookAdsLibrary', 'whop', 'productHunt', 'indiehackers',
        'trendhunter', 'similarweb', 'socialBlade', 'jungle_scout', 'helium10'
    ];
    return winningProductSourceNames.map(name => SCRAPING_SOURCES[name]).filter(Boolean);
}

// Get sources for SaaS intelligence
export function getSaaSIntelligenceSources(): ScrapingSource[] {
    const saasSourceNames = [
        'whop', 'saasLibrary', 'betalist', 'productHunt', 'indiehackers',
        'makerlog', 'microsoftAppSource', 'chromeWebStore', 'rapidapi'
    ];
    return saasSourceNames.map(name => SCRAPING_SOURCES[name]).filter(Boolean);
}

// Get sources for ad intelligence
export function getAdIntelligenceSources(): ScrapingSource[] {
    const adIntelSourceNames = [
        'facebookAdsLibrary', 'semrush', 'ahrefs', 'similarweb', 'socialBlade'
    ];
    return adIntelSourceNames.map(name => SCRAPING_SOURCES[name]).filter(Boolean);
}

// Get sources for trending products
export function getTrendingSources(): ScrapingSource[] {
    const trendingSourceNames = [
        'productHunt', 'trendhunter', 'betalist', 'indiehackers', 'github',
        'dribbble', 'figmaCommunity', 'opensea'
    ];
    return trendingSourceNames.map(name => SCRAPING_SOURCES[name]).filter(Boolean);
}

// Get high-volume sources (good for bulk analysis)
export function getHighVolumeSources(): ScrapingSource[] {
    return Object.values(SCRAPING_SOURCES).filter(source => source.rateLimit >= 200);
}

// Get premium/intelligence sources (lower rate limits, higher value data)
export function getPremiumSources(): ScrapingSource[] {
    return Object.values(SCRAPING_SOURCES).filter(source => source.rateLimit <= 60);
}

// Check if source is good for Facebook ads analysis
export function isAdIntelligenceSource(sourceName: string): boolean {
    const adIntelSources = ['facebookAdsLibrary', 'semrush', 'ahrefs', 'similarweb'];
    return adIntelSources.includes(sourceName);
}

// Check if source is good for SaaS product discovery
export function isSaaSSource(sourceName: string): boolean {
    const saasSources = ['whop', 'saasLibrary', 'betalist', 'productHunt', 'indiehackers', 'microsoftAppSource'];
    return saasSources.includes(sourceName);
}

// Get recommended sources for specific use cases
export function getRecommendedSources(useCase: 'winning-products' | 'saas-intelligence' | 'ad-analysis' | 'trending'): ScrapingSource[] {
    switch (useCase) {
        case 'winning-products':
            return getWinningProductSources();
        case 'saas-intelligence':
            return getSaaSIntelligenceSources();
        case 'ad-analysis':
            return getAdIntelligenceSources();
        case 'trending':
            return getTrendingSources();
        default:
            return Object.values(SCRAPING_SOURCES);
    }
}