# Implementation Plan - Barcode Scanning System

## Phase 1: Backend Foundation

- [x] 1. Database schema and migration
- [x] 1.1 Create Alembic migration to add barcode columns to wines table
  - Add `barcode` VARCHAR(20) UNIQUE column
  - Add `barcode_type` VARCHAR(20) DEFAULT 'EAN13' column
  - Create index on barcode column
  - _Requirements: 1.1, 1.3, 1.5_

- [x] 1.2 Update Wine model with barcode fields
  - Add barcode field with validation
  - Add barcode_type field with enum
  - Update WineRead schema to include barcode
  - Update WineCreate/WineUpdate schemas
  - _Requirements: 1.1, 1.2, 1.4_

- [x] 1.3 Run migration and verify database changes
  - Execute migration on development database
  - Verify columns and index created
  - Test with sample data
  - _Requirements: 1.1_

## Phase 2: Backend API Endpoints

- [x] 2. Implement barcode search endpoint
- [x] 2.1 Create GET /wines/barcode/{barcode} endpoint
  - Implement wine lookup by barcode
  - Return 404 if not found
  - Return complete wine data if found
  - Add input validation
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 2.2 Write unit tests for barcode search
  - Test successful barcode lookup
  - Test barcode not found (404)
  - Test empty barcode (400)
  - Test invalid barcode format
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 2.3 Write property test for barcode search consistency
  - **Property 2: Barcode Search Consistency**
  - **Validates: Requirements 2.1, 2.2**

- [x] 3. Implement movement by barcode endpoint
- [x] 3.1 Create MovementBarcodeCreate schema
  - Define schema with barcode, type, quantity, unit fields
  - Add validation rules
  - _Requirements: 3.2_

- [x] 3.2 Create POST /movements/barcode endpoint
  - Search wine by barcode
  - Validate stock availability for "out" movements
  - Create movement record
  - Update wine quantity
  - Return movement with wine data
  - _Requirements: 3.1, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 3.3 Write unit tests for movement by barcode
  - Test successful carico (in)
  - Test successful scarico (out)
  - Test scarico with insufficient stock
  - Test wine not found
  - _Requirements: 3.1, 3.3, 3.4, 3.5, 3.6_

- [x] 3.4 Write property test for stock update correctness (in)
  - **Property 3: Movement Stock Update Correctness**
  - **Validates: Requirements 3.4**

- [x] 3.5 Write property test for stock update correctness (out)
  - **Property 4: Movement Stock Update Correctness (Out)**
  - **Validates: Requirements 3.5**

- [x] 3.6 Write property test for stock non-negative invariant
  - **Property 5: Stock Non-Negative Invariant**
  - **Validates: Requirements 3.6**

- [x] 4. Implement barcode assignment endpoint
- [x] 4.1 Create BarcodeAssign schema
  - Define schema with barcode and barcode_type
  - Add validation
  - _Requirements: 1.2_

- [x] 4.2 Create POST /wines/{wine_id}/barcode endpoint
  - Validate barcode uniqueness
  - Assign barcode to wine
  - Return updated wine
  - _Requirements: 1.3, 8.2_

- [x] 4.3 Write unit tests for barcode assignment
  - Test successful assignment
  - Test duplicate barcode (409)
  - Test invalid wine_id (404)
  - _Requirements: 1.3_

- [x] 4.4 Write property test for barcode uniqueness
  - **Property 1: Barcode Uniqueness**
  - **Validates: Requirements 1.3**

## Phase 3: Backend Utilities and Validation

- [x] 5. Implement barcode validation and generation
- [x] 5.1 Create barcode validation utilities
  - Implement EAN-13 format validator
  - Implement Code128 format validator
  - Implement internal barcode format validator
  - Add checksum validation for EAN-13
  - _Requirements: 9.1_

- [x] 5.2 Write property test for barcode format validation
  - **Property 6: Barcode Format Validation**
  - **Validates: Requirements 9.1**

- [x] 5.3 Create internal barcode generator
  - Implement INT{wine_id} format generator
  - Pad to 13 characters
  - Verify uniqueness before returning
  - _Requirements: 8.3_

- [x] 5.4 Write property test for internal barcode generation
  - **Property 7: Internal Barcode Generation Uniqueness**
  - **Validates: Requirements 8.3**

- [x] 6. Checkpoint - Backend complete
  - Ensure all tests pass, ask the user if questions arise.

## Phase 4: Frontend Device Detection

- [x] 7. Implement device detection utilities
- [x] 7.1 Create device-utils.ts
  - Implement getDeviceType() function
  - Implement isMobileDevice() function
  - Implement hasCamera() function
  - Implement isStandalone() function
  - _Requirements: 5.1, 6.1, 6.2, 6.3_

- [x] 7.2 Write unit tests for device detection
  - Test device type detection
  - Test camera availability check
  - Test PWA standalone detection
  - _Requirements: 5.1_

## Phase 5: Frontend BarcodeScanner Component

- [x] 8. Implement manual input mode
- [x] 8.1 Create BarcodeScanner component skeleton
  - Set up component structure
  - Add props interface
  - Implement mode switching logic
  - _Requirements: 4.1, 5.6_

- [x] 8.2 Implement manual input UI
  - Create input field with auto-focus
  - Add submit button
  - Handle Enter key press for auto-submit
  - Clear input after successful scan
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 8.3 Write property test for scanner input auto-submit
  - **Property 8: Scanner Input Auto-Submit**
  - **Validates: Requirements 4.2**

- [x] 8.4 Add desktop scanner hint
  - Display usage instructions for hardware scanner
  - Show only on desktop devices
  - _Requirements: 4.5_

- [x] 9. Implement camera scanner mode
- [x] 9.1 Install and configure QuaggaJS
  - Add quagga dependency
  - Create lazy loading wrapper
  - _Requirements: 5.2_

- [x] 9.2 Implement CameraScanner component
  - Initialize QuaggaJS with camera stream
  - Configure barcode readers (EAN-13, Code128)
  - Handle barcode detection events
  - Add visual feedback (target overlay)
  - _Requirements: 5.2, 5.3_

- [x] 9.3 Add haptic feedback
  - Implement vibration on successful scan
  - Check vibration API support
  - _Requirements: 5.4_

- [x] 9.4 Implement camera permission handling
  - Request camera permission
  - Handle permission denied
  - Display error message with instructions
  - Fallback to manual input
  - _Requirements: 5.5, 9.2_

- [x] 9.5 Write property test for camera detection fallback
  - **Property 9: Camera Detection Fallback**
  - **Validates: Requirements 5.5**

- [x] 9.6 Add mode toggle UI (mobile/tablet)
  - Create camera/manual toggle buttons
  - Show only on mobile/tablet
  - Preserve state when switching
  - _Requirements: 5.6, 6.2_

## Phase 6: Frontend QuickScan Page

- [x] 10. Create QuickScan page structure
- [x] 10.1 Create /dashboard/quick-scan/page.tsx
  - Set up page component
  - Add header with title and description
  - Integrate BarcodeScanner component
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 10.2 Implement wine search logic
  - Call API on barcode scan
  - Handle loading state
  - Handle success state
  - Handle error state (404, 400, 500)
  - _Requirements: 2.1, 2.2, 2.3, 9.1, 9.2, 9.3_

- [x] 10.3 Create wine details display
  - Show wine name, vintage, type
  - Display current stock quantity
  - Show threshold warning if applicable
  - _Requirements: 2.2, 6.4_

- [x] 10.4 Add quick action buttons
  - Create "Carico" button (green)
  - Create "Scarico" button (red)
  - Implement movement creation on click
  - Show success message
  - Reset state after operation
  - _Requirements: 3.1, 6.4_

- [x] 10.5 Implement error handling UI
  - Display error messages clearly
  - Add retry button
  - Show manual search option
  - _Requirements: 6.5, 9.1, 9.2, 9.3, 9.4_

## Phase 7: Responsive Layouts

- [x] 11. Implement responsive layouts
- [x] 11.1 Create desktop layout
  - Full dashboard with sidebar
  - Manual input optimized for hardware scanner
  - Horizontal layout for wine details and actions
  - _Requirements: 6.1_

- [x] 11.2 Create tablet layout
  - Compact layout with collapsible sidebar
  - Toggle between camera and manual
  - Two-column layout for details
  - _Requirements: 6.2_

- [x] 11.3 Create mobile layout
  - Fullscreen camera scanner
  - Minimal UI with large touch targets
  - Vertical stacked layout
  - _Requirements: 6.3_

- [x] 11.4 Write property test for responsive layout adaptation
  - **Property 10: Responsive Layout Adaptation**
  - **Validates: Requirements 6.1, 6.2, 6.3**

- [x] 11.5 Test on multiple devices
  - Test on desktop (Chrome, Firefox, Safari)
  - Test on tablet (iPad, Android tablet)
  - Test on mobile (iPhone, Android phone)
  - Verify no horizontal scrolling
  - _Requirements: 6.1, 6.2, 6.3_

## Phase 8: PWA Configuration

- [ ] 12. Configure Progressive Web App
- [ ] 12.1 Install and configure next-pwa
  - Add next-pwa dependency
  - Configure next.config.js
  - Set up service worker
  - _Requirements: 7.1_

- [ ] 12.2 Create manifest.json
  - Define app name and description
  - Add icons (192x192, 512x512)
  - Set display mode to standalone
  - Add quick-scan shortcut
  - _Requirements: 7.1, 7.2_

- [ ] 12.3 Implement offline support
  - Cache essential pages
  - Cache API responses
  - Queue movements when offline
  - Sync on reconnection
  - _Requirements: 7.3, 7.4, 7.5_

- [ ] 12.4 Test PWA installation
  - Test installation on iOS
  - Test installation on Android
  - Verify app icon and splash screen
  - Test offline functionality
  - _Requirements: 7.1, 7.2, 7.3_

## Phase 9: Internal Barcode Management

- [ ] 13. Implement internal barcode features
- [ ] 13.1 Add manual search fallback
  - Create search by name input
  - Display search results
  - Allow barcode assignment from results
  - _Requirements: 8.1_

- [ ] 13.2 Add internal barcode generation UI
  - Show "Generate Internal Barcode" button
  - Call generation endpoint
  - Display generated barcode
  - _Requirements: 8.2, 8.3_

- [ ] 13.3 Add barcode type indicator
  - Display badge for internal vs external barcode
  - Show different colors for types
  - _Requirements: 8.4_

- [ ] 13.4 Test internal barcode workflow
  - Create wine without barcode
  - Generate internal barcode
  - Scan internal barcode
  - Verify movement creation works
  - _Requirements: 8.5_

## Phase 10: Performance Optimization

- [ ] 14. Optimize performance
- [ ] 14.1 Add API response caching
  - Implement Redis cache for wine lookups
  - Set cache TTL to 5 minutes
  - Invalidate cache on wine updates
  - _Requirements: 10.1_

- [ ] 14.2 Optimize camera scanner
  - Reduce camera resolution for faster processing
  - Add debouncing to prevent duplicate scans
  - Optimize QuaggaJS configuration
  - _Requirements: 10.2, 10.5_

- [ ] 14.3 Add loading indicators
  - Show spinner during API calls
  - Add skeleton loaders
  - Provide immediate feedback on scan
  - _Requirements: 10.3, 10.4_

- [ ] 14.4 Measure and verify performance
  - Measure API response times
  - Measure scan-to-result times
  - Verify targets met (< 500ms hardware, < 2s camera)
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

## Phase 11: Integration Testing

- [ ] 15. End-to-end testing
- [ ] 15.1 Test hardware scanner workflow
  - Connect USB scanner
  - Scan multiple barcodes
  - Verify auto-submit works
  - Test rapid scanning
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 15.2 Test camera scanner workflow
  - Test on mobile device
  - Scan in various lighting conditions
  - Test with damaged labels
  - Verify haptic feedback
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 15.3 Test movement creation workflow
  - Scan barcode
  - Create carico movement
  - Verify stock updated
  - Create scarico movement
  - Verify stock decreased
  - _Requirements: 3.1, 3.4, 3.5_

- [ ] 15.4 Test error scenarios
  - Test barcode not found
  - Test insufficient stock
  - Test network error
  - Test camera permission denied
  - Verify error messages displayed
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 15.5 Test offline mode
  - Disconnect network
  - Create movements
  - Verify queued
  - Reconnect network
  - Verify synced
  - _Requirements: 7.3, 7.4, 7.5_

## Phase 12: Documentation and Deployment

- [ ] 16. Documentation
- [ ] 16.1 Update API documentation
  - Document new endpoints in OpenAPI
  - Add request/response examples
  - Document error codes
  - _Requirements: All_

- [ ] 16.2 Create user guide
  - Write hardware scanner setup guide
  - Write mobile camera usage guide
  - Document troubleshooting steps
  - _Requirements: 4.5, 9.2_

- [ ] 16.3 Update README
  - Add barcode feature description
  - List supported barcode formats
  - Add hardware recommendations
  - _Requirements: All_

- [ ] 17. Final checkpoint and deployment
  - Ensure all tests pass, ask the user if questions arise.
  - Deploy to staging environment
  - Perform UAT (User Acceptance Testing)
  - Deploy to production
  - Monitor metrics and errors
