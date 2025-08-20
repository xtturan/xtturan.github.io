# TWT International - Mobile Document Generator

A comprehensive, mobile-first web application for TWT International to generate professional business documents including quotations, invoices, purchase orders, and more.

## 🚀 Features

### 📱 Mobile-First Design
- Responsive layout optimized for smartphones
- Touch-friendly interface with large buttons (44px minimum)
- Collapsible sections to maximize screen space
- Bottom navigation for quick access
- Floating action buttons for common tasks
- Dark mode support
- Portrait and landscape orientation support

### 📋 Document Types
- Quotation
- Bill Invoice
- Proforma Invoice
- Purchase Order
- Commercial Invoice
- Packing List
- Custom document types

### 👥 Client Management
- Save and reuse client information
- Quick client selection dropdown
- Automatic form population
- Client database with localStorage

### 📦 Product Management
- Mobile-optimized product entry
- Support for PKG Gross KG/PCS column
- Auto-calculation of amounts
- Swipe-friendly product cards on mobile
- Desktop table view for larger screens

### 💰 Financial Features
- Automatic calculations (subtotal, discount, tax, total)
- Amount to words conversion (English)
- Advance payment and balance calculation
- Multiple currency support
- Professional financial summary

### 🌍 Import/Export Details
- Country of origin and destination
- Loading and discharge ports
- L/C numbers, B/L numbers, HS codes
- Customs declaration numbers
- Incoterms (FOB, CIF, CFR, EXW, DDP)
- Transport methods

### 📄 Export Options
- PDF generation with professional layout
- PNG image export
- Direct WhatsApp sharing
- Email sharing capability
- Print functionality

### 💾 Data Management
- Auto-save functionality (every 30 seconds)
- Draft saving and loading
- Document history with thumbnails
- Offline capability with localStorage
- Data export/import
- Recovery from unexpected closure

### 🎨 Customization
- Dark/Light mode toggle
- Bengali language support
- Template system
- Company branding
- Multiple bank account options

## 🏗️ Project Structure

```
quote_4/
├── index.html              # Main application file
├── css/
│   └── styles.css          # Mobile-first responsive styles
├── js/
│   ├── script.js           # Main application logic
│   ├── storage.js          # localStorage management
│   └── pdf-generator.js    # PDF/PNG generation
└── assets/
    ├── twt-logo.svg        # Company logo
    └── default-signature.svg # Default signature
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for CDN resources)
- No server required - runs entirely client-side

### Installation
1. Download or clone the project files
2. Open `index.html` in your web browser
3. Start creating documents immediately

### For Mobile Use
1. Open in mobile browser
2. Add to home screen for app-like experience
3. Use in landscape mode for better table editing

## 📖 Usage Guide

### Creating a Document

1. **Select Document Type**
   - Choose from predefined types or create custom
   - Progress indicator shows completion status

2. **Company Information**
   - Pre-loaded with TWT International details
   - Select bank account or add custom banking details
   - Collapsible section saves screen space

3. **Document & Client Info**
   - Auto-generated document numbers
   - Quick client selection from saved list
   - Add new clients with save option

4. **Import/Export Details** (Optional)
   - Complete trade documentation support
   - Collapsible accordion for mobile optimization

5. **Add Products**
   - Mobile: Card-based interface with swipe actions
   - Desktop: Traditional table view
   - Include PKG Gross KG/PCS information
   - Auto-calculation of line totals

6. **Financial Summary**
   - Automatic calculations
   - Discount and tax support
   - Amount in words conversion

7. **Generate & Share**
   - PDF or PNG export
   - Direct WhatsApp sharing
   - Email integration
   - Save as draft option

### Mobile-Specific Features

#### Bottom Navigation
- **New**: Start fresh document
- **Load**: Open saved drafts
- **Export**: Generate PDF/PNG
- **History**: View past documents

#### Floating Action Button
- **Add Product**: Quick product entry
- **Save Draft**: Instant save
- **Generate QR**: Create QR code

#### Gestures
- **Swipe**: Navigate between sections
- **Pull-to-refresh**: Reload application
- **Touch & hold**: Context menus

## 🔧 Technical Details

### Dependencies
- Bootstrap 5.3.0 (CSS Framework)
- Font Awesome 6.4.0 (Icons)
- jsPDF 2.5.1 (PDF generation)
- html2canvas 1.4.1 (PNG generation)
- QRCode 1.5.3 (QR code generation)

### Browser Support
- Chrome/Chromium 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Mobile browsers (iOS Safari, Chrome Mobile)

### Storage
- **localStorage**: Primary storage for all data
- **sessionStorage**: Fallback if localStorage unavailable
- **Auto-cleanup**: Prevents storage quota issues
- **Data validation**: Ensures data integrity

### Performance
- Lazy loading of heavy components
- Optimized mobile rendering
- Efficient PDF generation
- Minimal data usage

## 🎯 Mobile Optimization

### Touch Interface
- 44px minimum touch targets
- Large, easy-to-tap buttons
- Gesture support
- Haptic feedback (where supported)

### Screen Optimization
- Collapsible sections
- Bottom sheet modals
- Floating elements
- Responsive typography

### Battery Efficiency
- Dark mode for OLED screens
- Optimized animations
- Efficient DOM updates
- Background process management

## 🏢 Company Information

**TWT INTERNATIONAL**
- Importer, Exporter & Supplier
- Phone: +880 1712-959737, +880 1752-457930
- Email: rahmanazad100@gmail.com

**Offices:**
- Chittagong: Jafor Mantion, Gosailidanga Barikmia School Road (1st Floor)
- Dhaka: 60/E dewan Complex purana palton
- Benapole: Alikador Building, Benapole Bazar

**Banking:**
- BRAC BANK, Benapole Branch
- A/C: M/S TWT INTERNATIONAL
- A/C No: 2403203439839001

## 🔐 Security & Privacy

- All data stored locally on device
- No data transmitted to external servers
- Client information encrypted in localStorage
- Secure document generation
- Privacy-first design

## 🐛 Troubleshooting

### Common Issues

**PDF Generation Fails**
- Check internet connection for font loading
- Clear browser cache
- Ensure sufficient storage space

**Storage Full**
- Application auto-cleans old data
- Manually clear history if needed
- Export data before clearing

**Mobile Display Issues**
- Rotate device to landscape for tables
- Zoom out if elements appear cut off
- Clear browser cache

**Performance Issues**
- Close unnecessary browser tabs
- Clear application data
- Update browser to latest version

## 📱 Progressive Web App Features

### Offline Capability
- Full functionality without internet
- Local data storage
- Cached application files

### Install Prompts
- Add to home screen option
- App-like experience
- Full-screen mode

### Push Notifications
- Document completion alerts
- Auto-save confirmations
- Error notifications

## 🔄 Updates & Maintenance

### Version History
- v1.0: Initial mobile-optimized release
- Regular updates for bug fixes
- Feature enhancements based on user feedback

### Backup & Recovery
- Export data regularly
- Keep backup of important documents
- Use draft system for work-in-progress

## 📞 Support

For technical support or feature requests:
- Email: rahmanazad100@gmail.com
- Phone: +880 1712-959737

## 📄 License

This application is developed specifically for TWT International.
All rights reserved © 2024 TWT International.

---

**Made with ❤️ for TWT International**
*Streamlining international trade documentation on mobile devices*
