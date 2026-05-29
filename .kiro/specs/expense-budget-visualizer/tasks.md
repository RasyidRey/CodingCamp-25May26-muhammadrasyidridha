# Implementation Plan: Expense & Budget Visualizer

## Overview

This plan implements a standalone client-side expense tracking application using vanilla HTML, CSS, and JavaScript. The architecture follows a single HTML file, one CSS file, and one JS file pattern with Chart.js via CDN for visualization. Implementation proceeds from foundational structure through core logic, UI rendering, and feature integration.

## Tasks

- [ ] 1. Set up project structure and HTML skeleton
  - [x] 1.1 Create index.html with complete page structure
    - Create `index.html` at project root with semantic HTML5 structure
    - Include Chart.js CDN script tag with fallback handling
    - Include link to `css/style.css` and script tag for `js/app.js`
    - Add all UI sections: Input_Form, Balance_Display, Pie_Chart canvas, Transaction_List container, sort control, month filter, budget input, theme toggle button, custom category input
    - Add appropriate ARIA labels and roles for accessibility
    - _Requirements: 12.1, 12.4, 12.5, 13.3, 13.4_

  - [x] 1.2 Create css/style.css with base styles and theming
    - Create `css/style.css` with CSS custom properties for light and dark themes
    - Implement light theme as default with `.dark-theme` class on body for dark mode
    - Style all layout sections: form, balance display, chart area, transaction list, controls
    - Implement responsive layout: vertical stacking at 768-1023px, side-by-side at 1024px+
    - Ensure minimum 16px body font, 4.5:1 contrast ratio, 44x44px touch targets
    - Ensure no horizontal scrolling from 768px to 1440px
    - Style budget warning indicator (visible adjacent to Balance_Display)
    - Style validation error messages (inline below fields)
    - _Requirements: 12.2, 11.2, 13.4, 13.5, 13.6, 4.1_

- [x] 2. Implement data layer (StorageManager and data models)
  - [x] 2.1 Implement StorageManager module
    - Create `js/app.js` with IIFE module pattern
    - Implement StorageManager with keys: `ebv_transactions`, `ebv_categories`, `ebv_budget_limit`, `ebv_theme`
    - Implement `getTransactions()` — parse JSON from Local Storage, return empty array on malformed/missing data
    - Implement `saveTransactions(transactions)` — serialize and save to Local Storage
    - Implement `getCustomCategories()` / `saveCustomCategories(categories)`
    - Implement `getBudgetLimit()` / `saveBudgetLimit(limit)`
    - Implement `getTheme()` / `saveTheme(theme)`
    - Handle Local Storage unavailability gracefully (app functions without persistence)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_


- [x] 3. Implement core business logic managers
  - [x] 3.1 Implement TransactionManager
    - Implement `addTransaction(name, amount, category)` with full validation
    - Validate name: non-empty after trim, max 50 chars
    - Validate amount: positive number, 0.01 to 9,999,999.99, round to 2 decimal places
    - Validate category: must exist in CategoryManager's list
    - Auto-assign current date (ISO 8601 YYYY-MM-DD) and createdAt timestamp
    - Generate unique ID (timestamp + random suffix)
    - Implement `deleteTransaction(id)` — remove by ID
    - Implement `getTotal()` — sum all amounts with `Math.round(value * 100) / 100`
    - Implement `getByMonth(year, month)` — filter by date
    - Implement `getCategoryTotals()` — return Map of category to sum
    - Implement `getAvailableMonths()` — return distinct year/month pairs from transactions
    - Persist after every add/delete via StorageManager
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 1.6, 3.1, 3.2, 3.3, 3.4, 4.2, 4.3, 4.4, 4.5, 8.1_

  - [x] 3.8 Implement CategoryManager
    - Define DEFAULT_CATEGORIES: ['Food', 'Transport', 'Fun']
    - Implement `getAllCategories()` — return defaults + custom categories from StorageManager
    - Implement `addCustomCategory(name)` — validate non-empty, max 30 chars, no case-insensitive duplicates
    - Implement `isValidCategory(name)` — check existence in full list
    - Persist custom categories via StorageManager on add
    - _Requirements: 1.2, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  
  - [x] 3.12 Implement BudgetManager
    - Implement `setBudgetLimit(value)` — validate positive number, 0.01 to 999,999,999.99
    - Implement `clearBudgetLimit()` — remove from storage
    - Implement `isOverBudget(total)` — return true if total > limit
    - Implement `getBudgetLimit()` — return current limit or null
    - Persist via StorageManager
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_


  - [x] 3.15 Implement SortManager
    - Implement `sort(transactions, option)` with options: 'default', 'amount-desc', 'amount-asc', 'category-asc'
    - Default: reverse chronological (most recent createdAt first)
    - Amount desc: highest first
    - Amount asc: lowest first
    - Category asc: alphabetical by category, then highest amount within same category
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_


  - [x] 3.20 Implement FilterManager
    - Implement `setMonth(year, month)` — set active filter
    - Implement `clearFilter()` — remove active filter
    - Implement `getActiveMonth()` — return current filter or null
    - _Requirements: 8.2, 8.3, 8.4, 8.5, 8.6_


- [x] 4. Checkpoint - Core logic verification
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement UI rendering and event handling
  - [x] 5.1 Implement ThemeManager
    - Implement `initialize()` — load saved theme or default to 'light'
    - Implement `toggle()` — switch between light/dark, apply class to body, persist
    - Implement `apply(theme)` — add/remove `.dark-theme` class on body
    - Wire to theme toggle button click event
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_


  - [x] 5.3 Implement UIRenderer — Transaction list rendering
    - Implement `renderTransactionList(transactions)` — render each transaction with name, formatted amount (2 decimals), category, and delete button
    - Implement `showEmptyState()` — display placeholder when no transactions
    - Implement scrollable container behavior when list exceeds visible height
    - Wire delete button click events to TransactionManager.deleteTransaction
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.5_


  - [x] 5.5 Implement UIRenderer — Form handling and validation display
    - Wire Input_Form submit event to TransactionManager.addTransaction
    - Display inline validation errors below respective fields on invalid input
    - Clear form fields after successful submission
    - Implement `showValidationError(field, message)` and `clearValidationErrors()`
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 1.6_

  - [x] 5.6 Implement UIRenderer — Balance display and budget warning
    - Implement `updateBalance(total)` — display formatted total with currency label
    - Implement `showBudgetWarning(isOver)` — show/hide warning indicator near Balance_Display
    - Wire budget input field: validate and set via BudgetManager, evaluate warning on change
    - Wire budget clear action
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 10.1, 10.2, 10.3, 10.4, 10.7_

  - [x] 5.7 Implement UIRenderer — Category dropdown and custom category input
    - Implement `renderCategoryDropdown(categories)` — populate dropdown with all categories
    - Wire custom category input: validate and add via CategoryManager, re-render dropdown
    - Display validation errors for duplicate/empty category names
    - _Requirements: 1.2, 7.1, 7.2, 7.3, 7.4_

  - [x] 5.8 Implement UIRenderer — Sort control and month filter
    - Implement sort dropdown with options: Default, Amount (High→Low), Amount (Low→High), Category (A→Z)
    - Wire sort change to re-render transaction list via SortManager
    - Implement `renderMonthSelector(months)` — populate month filter with available months
    - Wire month selection to filter transactions and display monthly total
    - Wire clear filter action; auto-clear when filtered month becomes empty after deletion
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 6. Implement ChartManager (Chart.js integration)
  - [x] 6.1 Implement ChartManager with graceful degradation
    - Implement `initialize(canvasElement)` — check if Chart.js loaded, create pie chart instance
    - Implement `update(categoryTotals)` — update chart data with category names, amounts, percentages, and colors
    - Implement `destroy()` — clean up chart instance
    - Implement `showUnavailableMessage()` — display fallback when Chart.js CDN fails
    - Assign distinct colors from predefined palette to each category
    - Handle empty state (no transactions) with appropriate message
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 12.5, 12.7_

- [x] 7. Wire application initialization and integration
  - [x] 7.1 Implement app initialization and full integration
    - Create main `init()` function that runs on DOMContentLoaded
    - Load saved data from StorageManager (transactions, categories, budget, theme)
    - Initialize all managers with loaded data
    - Render initial UI state: transaction list, balance, chart, category dropdown, month selector, budget field, theme
    - Ensure add transaction flow updates: list, balance, chart, budget warning, month selector
    - Ensure delete transaction flow updates: list, balance, chart, budget warning, month selector
    - Ensure sort persists when new transactions are added
    - Ensure Chart.js CDN failure doesn't break CRUD operations
    - _Requirements: 6.3, 6.4, 9.5, 12.7, 13.1, 13.2_

- [x] 8. Final checkpoint - Full integration verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All property-based tests use fast-check library with minimum 100 iterations
- The application uses `Math.round(value * 100) / 100` for all monetary calculations to avoid floating-point drift

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "2.5", "3.1", "3.8", "3.12", "3.15", "3.20"] },
    { "id": 3, "tasks": ["3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.9", "3.10", "3.11", "3.13", "3.14", "3.16", "3.17", "3.18", "3.19", "3.21", "3.22"] },
    { "id": 4, "tasks": ["5.1", "5.3", "5.5", "5.6", "5.7", "5.8", "6.1"] },
    { "id": 5, "tasks": ["5.2", "5.4"] },
    { "id": 6, "tasks": ["7.1"] }
  ]
}
```
