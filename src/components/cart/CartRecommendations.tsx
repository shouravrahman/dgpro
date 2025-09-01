'use client';

import { motion } from 'framer-motion';
import { Plus, Star, TrendingUp, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/lib/utils';
import type { CartRecommendation } from '@/types/cart';

interface CartRecommendationsProps {
  recommendations: CartRecommendation[];
}

export function CartRecommendations({
  recommendations,
}: CartRecommendationsProps) {
  const { addToCart, animationState } = useCart();

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'frequently_bought_together':
        return <Users className="h-4 w-4" />;
      case 'similar':
        return <Star className="h-4 w-4" />;
      case 'upsell':
        return <TrendingUp className="h-4 w-4" />;
      case 'cross_sell':
        return <Zap className="h-4 w-4" />;
      default:
        return <Plus className="h-4 w-4" />;
    }
  };

  const getRecommendationLabel = (type: string) => {
    switch (type) {
      case 'frequently_bought_together':
        return 'Often bought together';
      case 'similar':
        return 'Similar products';
      case 'upsell':
        return 'Upgrade option';
      case 'cross_sell':
        return 'You might also like';
      default:
        return 'Recommended';
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'frequently_bought_together':
        return 'bg-blue-100 text-blue-800';
      case 'similar':
        return 'bg-purple-100 text-purple-800';
      case 'upsell':
        return 'bg-green-100 text-green-800';
      case 'cross_sell':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddToCart = async (productId: string) => {
    await addToCart({ product_id: productId, quantity: 1 });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  if (!recommendations.length) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center space-x-2">
          <Zap className="h-4 w-4" />
          <span>Recommended for you</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {recommendations.slice(0, 3).map((recommendation) => (
            <motion.div
              key={recommendation.product_id}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="border rounded-lg p-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-3">
                {/* Product Image */}
                <div className="w-12 h-12 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                  {recommendation.product?.assets?.images?.[0] ? (
                    <img
                      src={recommendation.product.assets.images[0]}
                      alt={recommendation.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm truncate">
                        {recommendation.name}
                      </h4>

                      <div className="flex items-center space-x-2 mt-1">
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getRecommendationColor(recommendation.recommendation_type)}`}
                        >
                          {getRecommendationIcon(
                            recommendation.recommendation_type
                          )}
                          <span className="ml-1">
                            {getRecommendationLabel(
                              recommendation.recommendation_type
                            )}
                          </span>
                        </Badge>

                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-muted-foreground">
                            {(recommendation.score * 5).toFixed(1)}
                          </span>
                        </div>
                      </div>

                      {recommendation.reason && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {recommendation.reason}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end space-y-2 ml-2">
                      <span className="font-semibold text-sm">
                        {formatCurrency(recommendation.price)}
                      </span>

                      <Button
                        size="sm"
                        onClick={() =>
                          handleAddToCart(recommendation.product_id)
                        }
                        disabled={animationState.isAdding}
                        className="h-7 px-2 text-xs"
                      >
                        {animationState.isAdding &&
                        animationState.addedItemId ===
                          recommendation.product_id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {recommendations.length > 3 && (
          <div className="mt-3 text-center">
            <Button variant="ghost" size="sm" className="text-xs">
              View {recommendations.length - 3} more recommendations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
