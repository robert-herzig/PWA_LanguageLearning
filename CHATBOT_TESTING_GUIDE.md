# Chatbot Testing Documentation

## Overview

This document describes the comprehensive test suite for the PWA Language Learning Chatbot functionality using Playwright.

## Test Files

### 1. `tests/chatbot.spec.ts`
Complete test suite for chatbot functionality including:

- **Setup Interface Tests**: Verify that users can select language levels and topics
- **Dynamic Content Loading**: Test that topics are loaded dynamically from vocabulary JSON files
- **Chat Functionality**: Test message sending, receiving, and vocabulary integration
- **Responsive Design**: Verify mobile compatibility
- **Demo Mode**: Test chatbot without API key using demo responses

### 2. `tests/pwa-mobile-installation.spec.ts`
PWA installation and mobile functionality tests:

- **PWA Requirements**: Verify manifest.json, service worker, and required icons
- **Mobile Optimization**: Test responsive design and mobile-specific features
- **Installation Readiness**: Verify PWA installation capabilities
- **Offline Functionality**: Test app behavior when offline

## Key Test Categories

### Chatbot Setup Flow
```typescript
✅ Display chatbot setup interface
✅ Allow level selection (A2, B1, B2)
✅ Dynamically load topics with metadata
✅ Show API configuration step
✅ Start chatting in demo mode
```

### Chat Interaction
```typescript
✅ Display opening story with vocabulary integration
✅ Send and receive messages
✅ Handle Enter key for sending
✅ Insert vocabulary words via clicking chips
✅ Show typing indicators
✅ Reset chat functionality
```

### Dynamic Content
```typescript
✅ Discover available topics from JSON files
✅ Display topic metadata (level, word count)
✅ Load vocabulary hints as clickable chips
✅ Generate contextual responses based on vocabulary
```

### Mobile & PWA
```typescript
✅ Responsive design on mobile viewports
✅ PWA manifest and service worker
✅ Offline functionality
✅ Installation requirements
✅ Mobile-optimized interface
```

## Running Tests

### Individual Test Files
```bash
# Run chatbot functionality tests
npx playwright test tests/chatbot.spec.ts

# Run PWA mobile installation tests
npx playwright test tests/pwa-mobile-installation.spec.ts
```

### Specific Test Groups
```bash
# Run only setup tests
npx playwright test tests/chatbot.spec.ts -g "setup"

# Run only chat interaction tests
npx playwright test tests/chatbot.spec.ts -g "sending messages"

# Run mobile-specific tests
npx playwright test tests/chatbot.spec.ts -g "mobile viewport"
```

### Browser-Specific Testing
```bash
# Test on Chrome desktop
npx playwright test tests/chatbot.spec.ts --project=chrome-desktop

# Test on mobile Chrome
npx playwright test tests/chatbot.spec.ts --project=chrome-mobile

# Test PWA features
npx playwright test tests/chatbot.spec.ts --project=chrome-pwa
```

## Test Environment Setup

### Prerequisites
1. **Local Server**: Tests require the app to be served locally
   ```bash
   python -m http.server 8000
   ```

2. **Vocabulary Files**: Dynamic topic loading tests require generated vocabulary JSON files in:
   ```
   data/word_lists/{language}/{level}/{topic}.json
   ```

3. **Browser Requirements**: PWA tests require Chromium-based browsers for full functionality

### Configuration
The tests are configured to work with:
- Local development server on `http://127.0.0.1:8000`
- Standard PWA manifest and service worker
- Dynamic vocabulary discovery system
- Mobile-responsive design

## Test Data Dependencies

### Required Files
- `manifest.json` - PWA manifest
- `sw.js` - Service worker
- `icons/` directory with required PWA icons
- `data/word_lists/` with vocabulary JSON files

### Dynamic Topic Discovery
Tests verify that the chatbot can:
1. Scan available vocabulary files
2. Display topic names with metadata
3. Load vocabulary words for selected topics
4. Generate contextual stories using vocabulary

## Debugging

### Common Issues
1. **Connection Refused**: Ensure local server is running on port 8000
2. **Element Not Found**: Verify HTML structure matches test selectors
3. **Timeout Errors**: Increase timeout for slow vocabulary loading
4. **PWA Features**: Some features only work in Chromium browsers

### Debug Commands
```bash
# Run with headed browser for visual debugging
npx playwright test tests/chatbot.spec.ts --headed

# Run with debug mode
npx playwright test tests/chatbot.spec.ts --debug

# Generate test report
npx playwright test && npx playwright show-report
```

## Expected Behavior

### Successful Test Run
When all tests pass, you can expect:
- ✅ 16 chatbot functionality tests pass
- ✅ 12 PWA mobile installation tests pass
- ✅ All dynamic content loads correctly
- ✅ Chat interactions work in demo mode
- ✅ Mobile responsiveness verified
- ✅ PWA installation requirements met

### Performance Expectations
- Test suite completes in under 2 minutes
- Individual tests complete within 30 seconds
- Dynamic topic loading within 3 seconds
- Chat responses generated within 2 seconds

## Maintenance

### Updating Tests
When adding new chatbot features:
1. Add corresponding test cases
2. Update test data if vocabulary structure changes
3. Verify mobile compatibility
4. Test PWA functionality

### Test Coverage
Current test coverage includes:
- User interface interactions
- Dynamic content loading
- Error handling
- Mobile responsiveness
- PWA compliance
- Offline functionality

The test suite provides comprehensive coverage of all chatbot features and ensures reliable functionality across different devices and usage scenarios.
