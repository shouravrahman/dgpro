# Onboarding System Documentation

## Overview

The onboarding system provides a comprehensive user experience for new users to set up their accounts as either creators or buyers. The system is built with React, TypeScript, and integrates with Supabase for data persistence.

## Architecture

### Components Structure

```
src/components/onboarding/
├── onboarding-flow.tsx          # Main orchestrator component
├── role-selection.tsx           # Role selection interface
├── creator-onboarding.tsx       # Creator-specific onboarding steps
├── buyer-onboarding.tsx         # Buyer-specific onboarding steps
├── onboarding-complete.tsx      # Completion screen
└── __tests__/                   # Comprehensive test suite
    ├── onboarding-flow.test.tsx
    ├── role-selection.test.tsx
    ├── creator-onboarding.test.tsx
    ├── buyer-onboarding.test.tsx
    ├── onboarding-complete.test.tsx
    └── onboarding-integration.test.tsx
```

### API Routes

```
src/app/api/onboarding/
├── status/route.ts              # Get user onboarding status
├── role/route.ts                # Update user role
├── step/route.ts                # Process onboarding steps
└── __tests__/
    └── onboarding-api.test.ts
```

### Database Services

```
src/lib/database/services/
├── onboarding.service.ts        # Core onboarding business logic
└── __tests__/
    └── onboarding.service.test.ts
```

### Validation Schemas

```
src/lib/validations/
├── onboarding.ts                # Zod schemas for validation
└── __tests__/
    └── onboarding.test.ts
```

## User Flow

### 1. Role Selection

- Users choose between "Creator" or "Buyer" roles
- Visual cards with feature highlights
- Animated selection with loading states

### 2. Creator Onboarding (3 steps)

#### Step 1: Creative Journey

- Product types selection (Digital Art, Templates, etc.)
- Experience level (Beginner, Intermediate, Advanced, Expert)
- Business goals (Build Brand, Increase Revenue, etc.)

#### Step 2: Interests & Goals

- Interest categories selection
- Specific goals for the platform
- Time commitment level

#### Step 3: Profile Setup

- Profile completion
- Notification preferences
- Final setup confirmation

### 3. Buyer Onboarding (2 steps)

#### Step 1: Interests & Preferences

- Interest categories selection
- Budget range selection
- Purchase frequency preferences

#### Step 2: Profile Setup

- Profile completion
- Notification preferences
- Setup completion

### 4. Completion

- Welcome message with role-specific content
- Feature highlights
- Navigation to appropriate dashboard

## Database Schema

### user_onboarding_status Table

```sql
CREATE TABLE user_onboarding_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('creator', 'buyer')),
    current_step INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_steps INTEGER[] DEFAULT '{}',
    step1_data JSONB,
    step2_data JSONB,
    step3_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);
```

## API Endpoints

### GET /api/onboarding/status

Returns the current onboarding status for the authenticated user.

**Response:**

```json
{
  "success": true,
  "data": {
    "role": "creator",
    "currentStep": 2,
    "isCompleted": false,
    "completedSteps": [1]
  }
}
```

### POST /api/onboarding/role

Updates the user's role selection.

**Request:**

```json
{
  "role": "creator"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "role": "creator"
  }
}
```

### POST /api/onboarding/step

Processes a completed onboarding step.

**Request:**

```json
{
  "role": "creator",
  "step": 1,
  "data": {
    "productTypes": ["Digital Art"],
    "experienceLevel": "beginner",
    "businessGoals": ["Build Brand"]
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "role": "creator",
    "currentStep": 2,
    "isCompleted": false,
    "completedSteps": [1]
  }
}
```

## Validation

The system uses Zod schemas for comprehensive validation:

### Creator Step 1 Schema

```typescript
const creatorStep1Schema = z.object({
  productTypes: z
    .array(z.string())
    .min(1, 'Please select at least one product type')
    .max(5, 'Too many product types selected'),
  experienceLevel: ExperienceLevelEnum,
  businessGoals: z
    .array(z.string())
    .min(1, 'Please select at least one business goal')
    .max(3, 'Too many business goals selected'),
});
```

### Buyer Step 1 Schema

```typescript
const buyerStep1Schema = z.object({
  interests: z
    .array(z.string())
    .min(1, 'Please select at least one interest')
    .max(10, 'Too many interests selected'),
  budget: BudgetEnum,
  purchaseFrequency: PurchaseFrequencyEnum,
});
```

## Testing

### Test Coverage

- **Component Tests**: All UI components with user interactions
- **API Tests**: All endpoints with various scenarios
- **Service Tests**: Database operations and business logic
- **Validation Tests**: Schema validation with edge cases
- **Integration Tests**: Complete user flows

### Running Tests

```bash
# Run all onboarding tests
npm run test:onboarding

# Run with coverage
npm run test:onboarding:coverage

# Run specific test files
npm run test src/components/onboarding/__tests__/onboarding-flow.test.tsx
```

### Test Files

- `onboarding-flow.test.tsx` - Main flow orchestration
- `role-selection.test.tsx` - Role selection component
- `creator-onboarding.test.tsx` - Creator onboarding steps
- `buyer-onboarding.test.tsx` - Buyer onboarding steps
- `onboarding-complete.test.tsx` - Completion screen
- `onboarding-integration.test.tsx` - End-to-end flows
- `onboarding-api.test.ts` - API endpoint testing
- `onboarding.service.test.ts` - Service layer testing
- `onboarding.test.ts` - Validation schema testing

## Error Handling

### Client-Side

- Form validation with real-time feedback
- Network error handling with retry options
- Loading states during API calls
- Toast notifications for user feedback

### Server-Side

- Authentication validation
- Input sanitization and validation
- Database error handling
- Structured error responses

## Security Considerations

- All API endpoints require authentication
- Input validation on both client and server
- SQL injection prevention through parameterized queries
- XSS prevention through proper data sanitization
- CSRF protection through Supabase's built-in mechanisms

## Performance Optimizations

- Lazy loading of onboarding components
- Optimistic UI updates
- Efficient re-renders with React.memo
- Minimal API calls with smart caching
- Progressive form validation

## Accessibility

- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management
- ARIA labels and descriptions

## Future Enhancements

1. **Analytics Integration**
   - Track onboarding completion rates
   - Identify drop-off points
   - A/B testing for different flows

2. **Personalization**
   - Dynamic step ordering based on user behavior
   - Personalized recommendations
   - Smart defaults based on user data

3. **Social Features**
   - Social media integration
   - Profile import from external platforms
   - Referral system integration

4. **Advanced Validation**
   - Real-time availability checking
   - External API integrations
   - Machine learning-based suggestions

## Troubleshooting

### Common Issues

1. **Onboarding not starting**
   - Check user authentication status
   - Verify database connectivity
   - Check for JavaScript errors in console

2. **Step progression issues**
   - Verify form validation is passing
   - Check API response status
   - Ensure database updates are successful

3. **Data not persisting**
   - Check database connection
   - Verify user permissions
   - Check for transaction rollbacks

### Debug Mode

Enable debug logging by setting:

```env
NEXT_PUBLIC_DEBUG_ONBOARDING=true
```

This will log detailed information about:

- API calls and responses
- Form validation results
- State changes
- Error details

## Contributing

When contributing to the onboarding system:

1. **Add Tests**: All new features must include comprehensive tests
2. **Update Documentation**: Keep this README updated with changes
3. **Follow Patterns**: Maintain consistency with existing code patterns
4. **Validate Accessibility**: Ensure new components are accessible
5. **Performance**: Consider performance implications of changes

## Dependencies

### Core Dependencies

- React 19.1.0
- Next.js 15.4.6
- TypeScript 5.x
- Zod 4.0.17
- Supabase 2.55.0

### UI Dependencies

- Radix UI components
- Tailwind CSS 4.x
- Framer Motion 12.x
- Lucide React icons

### Testing Dependencies

- Vitest 3.2.4
- Testing Library
- jsdom 26.1.0

## License

This onboarding system is part of the AI Product Creator application and follows the same licensing terms.
