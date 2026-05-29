# Requirements Document

## Introduction

The Expense & Budget Visualizer is a standalone web application built with HTML, CSS, and Vanilla JavaScript. It allows users to track personal expenses by category, visualize spending distribution via a pie chart, set budget limits, and manage transactions — all persisted in browser Local Storage with no backend required.

## Glossary

- **Application**: The Expense & Budget Visualizer web application
- **Transaction**: A single expense entry consisting of an item name, amount, and category
- **Transaction_List**: The scrollable UI component displaying all recorded transactions
- **Input_Form**: The form component used to add new transactions
- **Balance_Display**: The UI element showing the total accumulated expenses
- **Pie_Chart**: The Chart.js-powered pie chart showing expense distribution by category
- **Category_Dropdown**: The select element listing available expense categories
- **Budget_Limit**: A user-defined spending threshold that triggers visual warnings when exceeded
- **Monthly_Summary**: A filtered view showing expenses grouped by calendar month
- **Theme_Toggle**: The UI control that switches between dark and light visual themes
- **Local_Storage**: The browser's Web Storage API used for client-side data persistence

## Requirements

### Requirement 1: Add Expense Transaction

**User Story:** As a user, I want to add an expense transaction with a name, amount, and category, so that I can track my spending.

#### Acceptance Criteria

1. THE Input_Form SHALL display fields for item name (text input, maximum 50 characters), amount (numeric input accepting values from 0.01 to 9,999,999.99 with up to 2 decimal places), and category (dropdown selection)
2. THE Category_Dropdown SHALL include the default options: Food, Transport, and Fun
3. WHEN the user submits the Input_Form with valid data, THE Application SHALL create a new Transaction, add it to the Transaction_List, and clear all Input_Form fields to their default state
4. WHEN the user submits the Input_Form with an empty or whitespace-only item name, THE Application SHALL display a validation error indicating the item name is required and prevent submission
5. WHEN the user submits the Input_Form with an amount that is zero, negative, non-numeric, or exceeds 9,999,999.99, THE Application SHALL display a validation error indicating a valid positive amount is required and prevent submission
6. WHEN the user submits the Input_Form with no category selected, THE Application SHALL display a validation error indicating a category selection is required and prevent submission

### Requirement 2: Display Transaction List

**User Story:** As a user, I want to see a scrollable list of all my transactions, so that I can review my spending history.

#### Acceptance Criteria

1. THE Transaction_List SHALL display each Transaction with its item name, amount (formatted to two decimal places), and category
2. THE Transaction_List SHALL display Transactions in reverse chronological order, with the most recently added Transaction appearing first
3. WHEN the number of Transactions exceeds the visible container height, THE Transaction_List SHALL become scrollable to allow access to all entries
4. THE Transaction_List SHALL display a delete button for each Transaction entry
5. IF there are no Transactions recorded, THEN THE Transaction_List SHALL display a placeholder message indicating that no transactions exist

### Requirement 3: Delete Transaction

**User Story:** As a user, I want to delete a transaction from the list, so that I can correct mistakes or remove unwanted entries.

#### Acceptance Criteria

1. WHEN the user clicks the delete button on a Transaction, THE Application SHALL immediately remove that Transaction from the Transaction_List without requiring a confirmation step
2. WHEN a Transaction is deleted, THE Application SHALL subtract the deleted Transaction's amount from the Balance_Display total
3. WHEN a Transaction is deleted, THE Application SHALL update the Pie_Chart to reflect the new category distribution
4. WHEN a Transaction is deleted, THE Application SHALL persist the updated transaction list to Local_Storage
5. WHEN the last Transaction is deleted from the Transaction_List, THE Application SHALL display the Balance_Display as zero and show an empty state in the Transaction_List

### Requirement 4: Display Total Balance

**User Story:** As a user, I want to see my total expenses prominently displayed, so that I can quickly understand my overall spending.

#### Acceptance Criteria

1. THE Balance_Display SHALL be positioned at the top of the Application interface with a larger font size than the Transaction_List entries to establish visual hierarchy
2. THE Balance_Display SHALL show the sum of all Transaction amounts formatted to exactly two decimal places with a currency label prefix
3. WHEN the Application has no Transactions, THE Balance_Display SHALL display a total of 0.00
4. WHEN a Transaction is added, THE Balance_Display SHALL update to reflect the new sum of all Transaction amounts
5. WHEN a Transaction is removed, THE Balance_Display SHALL update to reflect the new sum of all Transaction amounts

### Requirement 5: Visualize Expenses by Category

**User Story:** As a user, I want to see a pie chart of my expenses by category, so that I can understand my spending distribution visually.

#### Acceptance Criteria

1. THE Pie_Chart SHALL display one segment per category, where each segment's size represents the sum of Transaction amounts in that category as a proportion of total expenses
2. THE Pie_Chart SHALL be rendered using Chart.js loaded via CDN
3. THE Pie_Chart SHALL label each segment with the category name and its corresponding percentage of total expenses
4. THE Pie_Chart SHALL assign a visually distinct color to each category segment
5. WHEN a Transaction is added, THE Pie_Chart SHALL update to reflect the new distribution without requiring a page reload
6. WHEN a Transaction is removed, THE Pie_Chart SHALL update to reflect the new distribution without requiring a page reload
7. WHEN all Transactions in a category are removed, THE Pie_Chart SHALL remove that category segment from the visualization
8. IF no Transactions exist, THEN THE Pie_Chart SHALL display an empty state indicating no expense data is available

### Requirement 6: Persist Data in Local Storage

**User Story:** As a user, I want my transaction data to persist across page refreshes, so that I do not lose my expense history.

#### Acceptance Criteria

1. WHEN a Transaction is added, THE Application SHALL save the complete updated transaction list to Local_Storage, preserving each Transaction's item name, amount, and category
2. WHEN a Transaction is deleted, THE Application SHALL save the complete updated transaction list to Local_Storage
3. WHEN the Application loads and Local_Storage contains previously saved Transactions, THE Application SHALL retrieve and display all Transactions in the Transaction_List with their item name, amount, and category intact
4. WHEN the Application loads with existing data in Local_Storage, THE Balance_Display SHALL show the correct total of all stored Transaction amounts and THE Pie_Chart SHALL reflect the stored category distribution
5. IF the Application loads and Local_Storage contains no transaction data or the stored data is malformed, THEN THE Application SHALL display an empty Transaction_List with a zero balance and an empty Pie_Chart without displaying an error to the user

### Requirement 7: Custom Categories

**User Story:** As a user, I want to add custom expense categories, so that I can categorize my spending beyond the default options.

#### Acceptance Criteria

1. THE Application SHALL provide a mechanism for users to add a new category name with a maximum length of 30 characters
2. WHEN the user adds a valid custom category, THE Application SHALL append it to the Category_Dropdown
3. IF the user attempts to add a category name that is empty or contains only whitespace characters, THEN THE Application SHALL display a validation error and prevent addition
4. IF the user attempts to add a category name that matches an existing category (default or custom) using case-insensitive comparison, THEN THE Application SHALL display a validation error and prevent duplication
5. WHEN a custom category is added, THE Application SHALL persist the updated custom categories list to Local_Storage
6. WHEN the Application loads, THE Category_Dropdown SHALL include all previously saved custom categories in addition to the default categories

### Requirement 8: Monthly Summary View

**User Story:** As a user, I want to filter or view my expenses by month, so that I can understand my spending patterns over time.

#### Acceptance Criteria

1. WHEN a Transaction is created, THE Application SHALL automatically assign the current date (year and month) to that Transaction
2. THE Application SHALL provide a month selection control that lists all calendar months for which at least one Transaction exists
3. WHEN the user selects a specific month, THE Application SHALL display only Transactions whose assigned date falls within that calendar month in the Transaction_List
4. WHILE a month filter is active, THE Monthly_Summary SHALL display the total expenses for the selected month
5. WHEN the user clears the month filter, THE Application SHALL display all Transactions in the Transaction_List and update the Monthly_Summary to show the total of all expenses
6. IF the selected month contains no Transactions after a deletion, THEN THE Application SHALL clear the month filter and display all Transactions

### Requirement 9: Sort Transactions

**User Story:** As a user, I want to sort my transaction list by amount or category, so that I can organize and analyze my expenses.

#### Acceptance Criteria

1. THE Application SHALL provide a sort control for the Transaction_List with the following options: sort by amount (highest first), sort by amount (lowest first), and sort by category (A–Z)
2. WHEN the user selects sort by amount (highest first), THE Transaction_List SHALL reorder Transactions from highest to lowest amount
3. WHEN the user selects sort by amount (lowest first), THE Transaction_List SHALL reorder Transactions from lowest to highest amount
4. WHEN the user selects sort by category, THE Transaction_List SHALL reorder Transactions alphabetically (A–Z) by category name, and Transactions within the same category SHALL be ordered from highest to lowest amount
5. WHEN a new Transaction is added while a sort option is active, THE Transaction_List SHALL maintain the currently selected sort order
6. WHEN the Application loads, THE Transaction_List SHALL display Transactions in the order they were added (most recent last) until the user selects a sort option

### Requirement 10: Spending Limit Warning

**User Story:** As a user, I want to set a budget limit and receive a visual warning when I exceed it, so that I can stay within my spending goals.

#### Acceptance Criteria

1. THE Application SHALL provide a numeric input field for the user to define a Budget_Limit value accepting values from 0.01 to 999,999,999.99
2. WHEN the user enters a Budget_Limit value that is zero, negative, non-numeric, or empty, THE Application SHALL display a validation error and retain the previous Budget_Limit value
3. WHEN the total expenses exceed the Budget_Limit, THE Application SHALL display a visual warning indicator adjacent to or surrounding the Balance_Display that is visible without scrolling
4. WHEN the total expenses drop below the Budget_Limit after a deletion, THE Application SHALL remove the visual warning indicator
5. WHEN the user sets or updates a valid Budget_Limit value, THE Application SHALL persist the Budget_Limit value to Local_Storage
6. WHEN the Application loads with a saved Budget_Limit, THE Application SHALL restore the Budget_Limit in the input field and evaluate the warning state against the current total expenses
7. WHEN the user clears the Budget_Limit value and confirms removal, THE Application SHALL remove the Budget_Limit from Local_Storage and hide the warning indicator

### Requirement 11: Dark and Light Theme Toggle

**User Story:** As a user, I want to switch between dark and light themes, so that I can use the application comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Application SHALL display a Theme_Toggle button that is visible and accessible from the main interface at all times
2. WHEN the user activates the Theme_Toggle, THE Application SHALL switch the color scheme from dark to light or from light to dark, and the Theme_Toggle SHALL visually indicate the currently active theme
3. WHEN the user activates the Theme_Toggle, THE Application SHALL persist the selected theme preference to Local_Storage
4. WHEN the Application loads with a previously saved theme preference in Local_Storage, THE Application SHALL apply the saved theme
5. IF no theme preference exists in Local_Storage when the Application loads, THEN THE Application SHALL apply the light theme as the default

### Requirement 12: Technical Constraints

**User Story:** As a developer, I want the application to follow specific technical constraints, so that it remains simple, maintainable, and portable.

#### Acceptance Criteria

1. THE Application SHALL consist of exactly one HTML file (index.html) at the project root
2. THE Application SHALL use exactly one CSS file located at css/style.css
3. THE Application SHALL use exactly one JavaScript file located at js/app.js
4. THE Application SHALL use only HTML, CSS, and Vanilla JavaScript with no external UI or state management frameworks
5. THE Application SHALL use Chart.js loaded via CDN as the only external library
6. THE Application SHALL function correctly on the latest 2 major versions of Chrome, Firefox, Edge, and Safari
7. IF the Chart.js CDN resource fails to load, THEN THE Application SHALL remain usable for adding, deleting, and viewing Transactions, with the Pie_Chart area displaying a message indicating that the chart is unavailable

### Requirement 13: Non-Functional Quality

**User Story:** As a user, I want the application to be fast, visually clean, and easy to use, so that managing expenses is a pleasant experience.

#### Acceptance Criteria

1. THE Application SHALL render the initial interface within 2 seconds on a connection with at least 10 Mbps download speed
2. THE Application SHALL update the Balance_Display and Pie_Chart within 100 milliseconds of a data change
3. THE Application SHALL present a single-page interface where the Input_Form, Balance_Display, Pie_Chart, and Transaction_List are all visible without requiring navigation to separate pages
4. THE Application SHALL use a minimum body font size of 16px and maintain a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text as defined by WCAG 2.1 Level AA
5. THE Application SHALL display all interactive elements and content without horizontal scrolling on viewports from 768px to 1440px wide
6. WHILE the viewport width is between 768px and 1023px, THE Application SHALL stack layout sections vertically so that all controls remain tappable with a minimum touch target size of 44x44 pixels
