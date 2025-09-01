'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useSubscription } from '@/hooks/useSubscription';
import {
  Sparkles,
  Wand2,
  FileText,
  Image,
  Type,
  Lightbulb,
  Target,
  Zap,
  Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIContentGeneratorProps {
  productType: 'pdf' | 'image' | 'text';
  productData: any;
  onGenerate: (prompt: string, options: any) => Promise<void>;
  isGenerating: boolean;
}

const CONTENT_TEMPLATES = {
  pdf: [
    {
      id: 'business-plan',
      title: 'Business Plan Template',
      description: 'Comprehensive business plan with financial projections',
      prompt:
        'Create a professional business plan template with sections for executive summary, market analysis, financial projections, and implementation timeline.',
      category: 'Business',
    },
    {
      id: 'workout-guide',
      title: 'Fitness Workout Guide',
      description: 'Structured workout routines with exercises and tips',
      prompt:
        'Design a comprehensive fitness guide with beginner to advanced workout routines, exercise descriptions, and nutrition tips.',
      category: 'Health',
    },
    {
      id: 'social-media-planner',
      title: 'Social Media Content Planner',
      description: 'Monthly content calendar and posting strategies',
      prompt:
        'Create a social media content planner with monthly calendars, content ideas, hashtag strategies, and engagement tips.',
      category: 'Marketing',
    },
  ],
  image: [
    {
      id: 'instagram-templates',
      title: 'Instagram Post Templates',
      description: 'Modern, engaging social media graphics',
      prompt:
        'Design a collection of Instagram post templates with modern layouts, trendy colors, and space for custom text and branding.',
      category: 'Social Media',
    },
    {
      id: 'logo-concepts',
      title: 'Logo Design Concepts',
      description: 'Professional logo variations and concepts',
      prompt:
        'Create multiple logo design concepts with different styles, typography, and color schemes for a modern brand.',
      category: 'Branding',
    },
    {
      id: 'presentation-slides',
      title: 'Presentation Slide Deck',
      description: 'Professional presentation templates',
      prompt:
        'Design a complete presentation slide deck with title slides, content layouts, charts, and conclusion templates.',
      category: 'Business',
    },
  ],
  text: [
    {
      id: 'blog-posts',
      title: 'Blog Post Collection',
      description: 'SEO-optimized articles on trending topics',
      prompt:
        'Write a collection of engaging blog posts with SEO optimization, compelling headlines, and actionable content.',
      category: 'Content',
    },
    {
      id: 'email-sequences',
      title: 'Email Marketing Sequences',
      description: 'Conversion-focused email campaigns',
      prompt:
        'Create a series of email marketing templates including welcome sequences, promotional campaigns, and nurture emails.',
      category: 'Marketing',
    },
    {
      id: 'social-captions',
      title: 'Social Media Captions',
      description: 'Engaging captions for various platforms',
      prompt:
        'Generate a collection of social media captions for different platforms, including hashtags and call-to-actions.',
      category: 'Social Media',
    },
  ],
};

const STYLE_OPTIONS = {
  pdf: ['Professional', 'Modern', 'Minimalist', 'Creative', 'Corporate'],
  image: ['Modern', 'Vintage', 'Minimalist', 'Bold', 'Elegant', 'Playful'],
  text: ['Professional', 'Casual', 'Persuasive', 'Educational', 'Entertaining'],
};

const TONE_OPTIONS = {
  pdf: ['Formal', 'Friendly', 'Authoritative', 'Instructional'],
  image: ['Bold', 'Elegant', 'Playful', 'Sophisticated', 'Energetic'],
  text: [
    'Professional',
    'Conversational',
    'Persuasive',
    'Informative',
    'Humorous',
  ],
};

export function AIContentGenerator({
  productType,
  productData,
  onGenerate,
  isGenerating,
}: AIContentGeneratorProps) {
  const { checkUsageLimit } = useSubscription();
  const [prompt, setPrompt] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [style, setStyle] = useState('');
  const [tone, setTone] = useState('');
  const [length, setLength] = useState([50]); // Percentage
  const [includeImages, setIncludeImages] = useState(true);
  const [customInstructions, setCustomInstructions] = useState('');

  const templates = CONTENT_TEMPLATES[productType];
  const styles = STYLE_OPTIONS[productType];
  const tones = TONE_OPTIONS[productType];

  const usageCheck = checkUsageLimit('aiRequests');
  const canUseAI = usageCheck.canUse;

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setPrompt(template.prompt);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    const options = {
      style,
      tone,
      length: length[0],
      includeImages: productType !== 'text' ? includeImages : false,
      customInstructions,
      template: selectedTemplate,
    };

    await onGenerate(prompt, options);
  };

  const getIcon = () => {
    switch (productType) {
      case 'pdf':
        return FileText;
      case 'image':
        return Image;
      case 'text':
        return Type;
      default:
        return Sparkles;
    }
  };

  const Icon = getIcon();

  if (!canUseAI) {
    return (
      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
        <CardContent className="p-8 text-center">
          <Crown className="w-16 h-16 mx-auto text-orange-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            AI Generation Limit Reached
          </h3>
          <p className="text-muted-foreground mb-6">
            You've used all your AI requests for this month. Upgrade to Pro for
            unlimited AI generation.
          </p>
          <Button className="bg-gradient-to-r from-primary to-primary/80">
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Pro
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Usage Status */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-medium">AI Content Generation</h4>
                <p className="text-sm text-muted-foreground">
                  {usageCheck.limit === -1
                    ? 'Unlimited AI requests available'
                    : `${usageCheck.limit - usageCheck.used} AI requests remaining`}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-white/50">
              <Zap className="w-3 h-3 mr-1" />
              AI Powered
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Choose a Template
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <motion.div
                key={template.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={cn(
                    'cursor-pointer transition-all',
                    selectedTemplate === template.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                  )}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">
                          {template.title}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {template.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Prompt */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            Custom Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="prompt">Describe what you want to create</Label>
            <Textarea
              id="prompt"
              placeholder={`Describe your ${productType} product in detail...`}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mt-2 min-h-[100px]"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {prompt.length}/1000 characters
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Choose a style" />
                </SelectTrigger>
                <SelectContent>
                  {styles.map((styleOption) => (
                    <SelectItem
                      key={styleOption}
                      value={styleOption.toLowerCase()}
                    >
                      {styleOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Choose a tone" />
                </SelectTrigger>
                <SelectContent>
                  {tones.map((toneOption) => (
                    <SelectItem
                      key={toneOption}
                      value={toneOption.toLowerCase()}
                    >
                      {toneOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Content Length</Label>
            <div className="mt-2 space-y-2">
              <Slider
                value={length}
                onValueChange={setLength}
                max={100}
                min={10}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Brief</span>
                <span>{length[0]}%</span>
                <span>Comprehensive</span>
              </div>
            </div>
          </div>

          {productType !== 'text' && (
            <div className="flex items-center space-x-2">
              <Switch
                id="include-images"
                checked={includeImages}
                onCheckedChange={setIncludeImages}
              />
              <Label htmlFor="include-images">
                Include placeholder images and visual elements
              </Label>
            </div>
          )}

          <div>
            <Label htmlFor="custom-instructions">
              Additional Instructions (Optional)
            </Label>
            <Textarea
              id="custom-instructions"
              placeholder="Any specific requirements, target audience, or special considerations..."
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              className="mt-2"
              maxLength={500}
            />
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon className="w-8 h-8 text-primary" />
              <div>
                <h4 className="font-semibold">Ready to Generate</h4>
                <p className="text-sm text-muted-foreground">
                  AI will create your {productType} content based on your
                  specifications
                </p>
              </div>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Content
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                Tips for Better AI Generation
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
                <li>• Be specific about your target audience and use case</li>
                <li>• Include relevant keywords and industry terms</li>
                <li>• Mention any specific format or structure requirements</li>
                <li>
                  • Provide context about your brand or business if relevant
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
