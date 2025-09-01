import { EnhancedBaseAgent } from '../enhanced-base-agent';
import type { AgentRequest, AgentResponse } from '../types';

export interface VoiceToProductRequest extends AgentRequest {
    audioFile?: File;
    audioUrl?: string;
    audioBase64?: string;
    language?: string;
    context?: string;
}

export interface TranscriptionResult {
    text: string;
    confidence: number;
    language: string;
    duration: number;
    segments?: Array<{
        start: number;
        end: number;
        text: string;
        confidence: number;
    }>;
}

export interface VoiceProductIdea {
    title: string;
    description: string;
    category: string;
    features: string[];
    targetAudience: string;
    monetizationStrategy: string;
    technicalRequirements: string[];
    marketingAngles: string[];
    confidence: number;
}

export interface VoiceToProductResult extends AgentResponse {
    transcription: TranscriptionResult;
    productIdeas: VoiceProductIdea[];
    recommendations: string[];
    nextSteps: string[];
}

export class VoiceAgent extends EnhancedBaseAgent {
    constructor(config: Parameters<typeof EnhancedBaseAgent>[0]) {
        super({
            ...config,
            id: 'voice-agent',
            name: 'Voice to Product Agent',
            description: 'Converts voice input to product ideas using AI transcription and analysis'
        });
    }

    async processVoiceToProduct(request: VoiceToProductRequest): Promise<VoiceToProductResult> {
        try {
            this.logger.info('Starting voice-to-product processing', {
                hasAudioFile: !!request.audioFile,
                hasAudioUrl: !!request.audioUrl,
                language: request.language
            });

            // Step 1: Transcribe audio
            const transcription = await this.transcribeAudio(request);

            // Step 2: Analyze transcription for product ideas
            const productIdeas = await this.extractProductIdeas(transcription, request.context);

            // Step 3: Generate recommendations
            const recommendations = await this.generateRecommendations(productIdeas, transcription);

            // Step 4: Suggest next steps
            const nextSteps = await this.generateNextSteps(productIdeas);

            const result: VoiceToProductResult = {
                success: true,
                data: {
                    transcription,
                    productIdeas,
                    recommendations,
                    nextSteps
                },
                transcription,
                productIdeas,
                recommendations,
                nextSteps,
                metadata: {
                    processingTime: Date.now() - (request.metadata?.startTime || Date.now()),
                    model: this.config.primaryModel,
                    confidence: this.calculateOverallConfidence(productIdeas)
                }
            };

            this.logger.info('Voice-to-product processing completed', {
                ideasGenerated: productIdeas.length,
                averageConfidence: result.metadata.confidence
            });

            return result;

        } catch (error) {
            this.logger.error('Voice-to-product processing failed', error);
            throw error;
        }
    }

    private async transcribeAudio(request: VoiceToProductRequest): Promise<TranscriptionResult> {
        try {
            let audioData: string;

            // Handle different audio input formats
            if (request.audioFile) {
                audioData = await this.fileToBase64(request.audioFile);
            } else if (request.audioBase64) {
                audioData = request.audioBase64;
            } else if (request.audioUrl) {
                audioData = await this.urlToBase64(request.audioUrl);
            } else {
                throw new Error('No audio input provided');
            }

            // Use Gemini's audio processing capabilities
            const prompt = `
        Transcribe the following audio content accurately. 
        Provide the transcription along with confidence scores and timing information if available.
        Language hint: ${request.language || 'auto-detect'}
        
        Focus on:
        - Accurate transcription of spoken words
        - Identifying key concepts and ideas
        - Detecting emotional tone and emphasis
        - Noting any technical terms or specific vocabulary
      `;

            const response = await this.executeWithModel({
                prompt,
                audioData,
                temperature: 0.1, // Low temperature for accuracy
                maxTokens: 2048
            });

            // Parse the response to extract transcription details
            const transcriptionText = this.extractTranscriptionFromResponse(response);

            return {
                text: transcriptionText,
                confidence: 0.85, // Default confidence - would be provided by actual transcription service
                language: request.language || 'en',
                duration: 0, // Would be calculated from actual audio
                segments: [] // Would be provided by actual transcription service
            };

        } catch (error) {
            this.logger.error('Audio transcription failed', error);
            throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async extractProductIdeas(transcription: TranscriptionResult, context?: string): Promise<VoiceProductIdea[]> {
        const prompt = `
      Analyze the following transcribed voice input and extract potential digital product ideas.
      
      Transcription: "${transcription.text}"
      ${context ? `Additional Context: ${context}` : ''}
      
      For each product idea identified, provide:
      1. A clear, marketable title
      2. Detailed description
      3. Most suitable category
      4. Key features and functionality
      5. Target audience
      6. Monetization strategy
      7. Technical requirements
      8. Marketing angles
      9. Confidence score (0-1)
      
      Focus on:
      - Identifying explicit product mentions
      - Inferring implicit product opportunities from problems mentioned
      - Considering market viability and demand
      - Ensuring ideas are actionable and specific
      
      Return the analysis as a JSON array of product ideas.
    `;

        try {
            const response = await this.executeWithModel({
                prompt,
                temperature: 0.7,
                maxTokens: 3000
            });

            return this.parseProductIdeasFromResponse(response);

        } catch (error) {
            this.logger.error('Product idea extraction failed', error);
            return [];
        }
    }

    private async generateRecommendations(productIdeas: VoiceProductIdea[], transcription: TranscriptionResult): Promise<string[]> {
        const prompt = `
      Based on the following product ideas extracted from voice input, provide strategic recommendations:
      
      Product Ideas: ${JSON.stringify(productIdeas, null, 2)}
      Original Transcription: "${transcription.text}"
      
      Provide recommendations for:
      1. Which ideas have the highest market potential
      2. How to validate these ideas quickly
      3. What additional research is needed
      4. Potential combinations or variations
      5. Market timing considerations
      6. Resource requirements and priorities
      
      Return as an array of actionable recommendation strings.
    `;

        try {
            const response = await this.executeWithModel({
                prompt,
                temperature: 0.6,
                maxTokens: 1500
            });

            return this.parseRecommendationsFromResponse(response);

        } catch (error) {
            this.logger.error('Recommendation generation failed', error);
            return ['Consider validating your ideas through market research', 'Start with the highest confidence product idea'];
        }
    }

    private async generateNextSteps(productIdeas: VoiceProductIdea[]): Promise<string[]> {
        const topIdea = productIdeas.sort((a, b) => b.confidence - a.confidence)[0];

        if (!topIdea) {
            return ['Record a more detailed voice description of your product idea'];
        }

        return [
            `Create a detailed specification for "${topIdea.title}"`,
            'Conduct market research on similar products',
            'Identify potential competitors and their pricing',
            'Create a minimum viable product (MVP) plan',
            'Develop a go-to-market strategy',
            'Consider creating a prototype or mockup'
        ];
    }

    private async fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                resolve(result.split(',')[1]); // Remove data URL prefix
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    private async urlToBase64(url: string): Promise<string> {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const file = new File([blob], 'audio', { type: blob.type });
            return this.fileToBase64(file);
        } catch (error) {
            throw new Error(`Failed to fetch audio from URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private extractTranscriptionFromResponse(response: string): string {
        // Parse the AI response to extract clean transcription
        // This would be more sophisticated in a real implementation
        try {
            const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[1]);
                return parsed.transcription || parsed.text || response;
            }
            return response.trim();
        } catch {
            return response.trim();
        }
    }

    private parseProductIdeasFromResponse(response: string): VoiceProductIdea[] {
        try {
            // Extract JSON from response
            const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) ||
                response.match(/\[[\s\S]*\]/);

            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0].replace(/```json|```/g, ''));
                return Array.isArray(parsed) ? parsed : [parsed];
            }

            // Fallback: create a basic product idea from the response
            return [{
                title: 'Voice-Generated Product Idea',
                description: response.substring(0, 200) + '...',
                category: 'Digital Product',
                features: ['AI-generated features'],
                targetAudience: 'General audience',
                monetizationStrategy: 'One-time purchase',
                technicalRequirements: ['Basic web development'],
                marketingAngles: ['Innovative solution'],
                confidence: 0.5
            }];

        } catch (error) {
            this.logger.error('Failed to parse product ideas', error);
            return [];
        }
    }

    private parseRecommendationsFromResponse(response: string): string[] {
        try {
            // Extract JSON array from response
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return Array.isArray(parsed) ? parsed : [];
            }

            // Fallback: split by lines and clean up
            return response
                .split('\n')
                .filter(line => line.trim().length > 0)
                .map(line => line.replace(/^\d+\.\s*/, '').trim())
                .filter(line => line.length > 10);

        } catch (error) {
            this.logger.error('Failed to parse recommendations', error);
            return [];
        }
    }

    private calculateOverallConfidence(productIdeas: VoiceProductIdea[]): number {
        if (productIdeas.length === 0) return 0;

        const totalConfidence = productIdeas.reduce((sum, idea) => sum + idea.confidence, 0);
        return totalConfidence / productIdeas.length;
    }

    private async executeWithModel(params: {
        prompt: string;
        audioData?: string;
        temperature?: number;
        maxTokens?: number;
    }): Promise<string> {
        // This would integrate with the actual AI model
        // For now, return a mock response
        return `Mock AI response for prompt: ${params.prompt.substring(0, 100)}...`;
    }
}