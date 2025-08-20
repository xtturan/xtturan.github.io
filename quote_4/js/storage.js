// Storage Management for TWT International Document Generator
// Handles localStorage operations with error handling and data validation

class TWTStorage {
    constructor() {
        this.storageKeys = {
            clients: 'twtClients',
            drafts: 'twtDrafts',
            templates: 'twtTemplates',
            settings: 'twtSettings',
            autoSave: 'twtAutoSave',
            theme: 'twtTheme',
            history: 'twtHistory'
        };
        
        this.maxDrafts = 10;
        this.maxHistory = 50;
        this.autoSaveInterval = 30000; // 30 seconds
        
        this.initializeStorage();
    }
    
    // Initialize storage with default values
    initializeStorage() {
        try {
            // Check if localStorage is available
            if (!this.isStorageAvailable()) {
                console.warn('localStorage not available, using session storage');
                this.useSessionStorage = true;
            }
            
            // Initialize empty arrays if not exist
            if (!this.getItem(this.storageKeys.clients)) {
                this.setItem(this.storageKeys.clients, []);
            }
            
            if (!this.getItem(this.storageKeys.drafts)) {
                this.setItem(this.storageKeys.drafts, []);
            }
            
            if (!this.getItem(this.storageKeys.history)) {
                this.setItem(this.storageKeys.history, []);
            }
            
            // Set default settings
            if (!this.getItem(this.storageKeys.settings)) {
                this.setItem(this.storageKeys.settings, {
                    theme: 'light',
                    language: 'english',
                    autoSave: true,
                    autoSaveInterval: 30000,
                    defaultCurrency: 'BDT',
                    defaultTax: 0,
                    companyInfo: {
                        name: 'TWT INTERNATIONAL',
                        tagline: 'Importer, Exporter & Supplier',
                        phones: ['+880 1712-959737', '+880 1752-457930'],
                        email: 'rahmanazad100@gmail.com',
                        offices: [
                            'Chittagong: Jafor Mantion, Gosailidanga Barikmia School Road (1st Floor)',
                            'Dhaka: 60/E dewan Complex purana palton',
                            'Benapole: Alikador Building, Benapole Bazar'
                        ],
                        bank: {
                            name: 'BRAC BANK',
                            branch: 'Benapole Branch',
                            account: 'M/S TWT INTERNATIONAL',
                            accountNo: '2403203439839001'
                        }
                    }
                });
            }
            
            console.log('TWT Storage initialized successfully');
        } catch (error) {
            console.error('Storage initialization failed:', error);
            this.handleStorageError(error);
        }
    }
    
    // Check if localStorage is available
    isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    // Get storage object (localStorage or sessionStorage)
    getStorage() {
        return this.useSessionStorage ? sessionStorage : localStorage;
    }
    
    // Generic get item with error handling
    getItem(key) {
        try {
            const data = this.getStorage().getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Error getting item ${key}:`, error);
            this.handleStorageError(error);
            return null;
        }
    }
    
    // Generic set item with error handling
    setItem(key, value) {
        try {
            this.getStorage().setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error setting item ${key}:`, error);
            this.handleStorageError(error);
            return false;
        }
    }
    
    // Remove item
    removeItem(key) {
        try {
            this.getStorage().removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing item ${key}:`, error);
            return false;
        }
    }
    
    // Clear all TWT related storage
    clearAll() {
        try {
            Object.values(this.storageKeys).forEach(key => {
                this.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }
    
    // Handle storage errors
    handleStorageError(error) {
        if (error.name === 'QuotaExceededError') {
            this.cleanupOldData();
            if (typeof showToast === 'function') {
                showToast('Storage full. Old data cleaned up.', 'warning');
            }
        } else {
            if (typeof showToast === 'function') {
                showToast('Storage error occurred. Some features may not work.', 'error');
            }
        }
    }
    
    // Cleanup old data when storage is full
    cleanupOldData() {
        try {
            // Clean old drafts (keep only 5 latest)
            const drafts = this.getDrafts();
            if (drafts.length > 5) {
                this.setItem(this.storageKeys.drafts, drafts.slice(0, 5));
            }
            
            // Clean old history (keep only 20 latest)
            const history = this.getHistory();
            if (history.length > 20) {
                this.setItem(this.storageKeys.history, history.slice(0, 20));
            }
            
            // Remove auto-save if exists
            this.removeItem(this.storageKeys.autoSave);
            
            console.log('Old data cleaned up');
        } catch (error) {
            console.error('Error cleaning up data:', error);
        }
    }
    
    // Client management methods
    getClients() {
        return this.getItem(this.storageKeys.clients) || [];
    }
    
    saveClient(clientData) {
        try {
            const clients = this.getClients();
            
            // Validate client data
            if (!clientData.name || !clientData.address) {
                throw new Error('Client name and address are required');
            }
            
            // Check for duplicate
            const existingIndex = clients.findIndex(c => 
                c.name.toLowerCase() === clientData.name.toLowerCase()
            );
            
            if (existingIndex >= 0) {
                clients[existingIndex] = { ...clients[existingIndex], ...clientData, updatedAt: new Date().toISOString() };
            } else {
                clients.push({ 
                    ...clientData, 
                    id: Date.now(),
                    createdAt: new Date().toISOString() 
                });
            }
            
            return this.setItem(this.storageKeys.clients, clients);
        } catch (error) {
            console.error('Error saving client:', error);
            return false;
        }
    }
    
    deleteClient(clientId) {
        try {
            const clients = this.getClients();
            const filteredClients = clients.filter(c => c.id !== clientId);
            return this.setItem(this.storageKeys.clients, filteredClients);
        } catch (error) {
            console.error('Error deleting client:', error);
            return false;
        }
    }
    
    // Draft management methods
    getDrafts() {
        return this.getItem(this.storageKeys.drafts) || [];
    }
    
    saveDraft(draftData, title = null) {
        try {
            const drafts = this.getDrafts();
            
            const draft = {
                id: Date.now(),
                title: title || `Draft ${new Date().toLocaleDateString()}`,
                timestamp: new Date().toISOString(),
                data: draftData,
                type: draftData.docType || 'UNKNOWN'
            };
            
            drafts.unshift(draft);
            
            // Keep only maxDrafts
            if (drafts.length > this.maxDrafts) {
                drafts.splice(this.maxDrafts);
            }
            
            return this.setItem(this.storageKeys.drafts, drafts);
        } catch (error) {
            console.error('Error saving draft:', error);
            return false;
        }
    }
    
    deleteDraft(draftId) {
        try {
            const drafts = this.getDrafts();
            const filteredDrafts = drafts.filter(d => d.id !== draftId);
            return this.setItem(this.storageKeys.drafts, filteredDrafts);
        } catch (error) {
            console.error('Error deleting draft:', error);
            return false;
        }
    }
    
    // Auto-save methods
    saveAutoSave(data) {
        try {
            const autoSaveData = {
                timestamp: new Date().toISOString(),
                data: data
            };
            return this.setItem(this.storageKeys.autoSave, autoSaveData);
        } catch (error) {
            console.error('Error saving auto-save:', error);
            return false;
        }
    }
    
    getAutoSave() {
        return this.getItem(this.storageKeys.autoSave);
    }
    
    clearAutoSave() {
        return this.removeItem(this.storageKeys.autoSave);
    }
    
    // History management
    getHistory() {
        return this.getItem(this.storageKeys.history) || [];
    }
    
    addToHistory(documentData) {
        try {
            const history = this.getHistory();
            
            const historyItem = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                docType: documentData.docType,
                docNo: documentData.docNo,
                clientName: documentData.clientName,
                totalAmount: documentData.totalAmount,
                data: documentData
            };
            
            history.unshift(historyItem);
            
            // Keep only maxHistory items
            if (history.length > this.maxHistory) {
                history.splice(this.maxHistory);
            }
            
            return this.setItem(this.storageKeys.history, history);
        } catch (error) {
            console.error('Error adding to history:', error);
            return false;
        }
    }
    
    deleteFromHistory(historyId) {
        try {
            const history = this.getHistory();
            const filteredHistory = history.filter(h => h.id !== historyId);
            return this.setItem(this.storageKeys.history, filteredHistory);
        } catch (error) {
            console.error('Error deleting from history:', error);
            return false;
        }
    }
    
    // Settings management
    getSettings() {
        return this.getItem(this.storageKeys.settings) || {};
    }
    
    updateSettings(newSettings) {
        try {
            const currentSettings = this.getSettings();
            const updatedSettings = { ...currentSettings, ...newSettings };
            return this.setItem(this.storageKeys.settings, updatedSettings);
        } catch (error) {
            console.error('Error updating settings:', error);
            return false;
        }
    }
    
    // Template management
    getTemplates() {
        return this.getItem(this.storageKeys.templates) || [];
    }
    
    saveTemplate(templateData, name) {
        try {
            const templates = this.getTemplates();
            
            const template = {
                id: Date.now(),
                name: name,
                timestamp: new Date().toISOString(),
                data: templateData
            };
            
            templates.push(template);
            return this.setItem(this.storageKeys.templates, templates);
        } catch (error) {
            console.error('Error saving template:', error);
            return false;
        }
    }
    
    deleteTemplate(templateId) {
        try {
            const templates = this.getTemplates();
            const filteredTemplates = templates.filter(t => t.id !== templateId);
            return this.setItem(this.storageKeys.templates, filteredTemplates);
        } catch (error) {
            console.error('Error deleting template:', error);
            return false;
        }
    }
    
    // Export all data
    exportAllData() {
        try {
            const allData = {};
            Object.entries(this.storageKeys).forEach(([key, storageKey]) => {
                allData[key] = this.getItem(storageKey);
            });
            
            return {
                success: true,
                data: allData,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
        } catch (error) {
            console.error('Error exporting data:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Import data
    importData(importData) {
        try {
            if (!importData.data || !importData.version) {
                throw new Error('Invalid import data format');
            }
            
            Object.entries(importData.data).forEach(([key, value]) => {
                if (this.storageKeys[key] && value !== null) {
                    this.setItem(this.storageKeys[key], value);
                }
            });
            
            return { success: true, message: 'Data imported successfully' };
        } catch (error) {
            console.error('Error importing data:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Get storage usage information
    getStorageInfo() {
        try {
            let totalSize = 0;
            let itemCount = 0;
            const items = {};
            
            Object.values(this.storageKeys).forEach(key => {
                const data = this.getStorage().getItem(key);
                if (data) {
                    const size = new Blob([data]).size;
                    items[key] = {
                        size: size,
                        sizeFormatted: this.formatBytes(size),
                        items: JSON.parse(data).length || 1
                    };
                    totalSize += size;
                    itemCount += items[key].items;
                }
            });
            
            return {
                totalSize: totalSize,
                totalSizeFormatted: this.formatBytes(totalSize),
                itemCount: itemCount,
                items: items,
                storageType: this.useSessionStorage ? 'sessionStorage' : 'localStorage'
            };
        } catch (error) {
            console.error('Error getting storage info:', error);
            return null;
        }
    }
    
    // Format bytes to human readable format
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    
    // Validate data integrity
    validateData() {
        try {
            const validationResults = {};
            
            // Validate clients
            const clients = this.getClients();
            validationResults.clients = {
                count: clients.length,
                valid: clients.every(c => c.name && c.address),
                issues: clients.filter(c => !c.name || !c.address).length
            };
            
            // Validate drafts
            const drafts = this.getDrafts();
            validationResults.drafts = {
                count: drafts.length,
                valid: drafts.every(d => d.timestamp && d.data),
                issues: drafts.filter(d => !d.timestamp || !d.data).length
            };
            
            // Validate history
            const history = this.getHistory();
            validationResults.history = {
                count: history.length,
                valid: history.every(h => h.timestamp && h.data),
                issues: history.filter(h => !h.timestamp || !h.data).length
            };
            
            return validationResults;
        } catch (error) {
            console.error('Error validating data:', error);
            return null;
        }
    }
}

// Create global storage instance
const twtStorage = new TWTStorage();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TWTStorage, twtStorage };
}
