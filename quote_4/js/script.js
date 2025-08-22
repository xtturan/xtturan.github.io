// Mobile-Optimized Document Generator for TWT International
// Main JavaScript Functions

// Global Variables
let products = [];
window.products = products; // Make it globally accessible
let currentStep = 1;
let isDarkMode = false;
let isBengali = false;
let clients = JSON.parse(localStorage.getItem('twtClients') || '[]');
let fabOpen = false;

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadClients();
    setCurrentDate();
    generateDocNumber();
    bindEvents();
    checkOrientation();
});

// Initialize App
function initializeApp() {
    try {
        // Check for saved theme
        const savedTheme = localStorage.getItem('twtTheme');
        if (savedTheme === 'dark') {
            toggleDarkMode();
        }
        
        // Check for required dependencies
        checkDependencies().then(() => {
            console.log('All dependencies loaded successfully');
        }).catch(error => {
            console.warn('Some dependencies may not be available:', error);
        });
        
        // Initialize products array
        if (!window.products) {
            window.products = [];
            products = [];
        }
        
        // Auto-save functionality
        setInterval(autoSave, 30000); // Auto-save every 30 seconds
        
        // Add swipe gestures for mobile
        addSwipeGestures();
        
        // Add pull-to-refresh
        addPullToRefresh();
        
        // Ensure all required elements exist
        const requiredElements = [
            'docType', 'docNo', 'docDate', 'clientName', 'clientAddress',
            'clientPhone', 'clientEmail', 'currency', 'subtotal', 'totalAmount'
        ];
        
        const missingElements = [];
        requiredElements.forEach(id => {
            if (!document.getElementById(id)) {
                missingElements.push(id);
            }
        });
        
        if (missingElements.length > 0) {
            console.warn('Missing form elements:', missingElements);
        }
        
        console.log('TWT Document Generator v4.6 Initialized');
        
        // Initialize filename toggle button
        updateFilenameToggleButton();
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

// Toggle filename prompt setting
function toggleFilenamePrompt() {
    const currentSetting = localStorage.getItem('skipFilenamePrompt') === 'true';
    const newSetting = !currentSetting;
    
    localStorage.setItem('skipFilenamePrompt', newSetting.toString());
    updateFilenameToggleButton();
    
    const message = newSetting ? 
        'Filename prompt disabled - PNG will use auto-generated names' : 
        'Filename prompt enabled - You can customize PNG names';
    
    showToast(message, 'info');
}

// Update filename toggle button
function updateFilenameToggleButton() {
    const skipPrompt = localStorage.getItem('skipFilenamePrompt') === 'true';
    const btn = document.getElementById('filenameToggleBtn');
    const text = document.getElementById('filenameToggleText');
    
    if (btn && text) {
        if (skipPrompt) {
            btn.className = 'btn btn-warning w-100';
            text.textContent = 'Auto Name';
            btn.title = 'Click to enable filename prompt';
        } else {
            btn.className = 'btn btn-outline-primary w-100';
            text.textContent = 'Custom Name';
            btn.title = 'Click to disable filename prompt';
        }
    }
}

// Check for required dependencies
async function checkDependencies() {
    console.log('Checking dependencies...');
    
    const requiredLibraries = [
        { name: 'html2canvas', check: () => typeof html2canvas !== 'undefined' },
        { name: 'QRCode', check: () => typeof QRCode !== 'undefined' },
        { name: 'Bootstrap', check: () => typeof bootstrap !== 'undefined' }
    ];
    
    for (const lib of requiredLibraries) {
        let retries = 0;
        while (!lib.check() && retries < 20) { // Increased retries for GitHub Pages
            console.log(`Waiting for ${lib.name} to load... attempt ${retries + 1}`);
            await new Promise(resolve => setTimeout(resolve, 250));
            retries++;
        }
        
        if (lib.check()) {
            console.log(`✓ ${lib.name} loaded successfully`);
        } else {
            console.warn(`⚠ ${lib.name} failed to load after ${retries} attempts`);
            if (lib.name === 'html2canvas') {
                // Critical dependency
                throw new Error(`${lib.name} is required but failed to load`);
            }
        }
    }
    
    console.log('Dependency check completed');
}

// Bind Event Listeners
function bindEvents() {
    // Document type change
    document.getElementById('docType').addEventListener('change', function() {
        if (this.value === 'CUSTOM') {
            document.getElementById('customTypeDiv').style.display = 'block';
        } else {
            document.getElementById('customTypeDiv').style.display = 'none';
        }
        updateProgress(1);
    });
    
    // Bank account change - handle existing select elements
    document.addEventListener('change', function(e) {
        if (e.target.matches('select[name="bankAccount"]')) {
            const item = e.target.closest('.bank-account-item');
            const customTextarea = item.querySelector('.custom-bank-details');
            if (e.target.value === 'custom') {
                customTextarea.style.display = 'block';
            } else {
                customTextarea.style.display = 'none';
            }
        }
    });

    // Remove bank account handler
    document.addEventListener('click', function(e) {
        if (e.target.matches('.remove-bank')) {
            const item = e.target.closest('.bank-account-item');
            item.remove();
            updateRemoveButtons();
        }
    });

    // Remove office handler
    document.addEventListener('click', function(e) {
        if (e.target.matches('.remove-office')) {
            const item = e.target.closest('.office-address-item');
            item.remove();
            updateOfficeRemoveButtons();
        }
    });
    
    // Form validation on input
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearValidation);
    });
    
    // Window resize handler
    window.addEventListener('resize', handleResize);
    
    // Orientation change
    window.addEventListener('orientationchange', function() {
        setTimeout(checkOrientation, 100);
    });
    
    // Initialize remove buttons on page load
    setTimeout(() => {
        updateRemoveButtons();
        updateOfficeRemoveButtons();
    }, 100);
}

// Set Current Date
function setCurrentDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('docDate').value = today;
}

// Generate Document Number
function generateDocNumber() {
    const prefix = 'TWT';
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    const docNumber = `${prefix}${year}${month}${random}`;
    document.getElementById('docNo').value = docNumber;
}

// Progress Management
function updateProgress(step) {
    currentStep = Math.max(currentStep, step);
    const progress = (step / 6) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    
    // Show/hide steps based on progress
    for (let i = 1; i <= 6; i++) {
        const stepElement = document.getElementById(`step${i}`);
        if (stepElement) {
            if (i <= step + 1) {
                stepElement.style.display = 'block';
            }
        }
    }
}

// Client Management
function loadClients() {
    const select = document.getElementById('clientSelect');
    select.innerHTML = '<option value="">Select existing client...</option>';
    
    clients.forEach((client, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = client.name;
        select.appendChild(option);
    });
}

function loadClient() {
    const select = document.getElementById('clientSelect');
    const index = select.value;
    
    if (index !== '' && clients[index]) {
        const client = clients[index];
        document.getElementById('clientName').value = client.name;
        document.getElementById('clientAddress').value = client.address;
        document.getElementById('clientPhone').value = client.phone || '';
        document.getElementById('clientEmail').value = client.email || '';
        updateProgress(3);
    }
}

function clearClient() {
    document.getElementById('clientSelect').value = '';
    document.getElementById('clientName').value = '';
    document.getElementById('clientAddress').value = '';
    document.getElementById('clientPhone').value = '';
    document.getElementById('clientEmail').value = '';
}

function saveClient() {
    const name = document.getElementById('clientName').value.trim();
    const address = document.getElementById('clientAddress').value.trim();
    const phone = document.getElementById('clientPhone').value.trim();
    const email = document.getElementById('clientEmail').value.trim();
    
    if (!name) {
        showToast('Please enter client name to save', 'warning');
        return;
    }
    
    // Check if client already exists
    const existingIndex = clients.findIndex(c => c.name.toLowerCase() === name.toLowerCase());
    
    const clientData = { 
        name, 
        address: address || 'Address not provided', 
        phone, 
        email 
    };
    
    if (existingIndex >= 0) {
        clients[existingIndex] = clientData;
        showToast('Client updated successfully', 'success');
    } else {
        clients.push(clientData);
        showToast('Client saved successfully', 'success');
    }
    
    // Save to localStorage
    try {
        localStorage.setItem('twtClients', JSON.stringify(clients));
        loadClients(); // Refresh the dropdown
    } catch (error) {
        console.error('Error saving client:', error);
        showToast('Error saving client: Storage full', 'error');
    }
}

// Product Management
function addProduct() {
    const product = {
        id: Date.now(),
        name: '',
        description: '',
        model: '',
        weight: '',
        specialDetails: '',
        quantity: 1,
        unit: 'PCS',
        rate: 0,
        amount: 0
    };
    
    products.push(product);
    window.products = products; // Update global reference
    renderProducts();
    updateProgress(5);
    
    // Scroll to new product on mobile
    if (window.innerWidth < 768) {
        setTimeout(() => {
            const newProduct = document.querySelector(`[data-product-id="${product.id}"]`);
            if (newProduct) {
                newProduct.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    }
}

function removeProduct(id) {
    if (confirm('Remove this product?')) {
        products = products.filter(p => p.id !== id);
        window.products = products; // Update global reference
        renderProducts();
        calculateSubtotal();
    }
}

function renderProducts() {
    // Mobile view
    const mobileList = document.getElementById('productList');
    mobileList.innerHTML = '';
    
    // Desktop table
    const tableBody = document.querySelector('#productTable tbody');
    tableBody.innerHTML = '';
    
    products.forEach((product, index) => {
        // Mobile card
        const mobileCard = createMobileProductCard(product, index);
        mobileList.appendChild(mobileCard);
        
        // Desktop row
        const desktopRow = createDesktopProductRow(product, index);
        tableBody.appendChild(desktopRow);
    });
    
    if (products.length === 0) {
        mobileList.innerHTML = '<div class="text-center text-muted p-3">No products added yet. Tap "Add Product" to start.</div>';
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center text-muted p-3">No products added yet</td></tr>';
    }
}

function createMobileProductCard(product, index) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-product-id', product.id);
    
    card.innerHTML = `
        <button class="btn btn-danger btn-sm delete-btn" onclick="removeProduct(${product.id})">
            <i class="fas fa-times"></i>
        </button>
        <div class="row g-2">
            <div class="col-12">
                <label class="form-label fw-bold">#${index + 1} Product Name</label>
                <input type="text" class="form-control" value="${product.name || ''}" 
                       placeholder="Enter product name"
                       onchange="updateProduct(${product.id}, 'name', this.value)">
            </div>
            <div class="col-12">
                <label class="form-label">Description</label>
                <textarea class="form-control" rows="2" placeholder="Product description"
                       onchange="updateProduct(${product.id}, 'description', this.value)">${product.description || ''}</textarea>
            </div>
            <div class="col-6">
                <label class="form-label">Model Number</label>
                <input type="text" class="form-control" value="${product.model || ''}" 
                       placeholder="Model/SKU"
                       onchange="updateProduct(${product.id}, 'model', this.value)">
            </div>
            <div class="col-6">
                <label class="form-label">Weight/Specifications</label>
                <input type="text" class="form-control" value="${product.weight || ''}" 
                       placeholder="e.g., 25kg/bag"
                       onchange="updateProduct(${product.id}, 'weight', this.value)">
            </div>
            <div class="col-12">
                <label class="form-label">Special Details</label>
                <input type="text" class="form-control" value="${product.specialDetails || ''}" 
                       placeholder="Color, size, grade, etc."
                       onchange="updateProduct(${product.id}, 'specialDetails', this.value)">
            </div>
            <div class="col-4">
                <label class="form-label">Quantity</label>
                <input type="number" class="form-control" value="${product.quantity}" min="1"
                       onchange="updateProduct(${product.id}, 'quantity', this.value)">
            </div>
            <div class="col-4">
                <label class="form-label">Unit</label>
                <select class="form-select" onchange="updateProduct(${product.id}, 'unit', this.value)">
                    <option value="PCS" ${product.unit === 'PCS' ? 'selected' : ''}>PCS</option>
                    <option value="KG" ${product.unit === 'KG' ? 'selected' : ''}>KG</option>
                    <option value="MT" ${product.unit === 'MT' ? 'selected' : ''}>MT</option>
                    <option value="CTN" ${product.unit === 'CTN' ? 'selected' : ''}>CTN</option>
                    <option value="BAG" ${product.unit === 'BAG' ? 'selected' : ''}>BAG</option>
                    <option value="BOX" ${product.unit === 'BOX' ? 'selected' : ''}>BOX</option>
                    <option value="ROLL" ${product.unit === 'ROLL' ? 'selected' : ''}>ROLL</option>
                    <option value="SET" ${product.unit === 'SET' ? 'selected' : ''}>SET</option>
                </select>
            </div>
            <div class="col-4">
                <label class="form-label">Rate</label>
                <input type="number" class="form-control" value="${product.rate}" min="0" step="0.01"
                       onchange="updateProduct(${product.id}, 'rate', this.value)">
            </div>
            <div class="col-12">
                <label class="form-label">Amount</label>
                <input type="number" class="form-control fw-bold bg-light" value="${product.amount.toFixed(2)}" readonly>
            </div>
        </div>
    `;
    
    return card;
}

function createDesktopProductRow(product, index) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${index + 1}</td>
        <td>
            <input type="text" class="form-control form-control-sm" value="${product.name || ''}"
                   onchange="updateProduct(${product.id}, 'name', this.value)" placeholder="Product name">
        </td>
        <td>
            <input type="text" class="form-control form-control-sm" value="${product.description || ''}"
                   onchange="updateProduct(${product.id}, 'description', this.value)" placeholder="Description">
        </td>
        <td>
            <input type="text" class="form-control form-control-sm" value="${product.model || ''}"
                   onchange="updateProduct(${product.id}, 'model', this.value)" placeholder="Model">
        </td>
        <td>
            <input type="number" class="form-control form-control-sm" value="${product.quantity || ''}" min="1"
                   onchange="updateProduct(${product.id}, 'quantity', this.value)" placeholder="Qty">
        </td>
        <td>
            <select class="form-select form-select-sm" onchange="updateProduct(${product.id}, 'unit', this.value)">
                <option value="PCS" ${product.unit === 'PCS' ? 'selected' : ''}>PCS</option>
                <option value="KG" ${product.unit === 'KG' ? 'selected' : ''}>KG</option>
                <option value="MT" ${product.unit === 'MT' ? 'selected' : ''}>MT</option>
                <option value="CTN" ${product.unit === 'CTN' ? 'selected' : ''}>CTN</option>
                <option value="BAG" ${product.unit === 'BAG' ? 'selected' : ''}>BAG</option>
                <option value="BOX" ${product.unit === 'BOX' ? 'selected' : ''}>BOX</option>
            </select>
        </td>
        <td>
            <input type="text" class="form-control form-control-sm" value="${product.weight || ''}"
                   placeholder="25kg/bag"
                   onchange="updateProduct(${product.id}, 'weight', this.value)">
        </td>
        <td>
            <input type="text" class="form-control form-control-sm" value="${product.specialDetails || ''}"
                   placeholder="Special details"
                   onchange="updateProduct(${product.id}, 'specialDetails', this.value)">
        </td>
        <td>
            <input type="number" class="form-control form-control-sm" value="${product.rate || ''}" min="0" step="0.01"
                   onchange="updateProduct(${product.id}, 'rate', this.value)" placeholder="Rate">
        </td>
        <td class="fw-bold">${(product.amount || 0).toFixed(2)}</td>
        <td>
            <button class="btn btn-danger btn-sm" onclick="removeProduct(${product.id})">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    return row;
}

function updateProduct(id, field, value) {
    const product = products.find(p => p.id === id);
    if (product) {
        product[field] = field === 'quantity' || field === 'rate' ? parseFloat(value) || 0 : value;
        
        // Calculate amount
        product.amount = product.quantity * product.rate;
        
        // Re-render products
        renderProducts();
        calculateSubtotal();
    }
}

// Financial Calculations
function calculateSubtotal() {
    const subtotal = products.reduce((sum, product) => sum + product.amount, 0);
    document.getElementById('subtotal').value = subtotal.toFixed(2);
    calculateTotal();
}

function calculateTotal() {
    const subtotal = parseFloat(document.getElementById('subtotal').value) || 0;
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    const shipping = parseFloat(document.getElementById('shipping').value) || 0;
    const tax = parseFloat(document.getElementById('tax').value) || 0;
    
    const discountAmount = (subtotal * discount) / 100;
    const taxableAmount = subtotal - discountAmount + shipping;
    const taxAmount = (taxableAmount * tax) / 100;
    const total = taxableAmount + taxAmount;
    
    document.getElementById('totalAmount').value = total.toFixed(2);
    document.getElementById('amountWords').value = numberToWords(total);
    
    calculateBalance();
    updateProgress(6);
}

function calculateBalance() {
    const total = parseFloat(document.getElementById('totalAmount').value) || 0;
    const advance = parseFloat(document.getElementById('advance').value) || 0;
    const balance = total - advance;
    
    document.getElementById('balance').value = balance.toFixed(2);
}

// Number to Words Conversion
function numberToWords(num) {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num === 0) return 'Zero Taka Only';
    
    const convertGroup = (n) => {
        let result = '';
        
        if (n >= 100) {
            result += ones[Math.floor(n / 100)] + ' Hundred ';
            n %= 100;
        }
        
        if (n >= 20) {
            result += tens[Math.floor(n / 10)] + ' ';
            n %= 10;
        } else if (n >= 10) {
            result += teens[n - 10] + ' ';
            return result;
        }
        
        if (n > 0) {
            result += ones[n] + ' ';
        }
        
        return result;
    };
    
    const integerPart = Math.floor(num);
    const decimalPart = Math.round((num - integerPart) * 100);
    
    let result = '';
    
    if (integerPart >= 10000000) {
        result += convertGroup(Math.floor(integerPart / 10000000)) + 'Crore ';
        integerPart %= 10000000;
    }
    
    if (integerPart >= 100000) {
        result += convertGroup(Math.floor(integerPart / 100000)) + 'Lakh ';
        integerPart %= 100000;
    }
    
    if (integerPart >= 1000) {
        result += convertGroup(Math.floor(integerPart / 1000)) + 'Thousand ';
        integerPart %= 1000;
    }
    
    if (integerPart > 0) {
        result += convertGroup(integerPart);
    }
    
    result += 'Taka';
    
    if (decimalPart > 0) {
        result += ' and ' + convertGroup(decimalPart) + 'Paisa';
    }
    
    return result.trim() + ' Only';
}

// UI Functions
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('twtTheme', isDarkMode ? 'dark' : 'light');
    
    // Update button text
    const btn = document.querySelector('[onclick="toggleDarkMode()"]');
    if (btn) {
        btn.innerHTML = isDarkMode ? 
            '<i class="fas fa-sun"></i> Light Mode' : 
            '<i class="fas fa-moon"></i> Dark Mode';
    }
}

function toggleFab() {
    fabOpen = !fabOpen;
    const fabMain = document.querySelector('.fab-main');
    const fabMenu = document.querySelector('.fab-menu');
    
    if (fabOpen) {
        fabMain.classList.add('active');
        fabMenu.classList.add('show');
    } else {
        fabMain.classList.remove('active');
        fabMenu.classList.remove('show');
    }
}

// Document Management
function newDoc() {
    if (confirm('Start a new document? Current data will be lost.')) {
        location.reload();
    }
}

function saveDraft() {
    const draftData = collectFormData();
    const draftId = Date.now();
    
    let drafts = JSON.parse(localStorage.getItem('twtDrafts') || '[]');
    drafts.unshift({
        id: draftId,
        timestamp: new Date().toISOString(),
        data: draftData,
        type: document.getElementById('docType').value || 'DRAFT'
    });
    
    // Keep only last 10 drafts
    drafts = drafts.slice(0, 10);
    
    localStorage.setItem('twtDrafts', JSON.stringify(drafts));
    showToast('Draft saved successfully', 'success');
}

function loadDraft() {
    const drafts = JSON.parse(localStorage.getItem('twtDrafts') || '[]');
    
    if (drafts.length === 0) {
        showToast('No drafts found', 'info');
        return;
    }
    
    // Show draft selection modal (simplified for this implementation)
    const draftList = drafts.map((draft, index) => 
        `${index + 1}. ${draft.type} - ${new Date(draft.timestamp).toLocaleDateString()}`
    ).join('\n');
    
    const selection = prompt(`Select draft:\n${draftList}\n\nEnter number (1-${drafts.length}):`);
    const index = parseInt(selection) - 1;
    
    if (index >= 0 && index < drafts.length) {
        loadFormData(drafts[index].data);
        showToast('Draft loaded successfully', 'success');
    }
}

function collectFormData() {
    const getValue = (id, defaultVal = '') => {
        try {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`Element with ID '${id}' not found, using default value: ${defaultVal}`);
                return defaultVal === '' ? 'N/A' : defaultVal;
            }
            const value = element.value;
            return (value !== null && value !== undefined && value.trim() !== '') ? value : (defaultVal === '' ? 'N/A' : defaultVal);
        } catch (error) {
            console.error(`Error getting value for element '${id}':`, error);
            return defaultVal === '' ? 'N/A' : defaultVal;
        }
    };
    
    const getCheckboxValue = (id, defaultVal = false) => {
        try {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`Checkbox with ID '${id}' not found, using default value: ${defaultVal}`);
                return defaultVal;
            }
            return element.checked || defaultVal;
        } catch (error) {
            console.error(`Error getting checkbox value for element '${id}':`, error);
            return defaultVal;
        }
    };
    
    return {
        docType: getValue('docType', 'DOCUMENT'),
        customDocType: getValue('customDocType'),
        docNo: getValue('docNo', 'DOC-' + Date.now()),
        docDate: getValue('docDate', new Date().toISOString().split('T')[0]),
        clientName: getValue('clientName'),
        clientAddress: getValue('clientAddress'),
        clientPhone: getValue('clientPhone'),
        clientEmail: getValue('clientEmail'),
        fromCountry: getValue('fromCountry'),
        toCountry: getValue('toCountry'),
        loadingPort: getValue('loadingPort'),
        dischargePort: getValue('dischargePort'),
        lcNumber: getValue('lcNumber'),
        blNumber: getValue('blNumber'),
        hsCode: getValue('hsCode'),
        customsDecl: getValue('customsDecl'),
        incoterms: getValue('incoterms'),
        transport: getValue('transport'),
        discount: getValue('discount', '0'),
        shipping: getValue('shipping', '0'),
        tax: getValue('tax', '0'),
        advance: getValue('advance', '0'),
        paymentTerms: getValue('paymentTerms'),
        deliveryTerms: getValue('deliveryTerms'),
        validityPeriod: getValue('validityPeriod'),
        additionalTerms: getValue('additionalTerms'),
        includeStandardTerms: getCheckboxValue('includeStandardTerms'),
        products: products || []
    };
}

function loadFormData(data) {
    // Load form fields
    Object.keys(data).forEach(key => {
        if (key !== 'products') {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = data[key] || false;
                } else {
                    element.value = data[key] || '';
                }
            }
        }
    });
    
    // Load products
    products = data.products || [];
    window.products = products; // Update global reference
    renderProducts();
    calculateSubtotal();
    updateProgress(6);
}

function autoSave() {
    if (document.getElementById('docType').value) {
        const autoSaveData = collectFormData();
        localStorage.setItem('twtAutoSave', JSON.stringify({
            timestamp: new Date().toISOString(),
            data: autoSaveData
        }));
    }
}

// Utility Functions
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    container.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    field.classList.remove('is-invalid', 'is-valid');
    
    if (field.hasAttribute('required') && !value) {
        field.classList.add('is-invalid');
        return false;
    }
    
    if (field.type === 'email' && value && !isValidEmail(value)) {
        field.classList.add('is-invalid');
        return false;
    }
    
    if (value) {
        field.classList.add('is-valid');
    }
    
    return true;
}

function clearValidation(event) {
    event.target.classList.remove('is-invalid', 'is-valid');
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Mobile-specific functions
function addSwipeGestures() {
    let startX, startY, endX, endY;
    
    document.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', function(e) {
        endX = e.changedTouches[0].clientX;
        endY = e.changedTouches[0].clientY;
        
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        
        // Horizontal swipe
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            if (deltaX > 0) {
                // Swipe right - go to previous step
                // Implementation here
            } else {
                // Swipe left - go to next step
                // Implementation here
            }
        }
    });
}

function addPullToRefresh() {
    let startY = 0;
    let isPulling = false;
    
    document.addEventListener('touchstart', function(e) {
        if (window.pageYOffset === 0) {
            startY = e.touches[0].pageY;
            isPulling = false;
        }
    });
    
    document.addEventListener('touchmove', function(e) {
        if (window.pageYOffset === 0 && e.touches[0].pageY > startY + 100) {
            isPulling = true;
            // Show pull to refresh indicator
        }
    });
    
    document.addEventListener('touchend', function(e) {
        if (isPulling) {
            // Refresh action
            location.reload();
        }
    });
}

function checkOrientation() {
    const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    document.body.setAttribute('data-orientation', orientation);
}

function handleResize() {
    checkOrientation();
    // Re-render products if needed
    if (products.length > 0) {
        renderProducts();
    }
}

function showHistory() {
    const drafts = JSON.parse(localStorage.getItem('twtDrafts') || '[]');
    
    if (drafts.length === 0) {
        showToast('No document history found', 'info');
        return;
    }
    
    // Simple history display
    let historyHTML = '<div class="modal fade" id="historyModal" tabindex="-1"><div class="modal-dialog modal-lg"><div class="modal-content">';
    historyHTML += '<div class="modal-header"><h5 class="modal-title">Document History</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>';
    historyHTML += '<div class="modal-body">';
    
    drafts.forEach((draft, index) => {
        historyHTML += `
            <div class="card mb-2">
                <div class="card-body">
                    <h6 class="card-title">${draft.type}</h6>
                    <p class="card-text">Created: ${new Date(draft.timestamp).toLocaleString()}</p>
                    <button class="btn btn-primary btn-sm" onclick="loadFormData(${JSON.stringify(draft.data).replace(/"/g, '&quot;')}); bootstrap.Modal.getInstance(document.getElementById('historyModal')).hide();">Load</button>
                </div>
            </div>
        `;
    });
    
    historyHTML += '</div></div></div></div>';
    
    // Remove existing modal if any
    const existingModal = document.getElementById('historyModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', historyHTML);
    const modal = new bootstrap.Modal(document.getElementById('historyModal'));
    modal.show();
}

// Generate QR Code
function generateQR() {
    const qrData = {
        company: 'TWT INTERNATIONAL',
        docNo: document.getElementById('docNo').value,
        client: document.getElementById('clientName').value,
        total: document.getElementById('totalAmount').value
    };
    
    const qrString = JSON.stringify(qrData);
    
    // Create QR code container
    const qrContainer = document.createElement('div');
    qrContainer.className = 'qr-container';
    qrContainer.innerHTML = '<h6>QR Code</h6><div id="qrcode"></div>';
    
    // Insert after financial details
    const step6 = document.getElementById('step6');
    step6.parentNode.insertBefore(qrContainer, step6.nextSibling);
    
    // Generate QR code
    QRCode.toCanvas(document.getElementById('qrcode'), qrString, {
        width: 200,
        height: 200,
        colorDark: '#000000',
        colorLight: '#ffffff'
    }, function(error) {
        if (error) {
            console.error('QR Code generation failed:', error);
            showToast('QR Code generation failed', 'error');
        } else {
            showToast('QR Code generated successfully', 'success');
        }
    });
}

// Recovery function for auto-saved data
function checkAutoSave() {
    const autoSave = localStorage.getItem('twtAutoSave');
    if (autoSave) {
        const { timestamp, data } = JSON.parse(autoSave);
        const timeDiff = new Date() - new Date(timestamp);
        
        // If auto-save is less than 1 hour old
        if (timeDiff < 3600000) {
            if (confirm('Found auto-saved data. Would you like to recover it?')) {
                loadFormData(data);
                showToast('Auto-saved data recovered', 'success');
            }
        }
    }
}

// Initialize auto-save check
setTimeout(checkAutoSave, 1000);

// Smart Features

// Update currency symbols throughout the form
function updateCurrencySymbols() {
    const currencySelect = document.getElementById('currency');
    const selectedOption = currencySelect.options[currencySelect.selectedIndex];
    const symbol = selectedOption.getAttribute('data-symbol') || '৳';
    
    // Update currency symbol in financial summary if visible
    calculateTotal();
    showToast(`Currency changed to ${currencySelect.value}`, 'info');
}

// Load document templates
function loadTemplate(type) {
    const templates = {
        export: {
            docType: 'EXPORT_INVOICE',
            fromCountry: 'Bangladesh',
            toCountry: '',
            loadingPort: 'Chittagong',
            incoterms: 'FOB',
            currency: 'USD',
            paymentTerms: '30 days from B/L date',
            deliveryTerms: 'FOB Chittagong Port'
        },
        import: {
            docType: 'IMPORT_INVOICE',
            fromCountry: '',
            toCountry: 'Bangladesh',
            dischargePort: 'Chittagong',
            incoterms: 'CIF',
            currency: 'USD',
            paymentTerms: 'L/C at sight',
            deliveryTerms: 'CIF Chittagong Port'
        },
        local: {
            docType: 'COMMERCIAL_INVOICE',
            fromCountry: 'Bangladesh',
            toCountry: 'Bangladesh',
            currency: 'BDT',
            paymentTerms: 'Cash on delivery',
            deliveryTerms: 'FOB destination'
        }
    };
    
    const template = templates[type];
    if (template) {
        Object.keys(template).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'select-one') {
                    element.value = template[key];
                } else {
                    element.value = template[key];
                }
            }
        });
        showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} template loaded`, 'success');
    }
}

// Duplicate current document
function duplicateDocument() {
    const docNo = document.getElementById('docNo');
    const currentNo = docNo.value;
    const newNo = currentNo.includes('-COPY') ? 
        currentNo.replace(/-COPY-\d+/, `-COPY-${Date.now().toString().slice(-4)}`) :
        `${currentNo}-COPY-${Date.now().toString().slice(-4)}`;
    docNo.value = newNo;
    showToast('Document duplicated with new number', 'success');
}

// Clear entire form
function clearForm() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        // Clear all form fields
        document.querySelectorAll('input, textarea, select').forEach(field => {
            if (field.type === 'checkbox') {
                field.checked = false;
            } else if (field.id !== 'docDate') { // Keep today's date
                field.value = '';
            }
        });
        
        // Clear products
        products = [];
        window.products = [];
        renderProducts();
        calculateSubtotal();
        
        // Reset to defaults
        document.getElementById('docType').value = 'COMMERCIAL_INVOICE';
        document.getElementById('currency').value = 'BDT';
        document.getElementById('docDate').value = new Date().toISOString().split('T')[0];
        
        showToast('Form cleared successfully', 'info');
    }
}

// Preview document (mini preview)
function previewDocument() {
    const data = {
        docType: document.getElementById('docType').value || 'COMMERCIAL_INVOICE',
        docNo: document.getElementById('docNo').value || 'DOC-PREVIEW',
        clientName: document.getElementById('clientName').value || 'Preview Client',
        products: products.slice(0, 3), // Show only first 3 products
        totalAmount: document.getElementById('totalAmount').value || '0.00'
    };
    
    const previewHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 500px;">
            <h4 style="color: #0066cc; margin-bottom: 10px;">TWT INTERNATIONAL</h4>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                <div><strong>Document:</strong> ${data.docType.replace('_', ' ')}</div>
                <div><strong>Number:</strong> ${data.docNo}</div>
                <div><strong>Client:</strong> ${data.clientName}</div>
                <div><strong>Products:</strong> ${data.products.length} items</div>
                <div><strong>Total:</strong> ৳ ${data.totalAmount}</div>
                ${data.products.length > 3 ? '<div><small>...and more</small></div>' : ''}
            </div>
        </div>
    `;
    
    showCustomModal('Document Preview', previewHtml);
}

// Custom modal for preview
function showCustomModal(title, content) {
    // Remove existing modal if any
    const existingModal = document.getElementById('customModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'customModal';
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${title}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
    
    modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
    });
}

// Enhanced product validation
function validateProduct(product) {
    const errors = [];
    
    if (!product.name || product.name.trim() === '') {
        errors.push('Product name is required');
    }
    if (!product.quantity || product.quantity <= 0) {
        errors.push('Quantity must be greater than 0');
    }
    if (!product.rate || product.rate <= 0) {
        errors.push('Rate must be greater than 0');
    }
    
    return errors;
}

// Smart auto-complete for ports and countries
const commonPorts = {
    'Bangladesh': ['Chittagong', 'Mongla'],
    'India': ['Kolkata', 'Chennai', 'Mumbai', 'Kandla'],
    'China': ['Shanghai', 'Shenzhen', 'Ningbo', 'Qingdao'],
    'Singapore': ['Singapore'],
    'UAE': ['Dubai', 'Abu Dhabi', 'Sharjah'],
    'USA': ['Los Angeles', 'New York', 'Long Beach', 'Savannah']
};

// Add auto-complete functionality
function setupAutoComplete() {
    const countryFields = ['fromCountry', 'toCountry'];
    const portFields = ['loadingPort', 'dischargePort'];
    
    countryFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', function() {
                // Simple auto-complete logic could be added here
                if (this.value && commonPorts[this.value]) {
                    console.log(`Ports available for ${this.value}:`, commonPorts[this.value]);
                }
            });
        }
    });
}

// Initialize smart features
document.addEventListener('DOMContentLoaded', function() {
    setupAutoComplete();
    
    // Set default currency symbol
    updateCurrencySymbols();
});

// Enhanced error handling and validation
function validateDocument() {
    const errors = [];
    
    // Check required fields
    const requiredFields = ['docNo', 'clientName'];
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            errors.push(`${fieldId.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`);
        }
    });
    
    // Validate products
    if (products.length === 0) {
        errors.push('At least one product is required');
    } else {
        products.forEach((product, index) => {
            const productErrors = validateProduct(product);
            productErrors.forEach(error => {
                errors.push(`Product ${index + 1}: ${error}`);
            });
        });
    }
    
    return errors;
}

// Add Bank Account functionality
function addBankAccount() {
    const bankAccountsList = document.getElementById('bankAccountsList');
    const newBankDiv = document.createElement('div');
    newBankDiv.className = 'bank-account-item mb-3 p-3 border rounded';
    
    newBankDiv.innerHTML = `
        <select class="form-select mb-2" name="bankAccount">
            <option value="brac">BRAC BANK - A/C: 2403203439839001</option>
            <option value="islami">Islami Bank - A/C: 20502370201006835</option>
            <option value="dutch">Dutch Bangla Bank - A/C: 1051234567890</option>
            <option value="city">City Bank - A/C: 1501234567890</option>
            <option value="nagad">Nagad - A/C: 01712959737</option>
            <option value="bkash">bKash - A/C: 01752457930</option>
            <option value="rocket">Rocket - A/C: 01712959737-5</option>
            <option value="upay">Upay - A/C: 01752457930</option>
            <option value="custom">Custom Payment Method</option>
        </select>
        <textarea class="form-control custom-bank-details" rows="2" placeholder="Enter custom payment details (only for custom option)" style="display: none;"></textarea>
        <button type="button" class="btn btn-sm btn-danger mt-2 remove-bank">Remove</button>
    `;
    
    bankAccountsList.appendChild(newBankDiv);
    
    // Add event listeners for the new bank account
    const selectElement = newBankDiv.querySelector('select[name="bankAccount"]');
    const customTextarea = newBankDiv.querySelector('.custom-bank-details');
    const removeButton = newBankDiv.querySelector('.remove-bank');
    
    selectElement.addEventListener('change', function() {
        if (this.value === 'custom') {
            customTextarea.style.display = 'block';
        } else {
            customTextarea.style.display = 'none';
        }
    });
    
    removeButton.addEventListener('click', function() {
        bankAccountsList.removeChild(newBankDiv);
        updateRemoveButtons();
    });
    
    updateRemoveButtons();
}

// Update remove button visibility for bank accounts
function updateRemoveButtons() {
    const bankItems = document.querySelectorAll('.bank-account-item');
    bankItems.forEach((item, index) => {
        const removeBtn = item.querySelector('.remove-bank');
        if (index === 0 && bankItems.length === 1) {
            removeBtn.style.display = 'none';
        } else {
            removeBtn.style.display = 'inline-block';
        }
    });
}

// Add Office Address functionality
function addOfficeAddress() {
    const officeAddressesList = document.getElementById('officeAddressesList');
    const newOfficeDiv = document.createElement('div');
    newOfficeDiv.className = 'office-address-item mb-3 p-3 border rounded';
    
    newOfficeDiv.innerHTML = `
        <div class="row g-2">
            <div class="col-4">
                <input type="text" class="form-control office-city" placeholder="City">
            </div>
            <div class="col-8">
                <textarea class="form-control office-address" rows="2" placeholder="Address"></textarea>
            </div>
            <div class="col-12">
                <button type="button" class="btn btn-sm btn-danger remove-office">Remove Office</button>
            </div>
        </div>
    `;
    
    officeAddressesList.appendChild(newOfficeDiv);
    
    // Add event listener for remove button
    const removeButton = newOfficeDiv.querySelector('.remove-office');
    removeButton.addEventListener('click', function() {
        officeAddressesList.removeChild(newOfficeDiv);
        updateOfficeRemoveButtons();
    });
    
    updateOfficeRemoveButtons();
}

// Update remove button visibility for office addresses
function updateOfficeRemoveButtons() {
    const officeItems = document.querySelectorAll('.office-address-item');
    officeItems.forEach((item, index) => {
        const removeBtn = item.querySelector('.remove-office');
        if (index === 0 && officeItems.length === 1) {
            removeBtn.style.display = 'none';
        } else {
            removeBtn.style.display = 'inline-block';
        }
    });
}

// Clear form function (updated)
function clearForm() {
    if (confirm('Are you sure you want to clear all form data?')) {
        // Clear all form fields
        document.querySelectorAll('input, textarea, select').forEach(field => {
            if (field.type === 'checkbox' || field.type === 'radio') {
                field.checked = false;
            } else {
                field.value = '';
            }
        });
        
        // Clear products array
        products = [];
        window.products = products;
        renderProducts();
        
        // Reset to defaults
        setCurrentDate();
        generateDocNumber();
        
        showToast('Form cleared successfully', 'success');
    }
}
