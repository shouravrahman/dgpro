import { AIModel } from '../types';

export class ModelRegistry {
    private static instance: ModelRegistry;
    private models: Map<string, AIModel> = new Map();

    private constructor() {
        this.initializeModels();
    }

    public static getInstance(): ModelRegistry {
        if (!ModelRegistry.instance) {
            ModelRegistry.instance = new ModelRegistry();
        }
        return ModelRegistry.instance;
    }

    private initializeModels(): void {
        // Gemini Models
        this.registerModel({
            name: 'gemini-1.5-pro',
            provider: 'gemini',
            version: '1.5',
            maxTokens: 2097152,
            costPerToken: 0.00000125,
            capabilities: ['text', 'vision', 'code', 'reasoning', 'function-calling']
        });

        this.registerModel({
            name: 'gemini-1.5-flash',
            provider: 'gemini',
            version: '1.5',
            maxTokens: 1048576,
            costPerToken: 0.000000075,
            capabilities: ['text', 'vision', 'code', 'fast-inference']
        });

        this.registerModel({
            name: 'gemini-1.0-pro',
            provider: 'gemini',
            version: '1.0',
            maxTokens: 32768,
            costPerToken: 0.0000005,
            capabilities: ['text', 'code', 'basic-reasoning']
        });

        // OpenAI Models (for fallback)
        this.registerModel({
            name: 'gpt-4-turbo',
            provider: 'openai',
            version: '4',
            maxTokens: 128000,
            costPerToken: 0.00001,
            capabilities: ['text', 'vision', 'code', 'reasoning', 'function-calling']
        });

        this.registerModel({
            name: 'gpt-3.5-turbo',
            provider: 'openai',
            version: '3.5',
            maxTokens: 16385,
            costPerToken: 0.0000015,
            capabilities: ['text', 'code', 'fast-inference']
        });
    }

    public registerModel(model: AIModel): void {
        this.models.set(model.name, model);
    }

    public getModel(name: string): AIModel | undefined {
        return this.models.get(name);
    }

    public getAllModels(): AIModel[] {
        return Array.from(this.models.values());
    }

    public getModelsByProvider(provider: string): AIModel[] {
        return Array.from(this.models.values()).filter(
            model => model.provider === provider
        );
    }

    public getModelsByCapability(capability: string): AIModel[] {
        return Array.from(this.models.values()).filter(
            model => model.capabilities.includes(capability)
        );
    }

    public getBestModelForTask(
        capabilities: string[],
        maxCost?: number,
        preferredProvider?: string
    ): AIModel | null {
        let candidates = Array.from(this.models.values()).filter(model =>
            capabilities.every(cap => model.capabilities.includes(cap))
        );

        if (maxCost) {
            candidates = candidates.filter(model => model.costPerToken <= maxCost);
        }

        if (preferredProvider) {
            const preferredCandidates = candidates.filter(
                model => model.provider === preferredProvider
            );
            if (preferredCandidates.length > 0) {
                candidates = preferredCandidates;
            }
        }

        if (candidates.length === 0) return null;

        // Sort by cost efficiency (lower cost per token is better)
        candidates.sort((a, b) => a.costPerToken - b.costPerToken);

        return candidates[0];
    }

    public validateModel(name: string): boolean {
        return this.models.has(name);
    }
}