// Expense & Budget Visualizer - Application Logic
// Uses IIFE module pattern for separation of concerns

/**
 * StorageManager - Handles all Local Storage read/write operations
 * with JSON serialization and graceful error handling.
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5
 */
const StorageManager = (function () {
  const KEYS = {
    TRANSACTIONS: 'ebv_transactions',
    CATEGORIES: 'ebv_categories',
    BUDGET_LIMIT: 'ebv_budget_limit',
    THEME: 'ebv_theme'
  };

  /**
   * Check if Local Storage is available and functional.
   * @returns {boolean}
   */
  function isStorageAvailable() {
    try {
      const testKey = '__ebv_storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Retrieve all transactions from Local Storage.
   * Returns an empty array if data is missing, malformed, or storage is unavailable.
   * @returns {Array} Array of transaction objects
   */
  function getTransactions() {
    if (!isStorageAvailable()) {
      return [];
    }
    try {
      const data = localStorage.getItem(KEYS.TRANSACTIONS);
      if (data === null) {
        return [];
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed;
    } catch (e) {
      return [];
    }
  }

  /**
   * Save transactions array to Local Storage.
   * Silently fails if storage is unavailable.
   * @param {Array} transactions - Array of transaction objects to persist
   */
  function saveTransactions(transactions) {
    if (!isStorageAvailable()) {
      return;
    }
    try {
      localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      // Storage quota exceeded or other write error — fail silently
    }
  }

  /**
   * Retrieve custom categories from Local Storage.
   * Returns an empty array if data is missing, malformed, or storage is unavailable.
   * @returns {Array} Array of custom category name strings
   */
  function getCustomCategories() {
    if (!isStorageAvailable()) {
      return [];
    }
    try {
      const data = localStorage.getItem(KEYS.CATEGORIES);
      if (data === null) {
        return [];
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed;
    } catch (e) {
      return [];
    }
  }

  /**
   * Save custom categories array to Local Storage.
   * Silently fails if storage is unavailable.
   * @param {Array} categories - Array of category name strings to persist
   */
  function saveCustomCategories(categories) {
    if (!isStorageAvailable()) {
      return;
    }
    try {
      localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      // Storage quota exceeded or other write error — fail silently
    }
  }

  /**
   * Retrieve the budget limit from Local Storage.
   * Returns null if no limit is set, data is malformed, or storage is unavailable.
   * @returns {number|null} The budget limit value or null
   */
  function getBudgetLimit() {
    if (!isStorageAvailable()) {
      return null;
    }
    try {
      const data = localStorage.getItem(KEYS.BUDGET_LIMIT);
      if (data === null) {
        return null;
      }
      const parsed = JSON.parse(data);
      if (typeof parsed !== 'number' || isNaN(parsed)) {
        return null;
      }
      return parsed;
    } catch (e) {
      return null;
    }
  }

  /**
   * Save the budget limit to Local Storage.
   * Pass null to remove the budget limit.
   * Silently fails if storage is unavailable.
   * @param {number|null} limit - The budget limit value or null to clear
   */
  function saveBudgetLimit(limit) {
    if (!isStorageAvailable()) {
      return;
    }
    try {
      if (limit === null) {
        localStorage.removeItem(KEYS.BUDGET_LIMIT);
      } else {
        localStorage.setItem(KEYS.BUDGET_LIMIT, JSON.stringify(limit));
      }
    } catch (e) {
      // Storage quota exceeded or other write error — fail silently
    }
  }

  /**
   * Retrieve the theme preference from Local Storage.
   * Returns null if no theme is set, data is invalid, or storage is unavailable.
   * @returns {string|null} 'light', 'dark', or null
   */
  function getTheme() {
    if (!isStorageAvailable()) {
      return null;
    }
    try {
      const data = localStorage.getItem(KEYS.THEME);
      if (data === 'light' || data === 'dark') {
        return data;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Save the theme preference to Local Storage.
   * Silently fails if storage is unavailable.
   * @param {string} theme - 'light' or 'dark'
   */
  function saveTheme(theme) {
    if (!isStorageAvailable()) {
      return;
    }
    try {
      localStorage.setItem(KEYS.THEME, theme);
    } catch (e) {
      // Storage quota exceeded or other write error — fail silently
    }
  }

  // Public API
  return {
    KEYS: KEYS,
    getTransactions: getTransactions,
    saveTransactions: saveTransactions,
    getCustomCategories: getCustomCategories,
    saveCustomCategories: saveCustomCategories,
    getBudgetLimit: getBudgetLimit,
    saveBudgetLimit: saveBudgetLimit,
    getTheme: getTheme,
    saveTheme: saveTheme
  };
})();

/**
 * CategoryManager - Manages default and custom expense categories.
 * Validates: Requirements 1.2, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6
 */
const CategoryManager = (function () {
  const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Fun'];

  /**
   * Get all categories (defaults + custom).
   * @returns {Array<string>} Combined list of default and custom categories
   */
  function getAllCategories() {
    const custom = StorageManager.getCustomCategories();
    return DEFAULT_CATEGORIES.concat(custom);
  }

  /**
   * Add a custom category with validation.
   * Validates: non-empty after trim, max 30 chars, no case-insensitive duplicates.
   * @param {string} name - Category name to add
   * @returns {object} ValidationResult { valid: boolean, errors: [{field, message}] }
   */
  function addCustomCategory(name) {
    const errors = [];

    // Validate non-empty after trim
    const trimmedName = (typeof name === 'string') ? name.trim() : '';
    if (trimmedName === '') {
      errors.push({ field: 'category', message: 'Category name is required' });
      return { valid: false, errors: errors };
    }

    // Validate max 30 characters
    if (trimmedName.length > 30) {
      errors.push({ field: 'category', message: 'Category name must be 30 characters or less' });
      return { valid: false, errors: errors };
    }

    // Validate no case-insensitive duplicates against all categories
    const allCategories = getAllCategories();
    const lowerName = trimmedName.toLowerCase();
    const isDuplicate = allCategories.some(function (cat) {
      return cat.toLowerCase() === lowerName;
    });

    if (isDuplicate) {
      errors.push({ field: 'category', message: 'Category already exists' });
      return { valid: false, errors: errors };
    }

    // Add to custom categories and persist
    const custom = StorageManager.getCustomCategories();
    custom.push(trimmedName);
    StorageManager.saveCustomCategories(custom);

    return { valid: true, errors: [] };
  }

  /**
   * Check if a category name exists in the full category list.
   * @param {string} name - Category name to check
   * @returns {boolean} True if the category exists
   */
  function isValidCategory(name) {
    if (typeof name !== 'string' || name.trim() === '') {
      return false;
    }
    const allCategories = getAllCategories();
    return allCategories.some(function (cat) {
      return cat.toLowerCase() === name.toLowerCase();
    });
  }

  // Public API
  return {
    DEFAULT_CATEGORIES: DEFAULT_CATEGORIES,
    getAllCategories: getAllCategories,
    addCustomCategory: addCustomCategory,
    isValidCategory: isValidCategory
  };
})();

/**
 * TransactionManager - Core business logic for transaction CRUD operations.
 * Validates: Requirements 1.1, 1.3, 1.4, 1.5, 1.6, 3.1, 3.2, 3.3, 3.4, 4.2, 4.3, 4.4, 4.5, 8.1
 */
const TransactionManager = (function () {
  // Load transactions from StorageManager on initialization
  let transactions = StorageManager.getTransactions();

  /**
   * Generate a unique ID using timestamp + random suffix.
   * @returns {string} Unique transaction ID
   */
  function generateId() {
    return Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
  }

  /**
   * Get current date in ISO 8601 YYYY-MM-DD format.
   * @returns {string} Date string
   */
  function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  /**
   * Add a new transaction with full validation.
   * @param {string} name - Item name
   * @param {number} amount - Transaction amount
   * @param {string} category - Category name
   * @returns {object} ValidationResult { valid: boolean, errors: [{field, message}] }
   */
  function addTransaction(name, amount, category) {
    const errors = [];

    // Validate name: non-empty after trim, max 50 chars
    const trimmedName = (typeof name === 'string') ? name.trim() : '';
    if (trimmedName === '') {
      errors.push({ field: 'name', message: 'Item name is required' });
    } else if (trimmedName.length > 50) {
      errors.push({ field: 'name', message: 'Item name must be 50 characters or less' });
    }

    // Validate amount: positive number, 0.01 to 9,999,999.99
    const numAmount = Number(amount);
    if (typeof amount !== 'number' || isNaN(numAmount) || !isFinite(numAmount)) {
      errors.push({ field: 'amount', message: 'A valid positive amount is required' });
    } else if (numAmount < 0.01 || numAmount > 9999999.99) {
      errors.push({ field: 'amount', message: 'Amount must be between 0.01 and 9,999,999.99' });
    }

    // Validate category: must exist in CategoryManager's list
    if (typeof category !== 'string' || category.trim() === '') {
      errors.push({ field: 'category', message: 'Category selection is required' });
    } else if (typeof CategoryManager !== 'undefined' && CategoryManager.isValidCategory) {
      if (!CategoryManager.isValidCategory(category)) {
        errors.push({ field: 'category', message: 'Selected category is not valid' });
      }
    }

    // If validation fails, return errors
    if (errors.length > 0) {
      return { valid: false, errors: errors };
    }

    // Round amount to 2 decimal places
    const roundedAmount = Math.round(numAmount * 100) / 100;

    // Create transaction object
    const transaction = {
      id: generateId(),
      name: trimmedName,
      amount: roundedAmount,
      category: category,
      date: getCurrentDate(),
      createdAt: Date.now()
    };

    // Add to list and persist
    transactions.push(transaction);
    StorageManager.saveTransactions(transactions);

    return { valid: true, errors: [] };
  }

  /**
   * Delete a transaction by ID.
   * @param {string} id - Transaction ID to remove
   */
  function deleteTransaction(id) {
    transactions = transactions.filter(function (t) {
      return t.id !== id;
    });
    StorageManager.saveTransactions(transactions);
  }

  /**
   * Get the total sum of all transaction amounts.
   * Uses Math.round(value * 100) / 100 to avoid floating-point drift.
   * @returns {number} Total amount
   */
  function getTotal() {
    const sum = transactions.reduce(function (acc, t) {
      return acc + t.amount;
    }, 0);
    return Math.round(sum * 100) / 100;
  }

  /**
   * Get transactions filtered by year and month.
   * @param {number} year - Full year (e.g. 2024)
   * @param {number} month - Month number (1-12)
   * @returns {Array} Filtered transactions
   */
  function getByMonth(year, month) {
    return transactions.filter(function (t) {
      if (!t.date || typeof t.date !== 'string') {
        return false;
      }
      const parts = t.date.split('-');
      const tYear = parseInt(parts[0], 10);
      const tMonth = parseInt(parts[1], 10);
      return tYear === year && tMonth === month;
    });
  }

  /**
   * Get a Map of category names to their total amounts.
   * Categories with zero total are not included.
   * @returns {Map<string, number>} Category totals
   */
  function getCategoryTotals() {
    const totals = new Map();
    transactions.forEach(function (t) {
      const current = totals.get(t.category) || 0;
      totals.set(t.category, Math.round((current + t.amount) * 100) / 100);
    });
    return totals;
  }

  /**
   * Get distinct year/month pairs from all transactions.
   * @returns {Array<{year: number, month: number}>} Available months
   */
  function getAvailableMonths() {
    const monthSet = new Map();
    transactions.forEach(function (t) {
      if (!t.date || typeof t.date !== 'string') {
        return;
      }
      const parts = t.date.split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const key = year + '-' + month;
      if (!monthSet.has(key)) {
        monthSet.set(key, { year: year, month: month });
      }
    });
    return Array.from(monthSet.values());
  }

  /**
   * Get all transactions (for rendering/sorting).
   * @returns {Array} All transactions
   */
  function getAll() {
    return transactions.slice();
  }

  // Public API
  return {
    addTransaction: addTransaction,
    deleteTransaction: deleteTransaction,
    getTotal: getTotal,
    getByMonth: getByMonth,
    getCategoryTotals: getCategoryTotals,
    getAvailableMonths: getAvailableMonths,
    getAll: getAll
  };
})();

/**
 * BudgetManager - Handles budget limit logic and warning state evaluation.
 * Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7
 */
const BudgetManager = (function () {
  // Load initial budget limit from storage on module initialization
  let budgetLimit = StorageManager.getBudgetLimit();

  /**
   * Set the budget limit with validation.
   * Validates: positive number, not NaN, not Infinity, range 0.01 to 999,999,999.99.
   * If validation fails, the previous budget limit is retained.
   * @param {number} value - The budget limit value to set
   * @returns {object} ValidationResult { valid: boolean, errors: [{field, message}] }
   */
  function setBudgetLimit(value) {
    const errors = [];

    const numValue = Number(value);
    if (typeof value !== 'number' || isNaN(numValue) || !isFinite(numValue)) {
      errors.push({ field: 'budget', message: 'A valid positive budget limit is required' });
      return { valid: false, errors: errors };
    }

    if (numValue < 0.01 || numValue > 999999999.99) {
      errors.push({ field: 'budget', message: 'Budget limit must be between 0.01 and 999,999,999.99' });
      return { valid: false, errors: errors };
    }

    // Validation passed — update and persist
    budgetLimit = Math.round(numValue * 100) / 100;
    StorageManager.saveBudgetLimit(budgetLimit);

    return { valid: true, errors: [] };
  }

  /**
   * Clear the budget limit and remove from storage.
   */
  function clearBudgetLimit() {
    budgetLimit = null;
    StorageManager.saveBudgetLimit(null);
  }

  /**
   * Check if the given total exceeds the budget limit.
   * Returns true if and only if total > limit (not >=).
   * Returns false if no budget limit is set.
   * @param {number} total - The total expense amount to check
   * @returns {boolean} True if over budget
   */
  function isOverBudget(total) {
    if (budgetLimit === null) {
      return false;
    }
    return total > budgetLimit;
  }

  /**
   * Get the current budget limit.
   * @returns {number|null} The current budget limit or null if none set
   */
  function getBudgetLimit() {
    return budgetLimit;
  }

  // Public API
  return {
    setBudgetLimit: setBudgetLimit,
    clearBudgetLimit: clearBudgetLimit,
    isOverBudget: isOverBudget,
    getBudgetLimit: getBudgetLimit
  };
})();

/**
 * SortManager - Manages sort state and sorting logic for the transaction list.
 * Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 9.6
 */
const SortManager = (function () {
  /** @type {'default'|'amount-desc'|'amount-asc'|'category-asc'} */
  let currentSort = 'default';

  /**
   * Sort transactions by the given option.
   * Returns a NEW sorted array without mutating the input.
   *
   * Options:
   * - 'default': reverse chronological (most recent createdAt first)
   * - 'amount-desc': highest amount first
   * - 'amount-asc': lowest amount first
   * - 'category-asc': alphabetical by category (A-Z), then highest amount first within same category
   *
   * @param {Array} transactions - Array of transaction objects
   * @param {string} option - Sort option: 'default', 'amount-desc', 'amount-asc', 'category-asc'
   * @returns {Array} New sorted array of transactions
   */
  function sort(transactions, option) {
    // Update the current sort state
    currentSort = option;

    // Create a shallow copy to avoid mutating the input
    var sorted = transactions.slice();

    switch (option) {
      case 'amount-desc':
        sorted.sort(function (a, b) {
          return b.amount - a.amount;
        });
        break;

      case 'amount-asc':
        sorted.sort(function (a, b) {
          return a.amount - b.amount;
        });
        break;

      case 'category-asc':
        sorted.sort(function (a, b) {
          var catA = (a.category || '').toLowerCase();
          var catB = (b.category || '').toLowerCase();
          if (catA < catB) return -1;
          if (catA > catB) return 1;
          // Same category — sort by amount descending (highest first)
          return b.amount - a.amount;
        });
        break;

      case 'default':
      default:
        // Reverse chronological: most recent createdAt first
        sorted.sort(function (a, b) {
          return (b.createdAt || 0) - (a.createdAt || 0);
        });
        break;
    }

    return sorted;
  }

  /**
   * Get the currently active sort option.
   * @returns {string} Current sort option
   */
  function getCurrentSort() {
    return currentSort;
  }

  // Public API
  return {
    sort: sort,
    getCurrentSort: getCurrentSort
  };
})();

/**
 * ThemeManager - Controls dark/light theme switching.
 * Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5
 */
const ThemeManager = (function () {
  /** @type {'light'|'dark'} */
  let currentTheme = 'light';

  /**
   * Initialize the theme manager.
   * Loads saved theme from StorageManager, defaults to 'light' if none saved.
   * Applies the theme and wires the toggle button click event.
   */
  function initialize() {
    const savedTheme = StorageManager.getTheme();
    currentTheme = savedTheme || 'light';
    apply(currentTheme);

    // Wire theme toggle button click event
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggle);
    }
  }

  /**
   * Toggle between light and dark themes.
   * Switches the current theme, applies it, and persists the preference.
   */
  function toggle() {
    currentTheme = (currentTheme === 'light') ? 'dark' : 'light';
    apply(currentTheme);
    StorageManager.saveTheme(currentTheme);
  }

  /**
   * Apply the given theme to the document body.
   * Adds or removes the 'dark-theme' class on document.body.
   * Updates the toggle button text and aria-label.
   * @param {string} theme - 'light' or 'dark'
   */
  function apply(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }

    // Update toggle button text and aria-label
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      if (theme === 'dark') {
        toggleBtn.textContent = '☀️ Light Mode';
        toggleBtn.setAttribute('aria-label', 'Switch to light theme');
      } else {
        toggleBtn.textContent = '🌙 Dark Mode';
        toggleBtn.setAttribute('aria-label', 'Switch to dark theme');
      }
    }
  }

  // Public API
  return {
    initialize: initialize,
    toggle: toggle,
    apply: apply
  };
})();

/**
 * FilterManager - Manages month filter state for filtering transactions by month.
 * Validates: Requirements 8.2, 8.3, 8.4, 8.5, 8.6
 */
const FilterManager = (function () {
  /** @type {{year: number, month: number} | null} */
  let activeMonth = null;

  /**
   * Set the active month filter.
   * @param {number} year - Full year (e.g. 2024)
   * @param {number} month - Month number (1-12)
   */
  function setMonth(year, month) {
    activeMonth = { year: year, month: month };
  }

  /**
   * Clear the active month filter, returning to unfiltered state.
   */
  function clearFilter() {
    activeMonth = null;
  }

  /**
   * Get the currently active month filter.
   * @returns {{year: number, month: number} | null} The active filter or null if no filter is set
   */
  function getActiveMonth() {
    return activeMonth;
  }

  // Public API
  return {
    setMonth: setMonth,
    clearFilter: clearFilter,
    getActiveMonth: getActiveMonth
  };
})();

/**
 * ChartManager - Wraps Chart.js interactions with graceful degradation.
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 12.5, 12.7
 */
const ChartManager = (function () {
  /** @type {Chart|null} */
  let chart = null;

  /** @type {boolean} */
  let isAvailable = false;

  /** @type {HTMLCanvasElement|null} */
  let canvasElement = null;

  /**
   * Predefined color palette with at least 10 distinct colors.
   * Colors have sufficient contrast for both light and dark themes.
   */
  const COLOR_PALETTE = [
    '#FF6384', // Red/Pink
    '#36A2EB', // Blue
    '#FFCE56', // Yellow
    '#4BC0C0', // Teal
    '#9966FF', // Purple
    '#FF9F40', // Orange
    '#C9CBCF', // Grey
    '#7BC67E', // Green
    '#E77C8E', // Rose
    '#55BFC7', // Cyan
    '#B39DDB', // Lavender
    '#FFB74D'  // Amber
  ];

  /**
   * Initialize the ChartManager.
   * Checks if Chart.js is loaded and creates a pie chart instance.
   * If Chart.js is not available, shows a fallback message.
   * @param {HTMLCanvasElement} canvas - The canvas element for the chart
   */
  function initialize(canvas) {
    canvasElement = canvas;

    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
      isAvailable = false;
      showUnavailableMessage();
      return;
    }

    isAvailable = true;

    try {
      // Create pie chart instance with empty data
      chart = new Chart(canvas, {
        type: 'pie',
        data: {
          labels: [],
          datasets: [{
            data: [],
            backgroundColor: [],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 15,
                usePointStyle: true
              }
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  var label = context.label || '';
                  var value = context.parsed || 0;
                  var total = context.dataset.data.reduce(function (a, b) { return a + b; }, 0);
                  var percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                  return label + ': $' + value.toFixed(2) + ' (' + percentage + '%)';
                }
              }
            }
          }
        }
      });
    } catch (e) {
      isAvailable = false;
      showUnavailableMessage();
    }
  }

  /**
   * Update the chart with new category totals.
   * Assigns distinct colors from the predefined palette to each category.
   * Handles empty state (no transactions) with appropriate message.
   * @param {Map<string, number>} categoryTotals - Map of category name to total amount
   */
  function update(categoryTotals) {
    if (!isAvailable || !chart) {
      return;
    }

    // Handle empty state
    if (!categoryTotals || categoryTotals.size === 0) {
      // Show empty state message
      chart.data.labels = [];
      chart.data.datasets[0].data = [];
      chart.data.datasets[0].backgroundColor = [];
      chart.update();

      // Show empty state text on canvas container
      var container = canvasElement ? canvasElement.parentElement : null;
      var emptyMsg = container ? container.querySelector('.chart-empty-state') : null;
      if (!emptyMsg && container) {
        emptyMsg = document.createElement('p');
        emptyMsg.className = 'chart-empty-state';
        emptyMsg.textContent = 'No expense data available to display.';
        container.appendChild(emptyMsg);
      }
      if (emptyMsg) {
        emptyMsg.style.display = '';
      }
      // Hide canvas when empty
      if (canvasElement) {
        canvasElement.style.display = 'none';
      }
      return;
    }

    // Remove empty state message if present
    var container = canvasElement ? canvasElement.parentElement : null;
    var emptyMsg = container ? container.querySelector('.chart-empty-state') : null;
    if (emptyMsg) {
      emptyMsg.style.display = 'none';
    }
    // Show canvas
    if (canvasElement) {
      canvasElement.style.display = '';
    }

    // Extract category names and amounts
    var labels = [];
    var data = [];
    var total = 0;

    categoryTotals.forEach(function (amount, category) {
      labels.push(category);
      data.push(amount);
      total += amount;
    });

    // Build labels with percentages
    var labelsWithPercentage = labels.map(function (label, index) {
      var percentage = total > 0 ? ((data[index] / total) * 100).toFixed(1) : '0.0';
      return label + ' (' + percentage + '%)';
    });

    // Assign colors from palette (cycle if more categories than colors)
    var colors = labels.map(function (_, index) {
      return COLOR_PALETTE[index % COLOR_PALETTE.length];
    });

    // Update chart data
    chart.data.labels = labelsWithPercentage;
    chart.data.datasets[0].data = data;
    chart.data.datasets[0].backgroundColor = colors;
    chart.update();
  }

  /**
   * Destroy the chart instance and clean up resources.
   */
  function destroy() {
    if (chart) {
      chart.destroy();
      chart = null;
    }
  }

  /**
   * Display a fallback message when Chart.js CDN fails to load.
   * Hides the canvas and shows the unavailable message element.
   */
  function showUnavailableMessage() {
    // Hide the canvas element
    if (canvasElement) {
      canvasElement.style.display = 'none';
    }

    // Show the fallback message element
    var fallbackMsg = document.getElementById('chart-unavailable');
    if (fallbackMsg) {
      fallbackMsg.classList.remove('hidden');
    }
  }

  /**
   * Check if ChartManager is available (Chart.js loaded successfully).
   * @returns {boolean}
   */
  function getIsAvailable() {
    return isAvailable;
  }

  // Public API
  return {
    initialize: initialize,
    update: update,
    destroy: destroy,
    showUnavailableMessage: showUnavailableMessage,
    isAvailable: getIsAvailable
  };
})();

/**
 * UIRenderer - Handles DOM manipulation for the transaction list display.
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.5
 */
const UIRenderer = (function () {
  /**
   * Render the transaction list into the DOM container.
   * Clears existing content and creates a list item for each transaction
   * showing name, formatted amount (2 decimals), category, and a delete button.
   * If the transactions array is empty, shows the empty state instead.
   * @param {Array} transactions - Array of transaction objects to render
   */
  function renderTransactionList(transactions) {
    var container = document.getElementById('transaction-list');
    if (!container) {
      return;
    }

    // Clear existing content
    container.innerHTML = '';

    // Show empty state if no transactions
    if (!transactions || transactions.length === 0) {
      showEmptyState();
      return;
    }

    // Render each transaction as a list item
    transactions.forEach(function (transaction) {
      var item = document.createElement('div');
      item.className = 'transaction-item';
      item.setAttribute('role', 'listitem');
      item.setAttribute('data-id', transaction.id);

      var nameSpan = document.createElement('span');
      nameSpan.className = 'transaction-name';
      nameSpan.textContent = transaction.name;

      var amountSpan = document.createElement('span');
      amountSpan.className = 'transaction-amount';
      amountSpan.textContent = '$' + transaction.amount.toFixed(2);

      var categorySpan = document.createElement('span');
      categorySpan.className = 'transaction-category';
      categorySpan.textContent = transaction.category;

      var deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.type = 'button';
      deleteBtn.textContent = 'Delete';
      deleteBtn.setAttribute('aria-label', 'Delete transaction: ' + transaction.name);
      deleteBtn.addEventListener('click', function () {
        TransactionManager.deleteTransaction(transaction.id);
        refreshUI();
      });

      item.appendChild(nameSpan);
      item.appendChild(amountSpan);
      item.appendChild(categorySpan);
      item.appendChild(deleteBtn);
      container.appendChild(item);
    });
  }

  /**
   * Display a placeholder message when no transactions exist.
   * Clears the transaction list container and shows an empty state message.
   */
  function showEmptyState() {
    var container = document.getElementById('transaction-list');
    if (!container) {
      return;
    }

    container.innerHTML = '';

    var emptyMsg = document.createElement('p');
    emptyMsg.id = 'empty-state';
    emptyMsg.className = 'empty-state';
    emptyMsg.textContent = 'No transactions recorded yet.';
    container.appendChild(emptyMsg);
  }

  /**
   * Refresh the full UI after a transaction change (add/delete).
   * Re-renders the transaction list with current sort/filter applied,
   * updates the balance display, evaluates budget warning,
   * updates the month selector, and displays monthly total when filtered.
   */
  function refreshUI() {
    // Get all transactions
    var allTransactions = TransactionManager.getAll();

    // Apply active month filter if set
    var activeMonth = FilterManager.getActiveMonth();
    var filtered = allTransactions;
    if (activeMonth) {
      filtered = TransactionManager.getByMonth(activeMonth.year, activeMonth.month);
      // Auto-clear filter if filtered month becomes empty after deletion
      if (filtered.length === 0) {
        FilterManager.clearFilter();
        activeMonth = null;
        filtered = allTransactions;
        // Reset month filter dropdown to default
        var monthFilterEl = document.getElementById('month-filter');
        if (monthFilterEl) {
          monthFilterEl.value = '';
        }
      }
    }

    // Apply current sort (read from DOM dropdown)
    var sortSelect = document.getElementById('sort-select');
    var currentSort = sortSelect ? sortSelect.value : SortManager.getCurrentSort();
    var sorted = SortManager.sort(filtered, currentSort);

    // Render the transaction list
    renderTransactionList(sorted);

    // Update balance display and evaluate budget warning
    var total = TransactionManager.getTotal();
    updateBalance(total);
    showBudgetWarning(BudgetManager.isOverBudget(total));

    // Update chart with current category totals (R12.7: graceful degradation)
    try {
      ChartManager.update(TransactionManager.getCategoryTotals());
    } catch (e) {
      // Chart.js runtime error — CRUD operations remain unaffected
    }

    // Update monthly total display
    var monthlyTotalEl = document.getElementById('monthly-total');
    if (monthlyTotalEl) {
      if (activeMonth) {
        var monthlySum = filtered.reduce(function (acc, t) {
          return acc + t.amount;
        }, 0);
        monthlySum = Math.round(monthlySum * 100) / 100;
        monthlyTotalEl.textContent = 'Monthly Total: $' + monthlySum.toFixed(2);
        monthlyTotalEl.style.display = '';
      } else {
        monthlyTotalEl.textContent = '';
        monthlyTotalEl.style.display = 'none';
      }
    }

    // Re-render month selector with current available months
    renderMonthSelector(TransactionManager.getAvailableMonths());
  }

  /**
   * Map validation field names to their corresponding DOM error element IDs.
   */
  var fieldErrorMap = {
    name: 'item-name-error',
    amount: 'item-amount-error',
    category: 'category-error'
  };

  /**
   * Display an inline validation error message below the specified field.
   * Creates or updates the error message in the corresponding error span.
   * @param {string} field - The field identifier ('name', 'amount', or 'category')
   * @param {string} message - The error message to display
   */
  function showValidationError(field, message) {
    var errorId = fieldErrorMap[field];
    if (!errorId) {
      return;
    }
    var errorEl = document.getElementById(errorId);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('validation-error');
    }
  }

  /**
   * Remove all validation error messages from the expense form.
   * Clears text content and removes the validation-error class from all error spans.
   */
  function clearValidationErrors() {
    Object.keys(fieldErrorMap).forEach(function (field) {
      var errorId = fieldErrorMap[field];
      var errorEl = document.getElementById(errorId);
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.remove('validation-error');
      }
    });
  }

  /**
   * Initialize the expense form submit handler.
   * Wires the form submit event to TransactionManager.addTransaction,
   * displays validation errors on failure, and clears the form on success.
   */
  function initFormHandler() {
    var form = document.getElementById('expense-form');
    if (!form) {
      return;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Clear previous validation errors
      clearValidationErrors();

      // Get form field values
      var nameInput = document.getElementById('item-name');
      var amountInput = document.getElementById('item-amount');
      var categorySelect = document.getElementById('category-select');

      var name = nameInput ? nameInput.value : '';
      var amount = amountInput ? parseFloat(amountInput.value) : NaN;
      var category = categorySelect ? categorySelect.value : '';

      // Call TransactionManager to add the transaction
      var result = TransactionManager.addTransaction(name, amount, category);

      if (!result.valid) {
        // Display inline validation errors
        result.errors.forEach(function (error) {
          showValidationError(error.field, error.message);
        });
        return;
      }

      // Success: clear form fields
      if (nameInput) {
        nameInput.value = '';
      }
      if (amountInput) {
        amountInput.value = '';
      }
      if (categorySelect) {
        categorySelect.value = '';
      }

      // Refresh the UI
      refreshUI();
    });
  }

  /**
   * Update the balance display with the formatted total.
   * Displays the total formatted to 2 decimal places with a "$" prefix.
   * Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5
   * @param {number} total - The total expense amount
   */
  function updateBalance(total) {
    var balanceAmount = document.getElementById('balance-amount');
    if (balanceAmount) {
      balanceAmount.textContent = '$' + total.toFixed(2);
    }
  }

  /**
   * Show or hide the budget warning indicator.
   * When shown, displays a warning message near the Balance_Display.
   * Validates: Requirements 10.3, 10.4
   * @param {boolean} isOver - Whether the budget has been exceeded
   */
  function showBudgetWarning(isOver) {
    var budgetWarning = document.getElementById('budget-warning');
    if (!budgetWarning) {
      return;
    }
    if (isOver) {
      budgetWarning.textContent = '⚠️ Warning: You have exceeded your budget!';
      budgetWarning.classList.remove('hidden');
    } else {
      budgetWarning.classList.add('hidden');
    }
  }

  /**
   * Initialize budget handler: wire set/clear budget buttons and restore saved limit.
   * Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.7
   */
  function initBudgetHandler() {
    var budgetInput = document.getElementById('budget-input');
    var setBudgetBtn = document.getElementById('budget-set-btn');
    var clearBudgetBtn = document.getElementById('budget-clear-btn');
    var budgetError = document.getElementById('budget-error');

    // Restore saved budget limit value in the input field on load
    var savedLimit = BudgetManager.getBudgetLimit();
    if (savedLimit !== null && budgetInput) {
      budgetInput.value = savedLimit;
    }

    // Wire set budget button
    if (setBudgetBtn) {
      setBudgetBtn.addEventListener('click', function () {
        // Clear previous budget error
        if (budgetError) {
          budgetError.textContent = '';
        }

        var value = budgetInput ? parseFloat(budgetInput.value) : NaN;
        var result = BudgetManager.setBudgetLimit(value);

        if (!result.valid) {
          // Show validation error
          if (budgetError) {
            budgetError.textContent = result.errors[0].message;
          }
          return;
        }

        // Valid budget set — evaluate warning state
        var total = TransactionManager.getTotal();
        showBudgetWarning(BudgetManager.isOverBudget(total));
      });
    }

    // Wire clear budget button
    if (clearBudgetBtn) {
      clearBudgetBtn.addEventListener('click', function () {
        BudgetManager.clearBudgetLimit();

        // Clear the input field
        if (budgetInput) {
          budgetInput.value = '';
        }

        // Clear any budget error
        if (budgetError) {
          budgetError.textContent = '';
        }

        // Hide the warning
        showBudgetWarning(false);
      });
    }
  }

  /**
   * Render the category dropdown with the given categories.
   * Clears existing options, adds a disabled default "Select category" option,
   * then adds an option for each category in the array.
   * Validates: Requirements 1.2, 7.1, 7.2
   * @param {Array<string>} categories - Array of category names to populate
   */
  function renderCategoryDropdown(categories) {
    var select = document.getElementById('category-select');
    if (!select) {
      return;
    }

    // Clear existing options
    select.innerHTML = '';

    // Add default disabled option
    var defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Select Category --';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    select.appendChild(defaultOption);

    // Add an option for each category
    categories.forEach(function (category) {
      var option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      select.appendChild(option);
    });
  }

  /**
   * Initialize the custom category handler.
   * Wires the #add-category-btn click event to read the custom category input,
   * validate and add via CategoryManager, re-render the dropdown, and display errors.
   * Validates: Requirements 7.1, 7.2, 7.3, 7.4
   */
  function initCategoryHandler() {
    var addCategoryBtn = document.getElementById('add-category-btn');
    var customCategoryInput = document.getElementById('custom-category-input');
    var customCategoryError = document.getElementById('custom-category-error');

    if (addCategoryBtn) {
      addCategoryBtn.addEventListener('click', function () {
        // Clear previous category error
        if (customCategoryError) {
          customCategoryError.textContent = '';
          customCategoryError.classList.remove('validation-error');
        }

        var name = customCategoryInput ? customCategoryInput.value : '';

        // Call CategoryManager to add the custom category
        var result = CategoryManager.addCustomCategory(name);

        if (!result.valid) {
          // Display validation error
          if (customCategoryError) {
            customCategoryError.textContent = result.errors[0].message;
            customCategoryError.classList.add('validation-error');
          }
          return;
        }

        // Success: re-render dropdown with updated categories and clear input
        renderCategoryDropdown(CategoryManager.getAllCategories());
        if (customCategoryInput) {
          customCategoryInput.value = '';
        }
      });
    }
  }

  /**
   * Render the month selector dropdown with available months.
   * Clears existing options, adds a default "All Months" option,
   * then adds an option for each {year, month} pair.
   * Preserves the currently active filter selection.
   * Validates: Requirements 8.2
   * @param {Array<{year: number, month: number}>} months - Available month/year pairs
   */
  function renderMonthSelector(months) {
    var select = document.getElementById('month-filter');
    if (!select) {
      return;
    }

    // Remember current selection to preserve it after re-render
    var activeMonth = FilterManager.getActiveMonth();
    var activeValue = activeMonth ? activeMonth.year + '-' + activeMonth.month : '';

    // Clear existing options
    select.innerHTML = '';

    // Add default "All Months" option
    var defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'All Months';
    select.appendChild(defaultOption);

    // Month names for readable format
    var monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Sort months in reverse chronological order (most recent first)
    var sortedMonths = months.slice().sort(function (a, b) {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });

    // Add an option for each available month
    sortedMonths.forEach(function (m) {
      var option = document.createElement('option');
      option.value = m.year + '-' + m.month;
      option.textContent = monthNames[m.month - 1] + ' ' + m.year;
      select.appendChild(option);
    });

    // Restore active selection if it still exists
    if (activeValue) {
      select.value = activeValue;
    }
  }

  /**
   * Initialize sort and filter event handlers.
   * Wires the sort dropdown, month filter dropdown, and clear filter button.
   * Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 8.2, 8.3, 8.4, 8.5, 8.6
   */
  function initSortAndFilterHandler() {
    var sortSelect = document.getElementById('sort-select');
    var monthFilter = document.getElementById('month-filter');
    var clearFilterBtn = document.getElementById('clear-filter-btn');

    // Wire sort dropdown change event
    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        refreshUI();
      });
    }

    // Wire month filter change event
    if (monthFilter) {
      monthFilter.addEventListener('change', function () {
        var value = monthFilter.value;
        if (value === '') {
          // "All Months" selected — clear filter
          FilterManager.clearFilter();
        } else {
          // Parse year-month value
          var parts = value.split('-');
          var year = parseInt(parts[0], 10);
          var month = parseInt(parts[1], 10);
          FilterManager.setMonth(year, month);
        }
        refreshUI();
      });
    }

    // Wire clear filter button
    if (clearFilterBtn) {
      clearFilterBtn.addEventListener('click', function () {
        FilterManager.clearFilter();
        // Reset month filter dropdown to default
        if (monthFilter) {
          monthFilter.value = '';
        }
        refreshUI();
      });
    }
  }

  // Public API
  return {
    renderTransactionList: renderTransactionList,
    showEmptyState: showEmptyState,
    refreshUI: refreshUI,
    updateBalance: updateBalance,
    showBudgetWarning: showBudgetWarning,
    initBudgetHandler: initBudgetHandler,
    showValidationError: showValidationError,
    clearValidationErrors: clearValidationErrors,
    initFormHandler: initFormHandler,
    renderCategoryDropdown: renderCategoryDropdown,
    initCategoryHandler: initCategoryHandler,
    renderMonthSelector: renderMonthSelector,
    initSortAndFilterHandler: initSortAndFilterHandler
  };
})();

// ---- Application Initialization ----
// Validates: Requirements 6.3, 6.4, 9.5, 12.7, 13.1, 13.2

/**
 * Main application initialization function.
 * Loads saved data from StorageManager, initializes all managers,
 * renders the initial UI state, and wires all event handlers.
 *
 * Ensures:
 * - R6.3: On load, retrieve and display all saved transactions
 * - R6.4: On load, Balance_Display shows correct total and Pie_Chart reflects stored distribution
 * - R9.5: Sort persists when new transactions are added (handled by refreshUI reading sort from DOM)
 * - R12.7: Chart.js CDN failure doesn't break CRUD operations
 * - R13.1: Initial render within 2 seconds
 * - R13.2: Balance and chart update within 100ms of data change
 */
function init() {
  // 1. Initialize theme (loads saved preference or defaults to 'light')
  ThemeManager.initialize();

  // 2. Render category dropdown with all categories (defaults + saved custom)
  UIRenderer.renderCategoryDropdown(CategoryManager.getAllCategories());

  // 3. Wire event handlers for all interactive controls
  UIRenderer.initCategoryHandler();
  UIRenderer.initFormHandler();
  UIRenderer.initBudgetHandler();
  UIRenderer.initSortAndFilterHandler();

  // 4. Render month selector with available months from saved transactions
  UIRenderer.renderMonthSelector(TransactionManager.getAvailableMonths());

  // 5. Initialize ChartManager with graceful degradation (R12.7)
  // If Chart.js CDN failed to load, ChartManager.initialize will show fallback message
  // and all CRUD operations remain fully functional
  var chartCanvas = document.getElementById('expense-chart');
  if (chartCanvas) {
    try {
      ChartManager.initialize(chartCanvas);
    } catch (e) {
      // Chart.js initialization failed — show fallback, CRUD still works
      ChartManager.showUnavailableMessage();
    }
  }

  // 6. Render initial UI state: transaction list, balance, chart, budget warning
  // This loads saved transactions (R6.3), displays correct total (R6.4),
  // reflects stored distribution in pie chart (R6.4), and evaluates budget warning
  UIRenderer.refreshUI();
}

// Run init on DOMContentLoaded to ensure DOM is ready
document.addEventListener('DOMContentLoaded', init);
