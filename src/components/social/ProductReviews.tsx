'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Filter,
  Plus,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProductReview, CreateReviewData } from '@/types/social';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ProductReviewsProps {
  productId: string;
  canReview?: boolean;
}

export function ProductReviews({
  productId,
  canReview = true,
}: ProductReviewsProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState('all');
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewForm, setReviewForm] = useState<CreateReviewData>({
    product_id: productId,
    rating: 5,
    title: '',
    content: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId, sortBy, filterRating]);

  const fetchReviews = async () => {
    try {
      const params = new URLSearchParams({
        product_id: productId,
        sort: sortBy,
      });

      if (filterRating !== 'all') {
        params.append('rating', filterRating);
      }

      const response = await fetch(`/api/social/reviews?${params}`);
      const data = await response.json();

      if (response.ok) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error('Please log in to write a review');
      return;
    }

    if (!reviewForm.content.trim()) {
      toast.error('Please write a review');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/social/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm),
      });

      const data = await response.json();

      if (response.ok) {
        setReviews((prev) => [data.review, ...prev]);
        setShowReviewDialog(false);
        setReviewForm({
          product_id: productId,
          rating: 5,
          title: '',
          content: '',
        });
        toast.success('Review submitted successfully');
      } else {
        toast.error(data.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoteReview = async (reviewId: string, isHelpful: boolean) => {
    if (!user) {
      toast.error('Please log in to vote on reviews');
      return;
    }

    try {
      const response = await fetch('/api/social/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_id: reviewId, is_helpful: isHelpful }),
      });

      if (response.ok) {
        // Refresh reviews to get updated vote counts
        fetchReviews();
        toast.success('Vote recorded');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to vote');
      }
    } catch (error) {
      console.error('Error voting on review:', error);
      toast.error('Failed to vote');
    }
  };

  const renderStars = (rating: number, size = 'sm') => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage:
      reviews.length > 0
        ? (reviews.filter((r) => r.rating === rating).length / reviews.length) *
          100
        : 0,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Customer Reviews</h2>
              <div className="flex items-center gap-2 mt-2">
                {renderStars(Math.round(averageRating), 'lg')}
                <span className="text-2xl font-bold">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-muted-foreground">
                  ({reviews.length} reviews)
                </span>
              </div>
            </div>

            {canReview && user && (
              <Dialog
                open={showReviewDialog}
                onOpenChange={setShowReviewDialog}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Write Review
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Write a Review</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Rating</Label>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() =>
                              setReviewForm((prev) => ({
                                ...prev,
                                rating: star,
                              }))
                            }
                            className="p-1"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= reviewForm.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="title">Title (optional)</Label>
                      <Input
                        id="title"
                        value={reviewForm.title}
                        onChange={(e) =>
                          setReviewForm((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        placeholder="Summarize your review"
                      />
                    </div>

                    <div>
                      <Label htmlFor="content">Review</Label>
                      <Textarea
                        id="content"
                        value={reviewForm.content}
                        onChange={(e) =>
                          setReviewForm((prev) => ({
                            ...prev,
                            content: e.target.value,
                          }))
                        }
                        placeholder="Share your experience with this product"
                        rows={4}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleSubmitReview}
                        disabled={submitting}
                        className="flex-1"
                      >
                        {submitting ? 'Submitting...' : 'Submit Review'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowReviewDialog(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Rating Distribution */}
          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm w-8">{rating}</span>
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-8">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="helpful">Most Helpful</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterRating} onValueChange={setFilterRating}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
            <SelectItem value="4">4 Stars</SelectItem>
            <SelectItem value="3">3 Stars</SelectItem>
            <SelectItem value="2">2 Stars</SelectItem>
            <SelectItem value="1">1 Star</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
              <p className="text-muted-foreground">
                Be the first to review this product!
              </p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.reviewer?.avatar_url || ''} />
                      <AvatarFallback>
                        {review.reviewer?.display_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {review.reviewer?.display_name || 'Anonymous'}
                          </span>
                          {review.reviewer?.is_verified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified
                            </Badge>
                          )}
                          {review.is_verified_purchase && (
                            <Badge variant="outline" className="text-xs">
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        {review.title && (
                          <span className="font-medium">{review.title}</span>
                        )}
                      </div>

                      {review.content && (
                        <p className="text-gray-700 leading-relaxed">
                          {review.content}
                        </p>
                      )}

                      <div className="flex items-center gap-4 pt-2">
                        <button
                          onClick={() => handleVoteReview(review.id, true)}
                          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-green-600 transition-colors"
                        >
                          <ThumbsUp className="h-4 w-4" />
                          Helpful ({review.helpful_count})
                        </button>

                        <button
                          onClick={() => handleVoteReview(review.id, false)}
                          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-600 transition-colors"
                        >
                          <ThumbsDown className="h-4 w-4" />
                          Not Helpful
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
