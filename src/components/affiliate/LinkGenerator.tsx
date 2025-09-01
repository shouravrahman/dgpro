'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Copy,
  Share2,
  Link,
  QrCode,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  MessageCircle,
} from 'lucide-react';
import { useAffiliateLinks } from '@/hooks/useAffiliate';
import { toast } from 'sonner';

export function LinkGenerator() {
  const [productUrl, setProductUrl] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const { generateLink, generateShareText, affiliateCode } =
    useAffiliateLinks();

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const affiliateLink = generateLink(undefined, baseUrl);
  const productLink = productUrl ? generateLink(productUrl, baseUrl) : '';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const shareOnSocial = (platform: string, url: string, text: string) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);

    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodedText}&body=${encodedText}%0A%0A${encodedUrl}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const defaultMessage = generateShareText();

  return (
    <div className="space-y-6">
      {/* Affiliate Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Your Affiliate Code
          </CardTitle>
          <CardDescription>
            Use this code to track referrals and earn commissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Label htmlFor="affiliateCode">Affiliate Code</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="affiliateCode"
                  value={affiliateCode || ''}
                  readOnly
                  className="font-mono"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    copyToClipboard(affiliateCode || '', 'Affiliate code')
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* General Affiliate Link */}
      <Card>
        <CardHeader>
          <CardTitle>General Affiliate Link</CardTitle>
          <CardDescription>
            Share this link to earn commissions on any purchases made by your
            referrals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="generalLink">Your Affiliate Link</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                id="generalLink"
                value={affiliateLink || ''}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  copyToClipboard(affiliateLink || '', 'Affiliate link')
                }
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Social Sharing */}
          <div>
            <Label>Share on Social Media</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  shareOnSocial('facebook', affiliateLink || '', defaultMessage)
                }
              >
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  shareOnSocial('twitter', affiliateLink || '', defaultMessage)
                }
              >
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  shareOnSocial('linkedin', affiliateLink || '', defaultMessage)
                }
              >
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  shareOnSocial('whatsapp', affiliateLink || '', defaultMessage)
                }
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  shareOnSocial('email', affiliateLink || '', defaultMessage)
                }
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product-Specific Link */}
      <Card>
        <CardHeader>
          <CardTitle>Product-Specific Link</CardTitle>
          <CardDescription>
            Generate a link for a specific product to track targeted referrals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="productUrl">Product URL or ID</Label>
            <Input
              id="productUrl"
              placeholder="Enter product URL or ID"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
            />
          </div>

          {productLink && (
            <div>
              <Label htmlFor="productLink">Generated Product Link</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="productLink"
                  value={productLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(productLink, 'Product link')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Message Generator */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Share Message</CardTitle>
          <CardDescription>
            Create a personalized message to share with your audience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="customMessage">Your Message</Label>
            <Textarea
              id="customMessage"
              placeholder="Write your custom message here..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCustomMessage(defaultMessage)}
            >
              Use Default Message
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                copyToClipboard(
                  `${customMessage}\n\n${affiliateLink}`,
                  'Message with link'
                )
              }
              disabled={!customMessage}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Message + Link
            </Button>
          </div>

          {customMessage && (
            <div className="p-3 bg-gray-50 rounded-lg border">
              <Label className="text-sm font-medium">Preview:</Label>
              <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                {customMessage}
              </p>
              <p className="text-sm text-blue-600 mt-2 font-mono break-all">
                {affiliateLink}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips and Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Sharing Tips</CardTitle>
          <CardDescription>
            Best practices to maximize your affiliate earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-0.5">
                1
              </Badge>
              <div>
                <h4 className="font-medium">Be Authentic</h4>
                <p className="text-sm text-gray-600">
                  Share products you genuinely believe in and use yourself.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-0.5">
                2
              </Badge>
              <div>
                <h4 className="font-medium">Provide Value</h4>
                <p className="text-sm text-gray-600">
                  Explain how the product solves problems or adds value.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-0.5">
                3
              </Badge>
              <div>
                <h4 className="font-medium">Use Multiple Channels</h4>
                <p className="text-sm text-gray-600">
                  Share across social media, email, blogs, and personal
                  networks.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-0.5">
                4
              </Badge>
              <div>
                <h4 className="font-medium">Track Performance</h4>
                <p className="text-sm text-gray-600">
                  Monitor which channels and messages perform best.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
