import { EnhancedBaseAgent } from '../enhanced-base-agent';
import type { AgentRequest, AgentResponse } from '../types';

export interface TranslationRequest extends AgentRequest {
    content: string | Record<string, any>;
    sourceLanguage?: string; // Auto-detect if not provided
    targetLanguages: string[];
    contentType?: 'text' | 'product-description' | 'marketing-copy' | 'ui-content' | 'technical-docs';
    preserveFormatting?: boolean;
    culturalAdaptation?: boolean;
    tone?: 'formal' | 'casual' | 'professional' | 'friendly' | 'persuasive';
    context?: string;
}

export interface TranslationResult {
    sourceLanguage: string;
    targetLanguage: string;
    originalContent: string;
    translatedContent: string;
    confidence: number;
    culturalNotes?: string[];
    alternativeTranslations?: Array<{
        text: string;
        confidence: number;
        context: string;
    }>;
    qualityScore: number;
}

export interface CulturalAdaptation {
    language: string;
    region: string;
    adaptations: Array<{
        original: string;
        adapted: string;
        reason: string;
        category: 'currency' | 'date-format' | 'cultural-reference' | 'color-meaning' | 'imagery' | 'tone';
    }>;
    marketingInsights: string[];
    localizedFeatures?: string[];
}

export interface MultiLanguageResult extends AgentResponse {
    translations: TranslationResult[];
    culturalAdaptations: CulturalAdaptation[];
    qualityAssessment: {
        overallScore: number;
        languageScores: Record<string, number>;
        recommendations: string[];
    };
    localizationSuggestions: Array<{
        language: string;
        suggestions: string[];
        priority: 'high' | 'medium' | 'low';
    }>;
}

export class TranslationAgent extends EnhancedBaseAgent {
    private readonly supportedLanguages = {
        'en': { name: 'English', region: 'US', rtl: false },
        'es': { name: 'Spanish', region: 'ES', rtl: false },
        'fr': { name: 'French', region: 'FR', rtl: false },
        'de': { name: 'German', region: 'DE', rtl: false },
        'it': { name: 'Italian', region: 'IT', rtl: false },
        'pt': { name: 'Portuguese', region: 'BR', rtl: false },
        'ru': { name: 'Russian', region: 'RU', rtl: false },
        'ja': { name: 'Japanese', region: 'JP', rtl: false },
        'ko': { name: 'Korean', region: 'KR', rtl: false },
        'zh': { name: 'Chinese', region: 'CN', rtl: false },
        'ar': { name: 'Arabic', region: 'SA', rtl: true },
        'hi': { name: 'Hindi', region: 'IN', rtl: false },
        'th': { name: 'Thai', region: 'TH', rtl: false },
        'vi': { name: 'Vietnamese', region: 'VN', rtl: false },
        'tr': { name: 'Turkish', region: 'TR', rtl: false },
        'pl': { name: 'Polish', region: 'PL', rtl: false },
        'nl': { name: 'Dutch', region: 'NL', rtl: false },
        'sv': { name: 'Swedish', region: 'SE', rtl: false },
        'da': { name: 'Danish', region: 'DK', rtl: false },
        'no': { name: 'Norwegian', region: 'NO', rtl: false }
    };

    constructor(config: Parameters<typeof EnhancedBaseAgent>[0]) {
        super({
            ...config,
            id: 'translation-agent',
            name: 'Multi-Language Translation Agent',
            description: 'Provides AI-powered translation and cultural adaptation services'
        });
    }

    async translateContent(request: TranslationRequest): Promise<MultiLanguageResult> {
        try {
            this.logger.info('Starting multi-language translation', {
                targetLanguages: request.targetLanguages,
                contentType: request.contentType,
                culturalAdaptation: request.culturalAdaptation
            });

            // Step 1: Detect source language if not provided
            const sourceLanguage = request.sourceLanguage || await this.detectLanguage(request.content);

            // Step 2: Validate target languages
            const validTargetLanguages = this.validateLanguages(request.targetLanguages);

            // Step 3: Perform translations
            const translations = await Promise.all(
                validTargetLanguages.map(targetLang =>
                    this.translateToLanguage(request, sourceLanguage, targetLang)
                )
            );

            // Step 4: Generate cultural adaptations if requested
            const culturalAdaptations = request.culturalAdaptation
                ? await Promise.all(
                    validTargetLanguages.map(targetLang =>
                        this.generateCulturalAdaptation(request, sourceLanguage, targetLang)
                    )
                )
                : [];

            // Step 5: Assess translation quality
            const qualityAssessment = await this.assessTranslationQuality(translations);

            // Step 6: Generate localization suggestions
            const localizationSuggestions = await this.generateLocalizationSuggestions(
                translations,
                request.contentType
            );

            const result: MultiLanguageResult = {
                success: true,
                data: {
                    translations,
                    culturalAdaptations,
                    qualityAssessment,
                    localizationSuggestions
                },
                translations,
                culturalAdaptations,
                qualityAssessment,
                localizationSuggestions,
                metadata: {
                    processingTime: Date.now() - (request.metadata?.startTime || Date.now()),
                    model: this.config.primaryModel,
                    languagesProcessed: validTargetLanguages.length,
                    sourceLanguage,
                    averageQuality: qualityAssessment.overallScore
                }
            };

            this.logger.info('Multi-language translation completed', {
                languagesProcessed: validTargetLanguages.length,
                averageQuality: qualityAssessment.overallScore
            });

            return result;

        } catch (error) {
            this.logger.error('Multi-language translation failed', error);
            throw error;
        }
    }

    private async detectLanguage(content: string | Record<string, any>): Promise<string> {
        const textContent = typeof content === 'string' ? content : JSON.stringify(content);

        const prompt = `
      Detect the language of the following content and return only the ISO 639-1 language code:
      
      Content: "${textContent.substring(0, 500)}"
      
      Return only the two-letter language code (e.g., 'en', 'es', 'fr').
    `;

        try {
            const response = await this.executeWithModel({
                prompt,
                temperature: 0.1,
                maxTokens: 10
            });

            const detectedLang = response.trim().toLowerCase();
            return this.supportedLanguages[detectedLang as keyof typeof this.supportedLanguages] ? detectedLang : 'en';

        } catch (error) {
            this.logger.error('Language detection failed', error);
            return 'en'; // Default to English
        }
    }

    private validateLanguages(languages: string[]): string[] {
        return languages.filter(lang => {
            const isSupported = this.supportedLanguages[lang as keyof typeof this.supportedLanguages];
            if (!isSupported) {
                this.logger.warn(`Unsupported language: ${lang}`);
            }
            return isSupported;
        });
    }

    private async translateToLanguage(
        request: TranslationRequest,
        sourceLanguage: string,
        targetLanguage: string
    ): Promise<TranslationResult> {
        const textContent = typeof request.content === 'string'
            ? request.content
            : JSON.stringify(request.content, null, 2);

        const sourceLangInfo = this.supportedLanguages[sourceLanguage as keyof typeof this.supportedLanguages];
        const targetLangInfo = this.supportedLanguages[targetLanguage as keyof typeof this.supportedLanguages];

        const prompt = `
      Translate the following content from ${sourceLangInfo.name} to ${targetLangInfo.name}.
      
      Content Type: ${request.contentType || 'general'}
      Tone: ${request.tone || 'neutral'}
      Preserve Formatting: ${request.preserveFormatting || false}
      Context: ${request.context || 'none'}
      
      Original Content:
      "${textContent}"
      
      Requirements:
      1. Maintain the original meaning and intent
      2. Adapt to the target language's natural flow
      3. Consider cultural nuances
      4. Preserve any technical terms appropriately
      5. Maintain the specified tone
      ${request.preserveFormatting ? '6. Preserve original formatting and structure' : ''}
      
      Provide:
      1. The translated content
      2. Confidence score (0-1)
      3. Any cultural notes or considerations
      4. Alternative translations for key phrases
      5. Quality assessment
      
      Return as JSON with the structure:
      {
        "translatedContent": "...",
        "confidence": 0.95,
        "culturalNotes": ["..."],
        "alternativeTranslations": [{"text": "...", "confidence": 0.9, "context": "..."}],
        "qualityScore": 0.92
      }
    `;

        try {
            const response = await this.executeWithModel({
                prompt,
                temperature: 0.3,
                maxTokens: Math.max(textContent.length * 2, 1000)
            });

            const parsed = this.parseTranslationResponse(response);

            return {
                sourceLanguage,
                targetLanguage,
                originalContent: textContent,
                translatedContent: parsed.translatedContent,
                confidence: parsed.confidence,
                culturalNotes: parsed.culturalNotes,
                alternativeTranslations: parsed.alternativeTranslations,
                qualityScore: parsed.qualityScore
            };

        } catch (error) {
            this.logger.error(`Translation to ${targetLanguage} failed`, error);

            // Return fallback translation
            return {
                sourceLanguage,
                targetLanguage,
                originalContent: textContent,
                translatedContent: `[Translation to ${targetLangInfo.name} failed]`,
                confidence: 0,
                qualityScore: 0
            };
        }
    }

    private async generateCulturalAdaptation(
        request: TranslationRequest,
        sourceLanguage: string,
        targetLanguage: string
    ): Promise<CulturalAdaptation> {
        const targetLangInfo = this.supportedLanguages[targetLanguage as keyof typeof this.supportedLanguages];

        const prompt = `
      Provide cultural adaptation recommendations for content targeting ${targetLangInfo.name} (${targetLangInfo.region}) market.
      
      Content Type: ${request.contentType}
      Original Language: ${sourceLanguage}
      Target Language: ${targetLanguage}
      
      Consider:
      1. Cultural references and idioms
      2. Color meanings and symbolism
      3. Currency and number formats
      4. Date and time formats
      5. Religious and cultural sensitivities
      6. Business practices and etiquette
      7. Marketing preferences
      8. Local regulations and compliance
      
      Provide specific adaptations needed and marketing insights for this market.
      
      Return as JSON with cultural adaptations and insights.
    `;

        try {
            const response = await this.executeWithModel({
                prompt,
                temperature: 0.6,
                maxTokens: 2000
            });

            return this.parseCulturalAdaptationResponse(response, targetLanguage, targetLangInfo.region);

        } catch (error) {
            this.logger.error(`Cultural adaptation for ${targetLanguage} failed`, error);

            return {
                language: targetLanguage,
                region: targetLangInfo.region,
                adaptations: [],
                marketingInsights: [`Consider local market preferences for ${targetLangInfo.name} audience`]
            };
        }
    }

    private async assessTranslationQuality(translations: TranslationResult[]): Promise<{
        overallScore: number;
        languageScores: Record<string, number>;
        recommendations: string[];
    }> {
        const languageScores: Record<string, number> = {};
        let totalScore = 0;

        translations.forEach(translation => {
            languageScores[translation.targetLanguage] = translation.qualityScore;
            totalScore += translation.qualityScore;
        });

        const overallScore = translations.length > 0 ? totalScore / translations.length : 0;

        const recommendations = [
            ...(overallScore < 0.7 ? ['Consider professional human review for critical content'] : []),
            ...(overallScore < 0.8 ? ['Test translations with native speakers'] : []),
            'Implement A/B testing for different translation variants',
            'Regular quality monitoring and updates recommended'
        ];

        return {
            overallScore,
            languageScores,
            recommendations
        };
    }

    private async generateLocalizationSuggestions(
        translations: TranslationResult[],
        contentType?: string
    ): Promise<Array<{
        language: string;
        suggestions: string[];
        priority: 'high' | 'medium' | 'low';
    }>> {
        return translations.map(translation => {
            const langInfo = this.supportedLanguages[translation.targetLanguage as keyof typeof this.supportedLanguages];
            const suggestions = [];
            let priority: 'high' | 'medium' | 'low' = 'medium';

            // RTL language considerations
            if (langInfo.rtl) {
                suggestions.push('Implement right-to-left (RTL) layout support');
                suggestions.push('Mirror UI elements and navigation');
                priority = 'high';
            }

            // Content-specific suggestions
            if (contentType === 'product-description') {
                suggestions.push('Adapt product features to local market needs');
                suggestions.push('Include region-specific compliance information');
            } else if (contentType === 'marketing-copy') {
                suggestions.push('Adapt marketing messages to local cultural values');
                suggestions.push('Use region-appropriate imagery and examples');
                priority = 'high';
            }

            // Quality-based suggestions
            if (translation.qualityScore < 0.8) {
                suggestions.push('Consider professional translation review');
                priority = 'high';
            }

            // General suggestions
            suggestions.push(`Test with native ${langInfo.name} speakers`);
            suggestions.push('Implement local customer support');

            return {
                language: translation.targetLanguage,
                suggestions,
                priority
            };
        });
    }

    private parseTranslationResponse(response: string): {
        translatedContent: string;
        confidence: number;
        culturalNotes?: string[];
        alternativeTranslations?: Array<{
            text: string;
            confidence: number;
            context: string;
        }>;
        qualityScore: number;
    } {
        try {
            const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) ||
                response.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0].replace(/```json|```/g, ''));
                return {
                    translatedContent: parsed.translatedContent || response,
                    confidence: parsed.confidence || 0.8,
                    culturalNotes: parsed.culturalNotes || [],
                    alternativeTranslations: parsed.alternativeTranslations || [],
                    qualityScore: parsed.qualityScore || 0.8
                };
            }

            return {
                translatedContent: response.trim(),
                confidence: 0.7,
                qualityScore: 0.7
            };

        } catch (error) {
            this.logger.error('Failed to parse translation response', error);
            return {
                translatedContent: response.trim(),
                confidence: 0.5,
                qualityScore: 0.5
            };
        }
    }

    private parseCulturalAdaptationResponse(response: string, language: string, region: string): CulturalAdaptation {
        try {
            const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) ||
                response.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0].replace(/```json|```/g, ''));
                return {
                    language,
                    region,
                    adaptations: parsed.adaptations || [],
                    marketingInsights: parsed.marketingInsights || [],
                    localizedFeatures: parsed.localizedFeatures
                };
            }

            return {
                language,
                region,
                adaptations: [],
                marketingInsights: [response.trim()]
            };

        } catch (error) {
            this.logger.error('Failed to parse cultural adaptation response', error);
            return {
                language,
                region,
                adaptations: [],
                marketingInsights: ['Cultural adaptation analysis needed']
            };
        }
    }

    private async executeWithModel(params: {
        prompt: string;
        temperature?: number;
        maxTokens?: number;
    }): Promise<string> {
        // This would integrate with the actual AI model
        return `Mock translation response for prompt: ${params.prompt.substring(0, 100)}...`;
    }

    // Utility methods for language support
    getSupportedLanguages(): typeof this.supportedLanguages {
        return this.supportedLanguages;
    }

    isLanguageSupported(languageCode: string): boolean {
        return languageCode in this.supportedLanguages;
    }

    getLanguageInfo(languageCode: string) {
        return this.supportedLanguages[languageCode as keyof typeof this.supportedLanguages];
    }

    getRTLLanguages(): string[] {
        return Object.entries(this.supportedLanguages)
            .filter(([_, info]) => info.rtl)
            .map(([code]) => code);
    }
}