'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  Image,
  Crop,
  Palette,
  Sliders,
  Filter,
  Download,
  Eye,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Maximize,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageEditorProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  onPreviewChange: (preview: string) => void;
}

interface ImageAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
}

export function ImageEditor({
  files,
  onFilesChange,
  onPreviewChange,
}: ImageEditorProps) {
  const [activeTab, setActiveTab] = useState('adjust');
  const [selectedImage, setSelectedImage] = useState(0);
  const [adjustments, setAdjustments] = useState<ImageAdjustments>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
    blur: 0,
  });

  const handleAdjustmentChange = useCallback(
    (key: keyof ImageAdjustments, value: number[]) => {
      setAdjustments((prev) => ({
        ...prev,
        [key]: value[0],
      }));
    },
    []
  );

  const handlePreviewUpdate = useCallback(() => {
    const previewHTML = `
      <div class="image-preview">
        <div class="image-grid">
          ${files
            .map(
              (file, index) => `
            <div class="image-item">
              <img src="${URL.createObjectURL(file)}" alt="${file.name}" style="
                filter: 
                  brightness(${100 + adjustments.brightness}%) 
                  contrast(${100 + adjustments.contrast}%) 
                  saturate(${100 + adjustments.saturation}%) 
                  hue-rotate(${adjustments.hue}deg)
                  blur(${adjustments.blur}px);
                max-width: 100%;
                height: auto;
                border-radius: 8px;
              " />
              <p class="image-caption">${file.name}</p>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
    onPreviewChange(previewHTML);
  }, [files, adjustments, onPreviewChange]);

  if (files.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Image className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Images</h3>
          <p className="text-muted-foreground mb-4">
            Upload images to start editing
          </p>
          <Button onClick={() => setActiveTab('upload')}>Upload Images</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Image Gallery */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Images ({files.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'relative border rounded-lg overflow-hidden cursor-pointer transition-all',
                  selectedImage === index
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'hover:border-primary/50'
                )}
                onClick={() => setSelectedImage(index)}
              >
                <div className="aspect-square bg-muted">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                    style={{
                      filter: `
                        brightness(${100 + adjustments.brightness}%) 
                        contrast(${100 + adjustments.contrast}%) 
                        saturate(${100 + adjustments.saturation}%) 
                        hue-rotate(${adjustments.hue}deg)
                        blur(${adjustments.blur}px)
                      `,
                    }}
                  />
                </div>
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs">
                    {(file.size / (1024 * 1024)).toFixed(1)}MB
                  </Badge>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2">
                  <p className="text-xs truncate">{file.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Editor Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="adjust" className="flex items-center gap-2">
            <Sliders className="w-4 h-4" />
            Adjust
          </TabsTrigger>
          <TabsTrigger value="crop" className="flex items-center gap-2">
            <Crop className="w-4 h-4" />
            Crop
          </TabsTrigger>
          <TabsTrigger value="filters" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </TabsTrigger>
          <TabsTrigger value="effects" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Effects
          </TabsTrigger>
        </TabsList>

        <TabsContent value="adjust" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Image Adjustments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(adjustments).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label className="capitalize">{key}</Label>
                  <Slider
                    value={[value]}
                    onValueChange={(val) =>
                      handleAdjustmentChange(key as keyof ImageAdjustments, val)
                    }
                    min={key === 'blur' ? 0 : -100}
                    max={key === 'hue' ? 360 : 100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{key === 'blur' ? '0' : '-100'}</span>
                    <span>{value}</span>
                    <span>{key === 'hue' ? '360' : '100'}</span>
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setAdjustments({
                      brightness: 0,
                      contrast: 0,
                      saturation: 0,
                      hue: 0,
                      blur: 0,
                    })
                  }
                >
                  Reset
                </Button>
                <Button size="sm" onClick={handlePreviewUpdate}>
                  Apply Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crop" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crop & Transform</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'Square', icon: Maximize, ratio: '1:1' },
                  { name: 'Portrait', icon: Maximize, ratio: '3:4' },
                  { name: 'Landscape', icon: Maximize, ratio: '4:3' },
                  { name: 'Wide', icon: Maximize, ratio: '16:9' },
                ].map((crop) => (
                  <Button
                    key={crop.name}
                    variant="outline"
                    className="h-16 flex flex-col items-center justify-center"
                  >
                    <crop.icon className="w-5 h-5 mb-1" />
                    <span className="text-xs">{crop.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {crop.ratio}
                    </span>
                  </Button>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm">
                  <RotateCw className="w-4 h-4 mr-2" />
                  Rotate
                </Button>
                <Button variant="outline" size="sm">
                  <FlipHorizontal className="w-4 h-4 mr-2" />
                  Flip H
                </Button>
                <Button variant="outline" size="sm">
                  <FlipVertical className="w-4 h-4 mr-2" />
                  Flip V
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="filters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  'Original',
                  'Black & White',
                  'Sepia',
                  'Vintage',
                  'Cool',
                  'Warm',
                ].map((filter) => (
                  <Button
                    key={filter}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/40 rounded mb-2" />
                    <span className="text-xs">{filter}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="effects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Effects & Overlays</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  'Vignette',
                  'Glow',
                  'Shadow',
                  'Border',
                  'Texture',
                  'Gradient',
                ].map((effect) => (
                  <Button
                    key={effect}
                    variant="outline"
                    className="h-16 flex flex-col items-center justify-center"
                  >
                    <Palette className="w-5 h-5 mb-1" />
                    <span className="text-xs">{effect}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handlePreviewUpdate}>
          <Eye className="w-4 h-4 mr-2" />
          Update Preview
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Images
          </Button>
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
