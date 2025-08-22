// PDF Generator for TWT International Document Generator
// Mobile-optimized PDF generation with professional layouts

class TWTPDFGenerator {
    constructor() {
        this.pageWidth = 210; // A4 width in mm
        this.pageHeight = 297; // A4 height in mm
        this.margin = 15;
        this.currentY = this.margin;
        this.lineHeight = 5;
        this.fontSize = {
            title: 16,
            subtitle: 12,
            normal: 10,
            small: 8
        };
        
        // Company colors
        this.colors = {
            primary: [0, 102, 204], // TWT Blue
            secondary: [108, 117, 125], // Gray
            text: [33, 37, 41], // Dark Gray
            border: [222, 226, 230] // Light Gray
        };
    }
    
    // Generate PDF document - DISABLED (PNG only)
    async generatePDF() {
        alert('PDF generation has been disabled. Please use PNG generation instead.');
        return false;
    }

    // Generate PNG image
    async generatePNG() {
        try {
            console.log('Starting PNG generation...');
            
            // Wait for DOM to be fully ready
            if (document.readyState !== 'complete') {
                console.log('Waiting for DOM to be ready...');
                await new Promise(resolve => {
                    if (document.readyState === 'complete') {
                        resolve();
                    } else {
                        window.addEventListener('load', resolve, { once: true });
                    }
                });
            }
            
            this.showLoading();
            
            // Check if required libraries are loaded with retry
            let retries = 0;
            while (typeof html2canvas === 'undefined' && retries < 10) {
                console.log(`Waiting for html2canvas to load... attempt ${retries + 1}`);
                await new Promise(resolve => setTimeout(resolve, 500));
                retries++;
            }
            
            if (typeof html2canvas === 'undefined') {
                throw new Error('html2canvas library failed to load after multiple attempts');
            }
            
            // Wait a bit more for all form elements to be ready
            await new Promise(resolve => setTimeout(resolve, 500));
            
            console.log('Collecting form data...');
            const data = this.collectFormData();
            console.log('Form data collected successfully:', data);
            
            // Validate essential data
            if (!data.docType || !data.docNo) {
                console.warn('Missing essential document data, using defaults');
            }
            
            // Create a temporary div with document content
            console.log('Creating printable div...');
            const tempDiv = await this.createPrintableDiv(data);
            
            // Ensure tempDiv was created successfully
            if (!tempDiv) {
                throw new Error('Failed to create printable content');
            }
            
            document.body.appendChild(tempDiv);
            console.log('Temporary div added to document');
            
            // Wait longer for content to render and images to load on GitHub Pages
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Calculate dynamic dimensions based on content
            const contentWidth = Math.max(tempDiv.scrollWidth + 100, 1200); // Minimum width
            const contentHeight = Math.max(tempDiv.scrollHeight + 100, 800); // Minimum height
            console.log('Content dimensions calculated:', { width: contentWidth, height: contentHeight });
            
            // Use html2canvas to convert to image with dynamic sizing
            console.log('Starting html2canvas conversion...');
            const canvas = await html2canvas(tempDiv, {
                scale: 1.2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                // Let html2canvas auto-detect the size
                // width: contentWidth,
                // height: contentHeight,
                scrollX: 0,
                scrollY: 0,
                logging: false,
                imageTimeout: 30000, // Increased timeout for GitHub Pages
                onclone: function(clonedDoc) {
                    console.log('Document cloned for canvas rendering');
                    // Remove any problematic elements in the cloned document
                    const problemElements = clonedDoc.querySelectorAll('script, link[rel="stylesheet"]');
                    problemElements.forEach(el => el.remove());
                },
                ignoreElements: function(element) {
                    // Skip problematic elements
                    if (element.tagName === 'SCRIPT' || element.tagName === 'LINK') {
                        return true;
                    }
                    return false;
                }
            });
            
            console.log('Canvas created successfully');
            
            // Remove temporary div
            if (tempDiv && tempDiv.parentNode) {
                document.body.removeChild(tempDiv);
                console.log('Temporary div removed');
            }
            
            // Convert to PNG and prompt for filename
            const imgData = canvas.toDataURL('image/png', 1.0);
            
            if (!imgData || imgData === 'data:,') {
                throw new Error('Failed to generate image data');
            }
            
            // Get filename from user
            const filename = await this.promptForFilename(data);
            
            // If user cancelled, don't download
            if (filename === null) {
                this.hideLoading();
                this.showToast('PNG generation cancelled.', 'info');
                return false;
            }
            
            const link = document.createElement('a');
            link.download = `${filename}.png`;
            link.href = imgData;
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.hideLoading();
            this.showToast('PNG generated successfully! Download should start automatically.', 'success');
            
            return true;
        } catch (error) {
            console.error('PNG generation failed:', error);
            console.error('Error stack:', error.stack);
            
            // Clean up temporary elements
            const tempDivs = document.querySelectorAll('[style*="position: fixed"][style*="top: -9999px"]');
            tempDivs.forEach(div => {
                if (div.parentNode) {
                    div.parentNode.removeChild(div);
                }
            });
            
            this.hideLoading();
            
            let errorMessage = 'PNG generation failed: ';
            if (error.message.includes('Cannot read properties of null')) {
                errorMessage += 'Page is still loading. Please wait a moment and try again.';
            } else if (error.message.includes('html2canvas')) {
                errorMessage += 'Required libraries are still loading. Please refresh and try again.';
            } else {
                errorMessage += error.message;
            }
            
            this.showToast(errorMessage, 'error');
            return false;
        }
    }
    
    // Add header with logo and company name
    async addHeader(pdf, data) {
        try {
            // Set primary color
            pdf.setTextColor(...this.colors.primary);
            
            // Company name
            pdf.setFontSize(this.fontSize.title);
            pdf.setFont(undefined, 'bold');
            pdf.text('TWT INTERNATIONAL', this.margin, this.currentY + 10);
            
            // Tagline
            pdf.setFontSize(this.fontSize.normal);
            pdf.setFont(undefined, 'normal');
            pdf.text('International Courier Service | Door to Door Service | C&F Agent Service', this.margin, this.currentY + 16);
            pdf.text('International Payment Support | Product Sourcing | Shipping/Container Support', this.margin, this.currentY + 20);
            pdf.text('Freight Forwarding | L/C Received Support | Warehouse Support | Supplier Verification', this.margin, this.currentY + 24);
            pdf.text('Product Quality Verification | Product Packaging Facilities | Worldwide Service', this.margin, this.currentY + 28);
            
            // Document type on the right
            pdf.setFontSize(this.fontSize.subtitle);
            pdf.setFont(undefined, 'bold');
            const docTypeWidth = pdf.getTextWidth(data.docType);
            pdf.text(data.docType, this.pageWidth - this.margin - docTypeWidth, this.currentY + 10);
            
            // Add line separator
            pdf.setDrawColor(...this.colors.primary);
            pdf.setLineWidth(0.5);
            pdf.line(this.margin, this.currentY + 20, this.pageWidth - this.margin, this.currentY + 20);
            
            this.currentY += 30;
        } catch (error) {
            console.error('Error adding header:', error);
        }
    }
    
    // Add company information
    addCompanyInfo(pdf, data) {
        try {
            pdf.setTextColor(...this.colors.text);
            pdf.setFontSize(this.fontSize.small);
            pdf.setFont(undefined, 'normal');
            
            const companyInfo = [
                'Phone: +880 1712-959737, +880 1752-457930',
                'Email: rahmanazad100@gmail.com',
                'Chittagong: Jafor Mantion, Gosailidanga Barikmia School Road (1st Floor)',
                'Dhaka: 60/E dewan Complex purana palton | Benapole: Alikador Building, Benapole Bazar'
            ];
            
            companyInfo.forEach((line, index) => {
                pdf.text(line, this.margin, this.currentY + (index * 4));
            });
            
            this.currentY += 20;
        } catch (error) {
            console.error('Error adding company info:', error);
        }
    }
    
    // Add document information
    addDocumentInfo(pdf, data) {
        try {
            // Document info box
            pdf.setDrawColor(...this.colors.border);
            pdf.setFillColor(248, 249, 250);
            pdf.rect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), 20, 'FD');
            
            pdf.setTextColor(...this.colors.text);
            pdf.setFontSize(this.fontSize.normal);
            pdf.setFont(undefined, 'bold');
            
            // Left side
            pdf.text('Document No:', this.margin + 5, this.currentY + 7);
            pdf.text('Date:', this.margin + 5, this.currentY + 14);
            
            pdf.setFont(undefined, 'normal');
            pdf.text(data.docNo, this.margin + 35, this.currentY + 7);
            pdf.text(new Date(data.docDate).toLocaleDateString(), this.margin + 35, this.currentY + 14);
            
            // Right side (if import/export details exist)
            if (data.lcNumber || data.blNumber) {
                pdf.setFont(undefined, 'bold');
                pdf.text('L/C No:', this.pageWidth/2, this.currentY + 7);
                pdf.text('B/L No:', this.pageWidth/2, this.currentY + 14);
                
                pdf.setFont(undefined, 'normal');
                pdf.text(data.lcNumber || 'N/A', this.pageWidth/2 + 20, this.currentY + 7);
                pdf.text(data.blNumber || 'N/A', this.pageWidth/2 + 20, this.currentY + 14);
            }
            
            this.currentY += 25;
        } catch (error) {
            console.error('Error adding document info:', error);
        }
    }
    
    // Add client information
    addClientInfo(pdf, data) {
        try {
            pdf.setFontSize(this.fontSize.normal);
            pdf.setFont(undefined, 'bold');
            pdf.setTextColor(...this.colors.primary);
            pdf.text('BILL TO:', this.margin, this.currentY);
            
            pdf.setTextColor(...this.colors.text);
            pdf.setFont(undefined, 'normal');
            this.currentY += 6;
            
            // Client details
            const clientLines = [
                data.clientName,
                ...data.clientAddress.split('\n'),
                data.clientPhone ? `Phone: ${data.clientPhone}` : '',
                data.clientEmail ? `Email: ${data.clientEmail}` : ''
            ].filter(line => line.trim());
            
            clientLines.forEach(line => {
                pdf.text(line, this.margin, this.currentY);
                this.currentY += 4;
            });
            
            this.currentY += 5;
        } catch (error) {
            console.error('Error adding client info:', error);
        }
    }
    
    // Add product table
    addProductTable(pdf, data) {
        try {
            if (!data.products || data.products.length === 0) {
                return;
            }
            
            // Table header
            const tableHeaders = ['#', 'Description', 'Qty', 'Unit', 'PKG Gross KG/PCS', 'Rate', 'Amount'];
            const colWidths = [10, 60, 15, 15, 35, 25, 25];
            const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
            const startX = this.margin;
            
            // Header background
            pdf.setFillColor(...this.colors.primary);
            pdf.rect(startX, this.currentY, tableWidth, 8, 'F');
            
            // Header text
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(this.fontSize.small);
            pdf.setFont(undefined, 'bold');
            
            let currentX = startX;
            tableHeaders.forEach((header, index) => {
                pdf.text(header, currentX + 2, this.currentY + 5);
                currentX += colWidths[index];
            });
            
            this.currentY += 8;
            
            // Table rows
            pdf.setTextColor(...this.colors.text);
            pdf.setFont(undefined, 'normal');
            
            data.products.forEach((product, index) => {
                // Check if we need a new page
                if (this.currentY > this.pageHeight - 50) {
                    pdf.addPage();
                    this.currentY = this.margin + 20;
                }
                
                // Row background (alternating colors)
                if (index % 2 === 1) {
                    pdf.setFillColor(248, 249, 250);
                    pdf.rect(startX, this.currentY, tableWidth, 6, 'F');
                }
                
                currentX = startX;
                const rowData = [
                    (index + 1).toString(),
                    product.description,
                    product.quantity.toString(),
                    product.unit,
                    product.weight || '',
                    product.rate.toFixed(2),
                    product.amount.toFixed(2)
                ];
                
                rowData.forEach((data, colIndex) => {
                    // Truncate long text
                    const maxWidth = colWidths[colIndex] - 4;
                    let text = data;
                    while (pdf.getTextWidth(text) > maxWidth && text.length > 3) {
                        text = text.substring(0, text.length - 4) + '...';
                    }
                    
                    pdf.text(text, currentX + 2, this.currentY + 4);
                    currentX += colWidths[colIndex];
                });
                
                this.currentY += 6;
            });
            
            // Table border
            pdf.setDrawColor(...this.colors.border);
            pdf.setLineWidth(0.2);
            
            // Vertical lines
            currentX = startX;
            colWidths.forEach(width => {
                pdf.line(currentX, this.currentY - (data.products.length * 6) - 8, currentX, this.currentY);
                currentX += width;
            });
            pdf.line(currentX, this.currentY - (data.products.length * 6) - 8, currentX, this.currentY);
            
            // Horizontal lines
            pdf.line(startX, this.currentY - (data.products.length * 6) - 8, startX + tableWidth, this.currentY - (data.products.length * 6) - 8);
            pdf.line(startX, this.currentY - (data.products.length * 6), startX + tableWidth, this.currentY - (data.products.length * 6));
            pdf.line(startX, this.currentY, startX + tableWidth, this.currentY);
            
            this.currentY += 10;
        } catch (error) {
            console.error('Error adding product table:', error);
        }
    }
    
    // Add financial summary
    addFinancialSummary(pdf, data) {
        try {
            const summaryX = this.pageWidth - this.margin - 60;
            const summaryWidth = 55;
            
            // Summary box
            pdf.setDrawColor(...this.colors.border);
            pdf.setFillColor(248, 249, 250);
            pdf.rect(summaryX, this.currentY, summaryWidth, 35, 'FD');
            
            pdf.setTextColor(...this.colors.text);
            pdf.setFontSize(this.fontSize.small);
            pdf.setFont(undefined, 'normal');
            
            const summaryItems = [
                ['Subtotal:', data.subtotal],
                ['Discount:', data.discount ? `${data.discount}%` : '0%'],
                ['Shipping:', data.shipping || '0.00'],
                ['Tax/VAT:', data.tax ? `${data.tax}%` : '0%'],
                ['Total:', data.totalAmount]
            ];
            
            summaryItems.forEach((item, index) => {
                const yPos = this.currentY + 5 + (index * 5);
                pdf.text(item[0], summaryX + 2, yPos);
                pdf.text(item[1].toString(), summaryX + summaryWidth - 2 - pdf.getTextWidth(item[1].toString()), yPos);
                
                if (index === summaryItems.length - 1) {
                    pdf.setFont(undefined, 'bold');
                    pdf.setFontSize(this.fontSize.normal);
                }
            });
            
            // Amount in words
            if (data.amountWords) {
                this.currentY += 40;
                pdf.setFont(undefined, 'bold');
                pdf.setFontSize(this.fontSize.small);
                pdf.text('Amount in Words:', this.margin, this.currentY);
                
                pdf.setFont(undefined, 'normal');
                const wordsLines = this.splitTextToLines(pdf, data.amountWords, this.pageWidth - (this.margin * 2));
                wordsLines.forEach((line, index) => {
                    pdf.text(line, this.margin, this.currentY + 5 + (index * 4));
                });
                
                this.currentY += 5 + (wordsLines.length * 4) + 5;
            } else {
                this.currentY += 40;
            }
        } catch (error) {
            console.error('Error adding financial summary:', error);
        }
    }
    
    // Add footer
    addFooter(pdf, data) {
        try {
            // Bank details
            if (data.bankAccount !== 'custom' || data.customBank) {
                this.currentY += 10;
                pdf.setFontSize(this.fontSize.small);
                pdf.setFont(undefined, 'bold');
                pdf.text('Bank Details:', this.margin, this.currentY);
                
                pdf.setFont(undefined, 'normal');
                const bankInfo = data.bankAccount === 'custom' ? 
                    data.customBank : 
                    'BRAC BANK, Benapole Branch\nM/S TWT INTERNATIONAL\nA/C No: 2403203439839001';
                
                const bankLines = bankInfo.split('\n');
                bankLines.forEach((line, index) => {
                    pdf.text(line, this.margin, this.currentY + 5 + (index * 4));
                });
                
                this.currentY += 5 + (bankLines.length * 4) + 10;
            }
            
            // Signature area
            const signatureY = Math.max(this.currentY, this.pageHeight - 40);
            
            pdf.setFontSize(this.fontSize.small);
            pdf.setFont(undefined, 'normal');
            
            // Left side - Prepared by
            pdf.text('Prepared by:', this.margin, signatureY);
            pdf.line(this.margin, signatureY + 15, this.margin + 50, signatureY + 15);
            pdf.text('TWT International', this.margin, signatureY + 20);
            
            // Right side - Received by
            const rightX = this.pageWidth - this.margin - 50;
            pdf.text('Received by:', rightX, signatureY);
            pdf.line(rightX, signatureY + 15, rightX + 50, signatureY + 15);
            pdf.text('Client Signature', rightX, signatureY + 20);
            
            // Footer line
            pdf.setDrawColor(...this.colors.primary);
            pdf.setLineWidth(0.5);
            pdf.line(this.margin, this.pageHeight - 10, this.pageWidth - this.margin, this.pageHeight - 10);
            
            // Generated timestamp
            pdf.setFontSize(6);
            pdf.setTextColor(...this.colors.secondary);
            const timestamp = `Generated on ${new Date().toLocaleString()} by TWT Document Generator`;
            const timestampWidth = pdf.getTextWidth(timestamp);
            pdf.text(timestamp, this.pageWidth - this.margin - timestampWidth, this.pageHeight - 5);
            
        } catch (error) {
            console.error('Error adding footer:', error);
        }
    }
    
    // Add QR code
    async addQRCode(pdf, data) {
        try {
            const qrData = {
                company: 'TWT INTERNATIONAL',
                docNo: data.docNo,
                client: data.clientName,
                total: data.totalAmount,
                date: data.docDate
            };
            
            // Generate QR code data URL
            const qrDataURL = await this.generateQRDataURL(JSON.stringify(qrData));
            
            if (qrDataURL) {
                // Add QR code to PDF (bottom right)
                const qrSize = 20;
                const qrX = this.pageWidth - this.margin - qrSize;
                const qrY = this.pageHeight - 50;
                
                pdf.addImage(qrDataURL, 'PNG', qrX, qrY, qrSize, qrSize);
                
                // QR label
                pdf.setFontSize(6);
                pdf.setTextColor(...this.colors.secondary);
                pdf.text('Scan for details', qrX, qrY + qrSize + 3);
            }
        } catch (error) {
            console.error('Error adding QR code:', error);
            // Continue without QR code
        }
    }
    
    // Generate QR code data URL
    generateQRDataURL(text) {
        return new Promise((resolve) => {
            try {
                QRCode.toDataURL(text, {
                    width: 100,
                    height: 100,
                    colorDark: '#000000',
                    colorLight: '#ffffff',
                    margin: 1
                }, (error, url) => {
                    if (error) {
                        console.error('QR generation error:', error);
                        resolve(null);
                    } else {
                        resolve(url);
                    }
                });
            } catch (error) {
                console.error('QR code library not available:', error);
                resolve(null);
            }
        });
    }

    // Load signature image from assets as base64
    async loadSignatureAsBase64() {
        try {
            // Try to load the sign.png from assets
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    canvas.width = this.width;
                    canvas.height = this.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(this, 0, 0);
                    resolve(canvas.toDataURL('image/png'));
                };
                
                img.onerror = function() {
                    console.log('Could not load sign.png, trying default-signature.png');
                    // Try fallback signature
                    const fallbackImg = new Image();
                    fallbackImg.crossOrigin = 'anonymous';
                    
                    fallbackImg.onload = function() {
                        const canvas = document.createElement('canvas');
                        canvas.width = this.width;
                        canvas.height = this.height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(this, 0, 0);
                        resolve(canvas.toDataURL('image/png'));
                    };
                    
                    fallbackImg.onerror = function() {
                        console.log('Could not load any signature image, using generated signature');
                        resolve(null);
                    };
                    
                    fallbackImg.src = 'assets/default-signature.png';
                };
                
                img.src = 'assets/sign.png';
            });
        } catch (error) {
            console.error('Error loading signature:', error);
            return null;
        }
    }

    // Generate signature image as base64
    generateSignatureImageBase64() {
        // Create a canvas for the signature
        const canvas = document.createElement('canvas');
        canvas.width = 360;
        canvas.height = 120;
        const ctx = canvas.getContext('2d');
        
        // Clear canvas with transparent background
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set signature style
        ctx.strokeStyle = '#0066cc';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = '#0066cc';
        
        // Draw a professional signature for "TWT International"
        ctx.beginPath();
        
        // T
        ctx.moveTo(30, 30);
        ctx.lineTo(70, 30);
        ctx.moveTo(50, 30);
        ctx.lineTo(50, 80);
        
        // W
        ctx.moveTo(90, 30);
        ctx.lineTo(100, 80);
        ctx.lineTo(110, 50);
        ctx.lineTo(120, 80);
        ctx.lineTo(130, 30);
        
        // T
        ctx.moveTo(150, 30);
        ctx.lineTo(190, 30);
        ctx.moveTo(170, 30);
        ctx.lineTo(170, 80);
        
        // Decorative flourish
        ctx.moveTo(210, 55);
        ctx.quadraticCurveTo(240, 30, 270, 55);
        ctx.quadraticCurveTo(300, 80, 330, 55);
        
        // Underline
        ctx.moveTo(30, 90);
        ctx.lineTo(330, 90);
        
        ctx.stroke();
        
        // Add text below
        ctx.font = '14px Arial';
        ctx.fillText('Authorized Representative', 110, 110);
        
        // Convert to base64 and return
        return canvas.toDataURL('image/png');
    }

    // Generate signature image
    generateSignatureImage() {
        // Create a canvas for the signature
        const canvas = document.createElement('canvas');
        canvas.width = 180;
        canvas.height = 60;
        const ctx = canvas.getContext('2d');
        
        // Clear canvas with transparent background
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set signature style
        ctx.strokeStyle = '#0066cc';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Draw a stylized signature - "TWT International"
        ctx.beginPath();
        
        // T
        ctx.moveTo(15, 15);
        ctx.lineTo(35, 15);
        ctx.moveTo(25, 15);
        ctx.lineTo(25, 40);
        
        // W
        ctx.moveTo(45, 15);
        ctx.lineTo(50, 40);
        ctx.lineTo(55, 25);
        ctx.lineTo(60, 40);
        ctx.lineTo(65, 15);
        
        // T
        ctx.moveTo(75, 15);
        ctx.lineTo(95, 15);
        ctx.moveTo(85, 15);
        ctx.lineTo(85, 40);
        
        // Decorative flourish
        ctx.moveTo(105, 25);
        ctx.quadraticCurveTo(120, 15, 135, 25);
        ctx.quadraticCurveTo(150, 35, 165, 25);
        
        ctx.stroke();
        
        // Convert to base64 and return as img tag
        const dataURL = canvas.toDataURL('image/png');
        return `<img src="${dataURL}" style="width: 180px; height: 60px; object-fit: contain;" alt="Authorized Signature">`;
    }

    // Create printable div for PNG generation
    async createPrintableDiv(data) {
        // Load signature image first
        const signatureBase64 = await this.loadSignatureAsBase64();
        const signatureSource = signatureBase64 || this.generateSignatureImageBase64();
        
        const div = document.createElement('div');
        div.style.cssText = `
            position: fixed;
            top: -9999px;
            left: -9999px;
            min-width: 1200px;
            max-width: none;
            width: auto;
            background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
            padding: 40px;
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #333;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            overflow: visible;
        `;
        
        div.innerHTML = `
            <div style="border-bottom: 4px solid #0066cc; padding-bottom: 20px; margin-bottom: 25px; background: linear-gradient(135deg, #0066cc 0%, #004d99 100%); color: white; padding: 20px; border-radius: 10px; margin: -20px -20px 25px -20px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h1 style="margin: 0; font-size: 28px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">TWT INTERNATIONAL</h1>
                        <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9; line-height: 1.4;">
                            International Courier Service • Door to Door Service • C&F Agent Service<br>
                            International Payment Support • Product Sourcing • Shipping/Container Support<br>
                            Freight Forwarding • L/C Received Support • Warehouse Support • Supplier Verification<br>
                            Product Quality Verification • Product Packaging Facilities • Worldwide Service
                        </p>
                    </div>
                    <div style="text-align: right;">
                        <h2 style="margin: 0; font-size: 24px; background: rgba(255,255,255,0.2); padding: 10px 20px; border-radius: 25px; backdrop-filter: blur(10px);">${data.docType}</h2>
                    </div>
                </div>
            </div>
            
            <div style="background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%); padding: 15px; margin-bottom: 20px; border-radius: 10px; border-left: 5px solid #0066cc;">
                <div style="font-size: 12px; color: #444; line-height: 1.6;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span><i style="color: #0066cc;">📞</i> +880 1712-959737, +880 1752-457930</span>
                        <span><i style="color: #0066cc;">✉️</i> rahmanazad100@gmail.com</span>
                    </div>
                    <div style="font-size: 11px; color: #666;">
                        ${this.generateOfficeAddressesHTML(data)}
                    </div>
                </div>
            </div>
            
            <div style="background: linear-gradient(135deg, #fff3e0 0%, #fce4ec 100%); padding: 20px; margin-bottom: 25px; border-radius: 10px; border: 2px solid #0066cc;">
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
                    <div>
                        <div style="color: #0066cc; font-weight: bold; margin-bottom: 8px;">📋 Document Details</div>
                        <div style="font-size: 13px; line-height: 1.5;">
                            <div><strong>Document No:</strong> ${data.docNo !== 'N/A' ? data.docNo : 'Not specified'}</div>
                            <div><strong>Date:</strong> ${new Date(data.docDate).toLocaleDateString()}</div>
                            <div><strong>Type:</strong> ${(data.documentType || 'COMMERCIAL_INVOICE').replace('_', ' ')}</div>
                            ${data.invoiceNumber && data.invoiceNumber !== 'N/A' ? `<div><strong>Invoice No:</strong> ${data.invoiceNumber}</div>` : ''}
                        </div>
                    </div>
                    <div>
                        <div style="color: #0066cc; font-weight: bold; margin-bottom: 8px;">🚢 Shipping Details</div>
                        <div style="font-size: 13px; line-height: 1.5;">
                            ${data.fromCountry && data.fromCountry !== 'N/A' ? `<div><strong>From:</strong> ${data.fromCountry}</div>` : ''}
                            ${data.toCountry && data.toCountry !== 'N/A' ? `<div><strong>To:</strong> ${data.toCountry}</div>` : ''}
                            ${data.loadingPort && data.loadingPort !== 'N/A' ? `<div><strong>Loading Port:</strong> ${data.loadingPort}</div>` : ''}
                            ${data.dischargePort && data.dischargePort !== 'N/A' ? `<div><strong>Discharge Port:</strong> ${data.dischargePort}</div>` : ''}
                            ${data.incoterms && data.incoterms !== 'N/A' ? `<div><strong>Incoterms:</strong> ${data.incoterms}</div>` : ''}
                        </div>
                    </div>
                    <div>
                        <div style="color: #0066cc; font-weight: bold; margin-bottom: 8px;">📄 Trade Documents</div>
                        <div style="font-size: 13px; line-height: 1.5;">
                            ${data.lcNumber && data.lcNumber !== 'N/A' ? `<div><strong>L/C No:</strong> ${data.lcNumber}</div>` : ''}
                            ${data.blNumber && data.blNumber !== 'N/A' ? `<div><strong>B/L No:</strong> ${data.blNumber}</div>` : ''}
                            ${data.hsCode && data.hsCode !== 'N/A' ? `<div><strong>HS Code:</strong> ${data.hsCode}</div>` : ''}
                            ${data.customsDecl && data.customsDecl !== 'N/A' ? `<div><strong>Customs:</strong> ${data.customsDecl}</div>` : ''}
                        </div>
                    </div>
                </div>
                ${(data.vesselName && data.vesselName !== 'N/A') || (data.containerNo && data.containerNo !== 'N/A') || (data.sealNo && data.sealNo !== 'N/A') || (data.shippingLine && data.shippingLine !== 'N/A') ? `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(0,102,204,0.3);">
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
                        <div>
                            <div style="color: #0066cc; font-weight: bold; margin-bottom: 8px;">🚢 Vessel Information</div>
                            <div style="font-size: 13px; line-height: 1.5;">
                                ${data.vesselName && data.vesselName !== 'N/A' ? `<div><strong>Vessel:</strong> ${data.vesselName}</div>` : ''}
                                ${data.shippingLine && data.shippingLine !== 'N/A' ? `<div><strong>Shipping Line:</strong> ${data.shippingLine}</div>` : ''}
                                ${data.etdEta && data.etdEta !== 'N/A' ? `<div><strong>ETD/ETA:</strong> ${data.etdEta}</div>` : ''}
                            </div>
                        </div>
                        <div>
                            <div style="color: #0066cc; font-weight: bold; margin-bottom: 8px;">📦 Container Details</div>
                            <div style="font-size: 13px; line-height: 1.5;">
                                ${data.containerNo && data.containerNo !== 'N/A' ? `<div><strong>Container:</strong> ${data.containerNo}</div>` : ''}
                                ${data.sealNo && data.sealNo !== 'N/A' ? `<div><strong>Seal No:</strong> ${data.sealNo}</div>` : ''}
                                ${data.packingListNo && data.packingListNo !== 'N/A' ? `<div><strong>Packing List:</strong> ${data.packingListNo}</div>` : ''}
                            </div>
                        </div>
                        <div>
                            <div style="color: #0066cc; font-weight: bold; margin-bottom: 8px;">📊 Additional Info</div>
                            <div style="font-size: 13px; line-height: 1.5;">
                                <div><strong>Generated:</strong> ${new Date().toLocaleDateString()}</div>
                                <div><strong>Time:</strong> ${new Date().toLocaleTimeString()}</div>
                            </div>
                        </div>
                    </div>
                </div>
                ` : ''}
            </div>
            
            <div style="background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%); padding: 20px; margin-bottom: 25px; border-radius: 10px; border-left: 5px solid #28a745;">
                <h3 style="color: #28a745; margin: 0 0 15px 0; font-size: 18px;">👤 BILL TO:</h3>
                <div style="line-height: 1.6; font-size: 14px;">
                    <div style="font-weight: bold; font-size: 16px; color: #333; margin-bottom: 8px;">${data.clientName !== 'N/A' ? data.clientName : 'Client Name Not Provided'}</div>
                    <div style="color: #555; margin-bottom: 8px;">${data.clientAddress !== 'N/A' ? data.clientAddress.replace(/\n/g, '<br>') : 'Address Not Provided'}</div>
                    ${data.clientPhone && data.clientPhone !== 'N/A' ? `<div style="color: #666;"><strong>📞 Phone:</strong> ${data.clientPhone}</div>` : ''}
                    ${data.clientEmail && data.clientEmail !== 'N/A' ? `<div style="color: #666;"><strong>✉️ Email:</strong> ${data.clientEmail}</div>` : ''}
                </div>
            </div>
            
            ${this.generateColorfulProductTableHTML(data.products, data)}
            
            <div style="margin-top: 30px; display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="flex: 1;">
                    ${this.generateTermsAndConditionsHTML(data)}
                </div>
                <div style="margin-left: 30px;">
                    ${this.generateColorfulFinancialSummaryHTML(data)}
                </div>
            </div>
            
            ${data.amountWords && data.amountWords !== 'N/A' ? `
                <div style="background: linear-gradient(135deg, #fff9c4 0%, #fff59d 100%); padding: 15px; margin-top: 25px; border-radius: 10px; border-left: 5px solid #ffc107;">
                    <div style="color: #e65100; font-weight: bold; margin-bottom: 8px;">💰 Amount in Words:</div>
                    <div style="font-style: italic; color: #333; font-size: 14px;">${data.amountWords}</div>
                </div>
            ` : ''}
            
            ${this.generateBankDetailsHTML(data)}
            
            <div style="margin-top: 40px; display: flex; justify-content: space-between; background: linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%); padding: 25px; border-radius: 10px;">
                <div style="text-align: center;">
                    <p style="margin: 0 0 20px 0; color: #666; font-weight: bold;">Prepared by:</p>
                    <div style="margin: 0 0 10px 0;">
                        <img src="${signatureSource}" style="width: 180px; height: 60px; object-fit: contain;" alt="Authorized Signature">
                    </div>
                    <div style="border-top: 2px solid #0066cc; width: 200px; padding-top: 8px; color: #0066cc; font-weight: bold; margin: 0 auto;">
                        TWT International
                    </div>
                    <div style="font-size: 12px; color: #888; margin-top: 5px;">Authorized Signature</div>
                </div>
                <div style="text-align: center;">
                    <p style="margin: 0 0 20px 0; color: #666; font-weight: bold;">Received by:</p>
                    <div style="margin: 0 0 10px 0; height: 60px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; background: #fafafa;">
                        <span style="color: #999; font-size: 12px;">${data.receivedBy && data.receivedBy !== 'N/A' ? data.receivedBy : 'Signature Required'}</span>
                    </div>
                    <div style="border-top: 2px solid #28a745; width: 200px; padding-top: 8px; color: #28a745; font-weight: bold; margin: 0 auto;">
                        ${data.receivedBy && data.receivedBy !== 'N/A' ? data.receivedBy : 'Client Representative'}
                    </div>
                    <div style="font-size: 12px; color: #888; margin-top: 5px;">Date: ${data.receivedDate && data.receivedDate !== 'N/A' ? data.receivedDate : '___________'}</div>
                </div>
            </div>
            
            <div style="margin-top: 20px; text-align: center; padding: 15px; background: linear-gradient(135deg, #0066cc 0%, #004d99 100%); color: white; border-radius: 10px;">
                <div style="font-size: 12px; opacity: 0.9;">
                    Generated on ${new Date().toLocaleString()} | TWT International Document Generator v2.0
                </div>
            </div>
        `;
        
        return div;
    }
    
    // Generate HTML for product table
    generateProductTableHTML(products) {
        if (!products || products.length === 0) {
            return '<div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 10px; color: #666;"><p>No products added.</p></div>';
        }
        
        let html = `
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                    <tr style="background: #0066cc; color: white;">
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">#</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Description</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Qty</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Unit</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">PKG Gross KG/PCS</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Rate</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        products.forEach((product, index) => {
            const displayName = product.name || 'N/A';
            const displayDescription = product.description || 'N/A';
            const displayWeight = product.weight || 'N/A';
            const displayQuantity = product.quantity || 1;
            const displayUnit = product.unit || 'PCS';
            const displayRate = (product.rate || 0).toFixed(2);
            const displayAmount = (product.amount || 0).toFixed(2);
            
            html += `
                <tr style="background: ${index % 2 === 0 ? 'white' : '#f8f9fa'};">
                    <td style="border: 1px solid #ddd; padding: 6px;">${index + 1}</td>
                    <td style="border: 1px solid #ddd; padding: 6px;">${displayDescription}</td>
                    <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${displayQuantity}</td>
                    <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${displayUnit}</td>
                    <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${displayWeight}</td>
                    <td style="border: 1px solid #ddd; padding: 6px; text-align: right;">${displayRate}</td>
                    <td style="border: 1px solid #ddd; padding: 6px; text-align: right;">${displayAmount}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        return html;
    }

    // Generate colorful product table for PNG
    generateColorfulProductTableHTML(products, data) {
        if (!products || products.length === 0) {
            return `
                <div style="text-align: center; padding: 40px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 15px; color: #666; margin: 20px 0; border: 2px dashed #ccc;">
                    <div style="font-size: 48px; margin-bottom: 15px; opacity: 0.7;">📦</div>
                    <p style="margin: 0; font-size: 16px; font-weight: 500;">No products added to this document.</p>
                    <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">Please add products to generate a complete invoice.</p>
                </div>
            `;
        }
        
        let html = `
            <div style="margin: 25px 0;">
                <h3 style="color: #0066cc; margin-bottom: 20px; font-size: 18px; border-bottom: 3px solid #0066cc; padding-bottom: 8px; display: inline-block;">📦 Products & Services</h3>
                <div style="overflow-x: auto; border-radius: 15px; box-shadow: 0 8px 25px rgba(0,0,0,0.15); background: white;">
                    <table style="width: 100%; border-collapse: collapse; background: white; min-width: max-content;">
                        <thead>
                            <tr style="background: linear-gradient(135deg, #0066cc 0%, #004d99 100%); color: white;">
                                <th style="padding: 15px 10px; text-align: center; font-weight: bold; border: none; font-size: 13px; min-width: 50px;">#</th>
                                <th style="padding: 15px 12px; text-align: left; font-weight: bold; border: none; font-size: 13px; min-width: 150px;">Product Name</th>
                                <th style="padding: 15px 12px; text-align: left; font-weight: bold; border: none; font-size: 13px; min-width: 200px;">Description</th>
                                <th style="padding: 15px 10px; text-align: center; font-weight: bold; border: none; font-size: 13px; min-width: 80px;">Model</th>
                                <th style="padding: 15px 10px; text-align: center; font-weight: bold; border: none; font-size: 13px; min-width: 60px;">Qty</th>
                                <th style="padding: 15px 10px; text-align: center; font-weight: bold; border: none; font-size: 13px; min-width: 60px;">Unit</th>
                                <th style="padding: 15px 12px; text-align: center; font-weight: bold; border: none; font-size: 13px; min-width: 100px;">Weight/Spec</th>
                                <th style="padding: 15px 12px; text-align: center; font-weight: bold; border: none; font-size: 13px; min-width: 120px;">Special Details</th>
                                <th style="padding: 15px 10px; text-align: right; font-weight: bold; border: none; font-size: 13px; min-width: 80px;">Rate</th>
                                <th style="padding: 15px 10px; text-align: right; font-weight: bold; border: none; font-size: 13px; min-width: 100px;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        products.forEach((product, index) => {
            const bgColor = index % 2 === 0 ? '#ffffff' : '#f8f9fa';
            const borderColor = index % 2 === 0 ? '#e3f2fd' : '#f3e5f5';
            
            // Safely handle potentially undefined values
            const displayName = product.name || 'N/A';
            const displayDescription = product.description || 'N/A';
            const displayModel = product.model || 'N/A';
            const displayQuantity = product.quantity || 1;
            const displayUnit = product.unit || 'PCS';
            const displayWeight = product.weight || 'N/A';
            const displaySpecialDetails = product.specialDetails || 'N/A';
            const displayRate = (product.rate || 0).toFixed(2);
            const displayAmount = (product.amount || 0).toFixed(2);
            
            html += `
                <tr style="background: ${bgColor}; border-bottom: 1px solid ${borderColor}; transition: all 0.3s ease;">
                    <td style="padding: 12px 10px; text-align: center; font-weight: bold; color: #0066cc; border: none; font-size: 13px;">${index + 1}</td>
                    <td style="padding: 12px 12px; border: none; color: #333; font-weight: 600; font-size: 13px; line-height: 1.4; word-wrap: break-word;">${displayName}</td>
                    <td style="padding: 12px 12px; border: none; color: #555; font-weight: 400; font-size: 13px; line-height: 1.4; word-wrap: break-word;">${displayDescription}</td>
                    <td style="padding: 12px 10px; text-align: center; border: none; color: #666; font-size: 12px; font-weight: 500;">${displayModel}</td>
                    <td style="padding: 12px 10px; text-align: center; border: none; color: #333; font-weight: bold; font-size: 13px;">${displayQuantity}</td>
                    <td style="padding: 12px 10px; text-align: center; border: none; color: #666; font-weight: 500; font-size: 12px;">${displayUnit}</td>
                    <td style="padding: 12px 12px; text-align: center; border: none; color: #666; font-style: italic; font-size: 12px; line-height: 1.3; word-wrap: break-word;">${displayWeight}</td>
                    <td style="padding: 12px 12px; text-align: center; border: none; color: #666; font-size: 12px; line-height: 1.3; word-wrap: break-word;">${displaySpecialDetails}</td>
                    <td style="padding: 12px 10px; text-align: right; border: none; color: #28a745; font-weight: bold; font-size: 13px;">${this.getCurrencySymbol(data ? data.currency : 'BDT')} ${displayRate}</td>
                    <td style="padding: 12px 10px; text-align: right; border: none; color: #dc3545; font-weight: bold; font-size: 13px; background: linear-gradient(135deg, #fff3e0 0%, #fce4ec 50%);">${this.getCurrencySymbol(data ? data.currency : 'BDT')} ${displayAmount}</td>
                </tr>
            `;
        });
        
        // Calculate totals
        const totalQty = products.reduce((sum, p) => sum + (parseFloat(p.quantity) || 0), 0);
        const totalAmount = products.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
        
        html += `
                        <tr style="background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%); border-top: 3px solid #0066cc; font-weight: bold;">
                            <td colspan="4" style="padding: 15px 10px; text-align: right; color: #0066cc; font-size: 14px; font-weight: bold;">TOTALS:</td>
                            <td style="padding: 15px 8px; text-align: center; color: #333; font-size: 13px; font-weight: bold; background: #e3f2fd;">${totalQty}</td>
                            <td colspan="4" style="padding: 15px 8px; text-align: right; color: #0066cc; font-size: 14px; font-weight: bold;">GRAND TOTAL:</td>
                            <td style="padding: 15px 8px; text-align: right; color: #dc3545; font-weight: bold; font-size: 16px; background: linear-gradient(135deg, #fff3e0 0%, #fce4ec 100%);">${this.getCurrencySymbol(data ? data.currency : 'BDT')} ${totalAmount.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        `;
        
        return html;
    }

    // Generate office addresses from form data
    generateOfficeAddressesHTML(data) {
        const officeItems = document.querySelectorAll('.office-address-item');
        let officesHTML = '';
        
        if (officeItems.length > 0) {
            officeItems.forEach(item => {
                const cityInput = item.querySelector('.office-city');
                const addressInput = item.querySelector('.office-address');
                const city = cityInput ? cityInput.value : '';
                const address = addressInput ? addressInput.value : '';
                if (city && address) {
                    officesHTML += `<div>🏢 ${city}: ${address}</div>`;
                }
            });
        }
        
        // Fallback to default if no offices are entered
        if (!officesHTML) {
            officesHTML = `
                <div>🏢 Chittagong: Jafor Mantion, Gosailidanga Barikmia School Road (1st Floor)</div>
                <div>🏢 Dhaka: 60/E dewan Complex purana palton | Benapole: Alikador Building, Benapole Bazar</div>
            `;
        }
        
        return officesHTML;
    }

    // Generate bank details from multiple accounts
    generateBankDetailsHTML(data) {
        const bankItems = document.querySelectorAll('.bank-account-item');
        let banksHTML = '';
        
        if (bankItems.length > 0) {
            bankItems.forEach(item => {
                const select = item.querySelector('select[name="bankAccount"]');
                const customDetails = item.querySelector('.custom-bank-details');
                
                if (select && select.value === 'custom' && customDetails && customDetails.value) {
                    banksHTML += `<div style="margin-bottom: 8px;">${customDetails.value}</div>`;
                } else if (select && select.value !== 'custom') {
                    const selectedOption = select.options[select.selectedIndex];
                    if (selectedOption && selectedOption.text) {
                        banksHTML += `<div style="margin-bottom: 8px;">${selectedOption.text}</div>`;
                    }
                }
            });
        }
        
        // Fallback to default if no banks are selected
        if (!banksHTML) {
            banksHTML = '<div>BRAC BANK, Benapole Branch<br>M/S TWT INTERNATIONAL<br>A/C No: 2403203439839001</div>';
        }
        
        return `
            <div style="background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%); padding: 20px; margin-top: 25px; border-radius: 10px; border-left: 5px solid #28a745;">
                <h4 style="color: #2e7d32; margin: 0 0 15px 0; font-size: 16px;">🏦 Payment Methods</h4>
                <div style="color: #555; line-height: 1.6; font-size: 14px;">
                    ${banksHTML}
                </div>
            </div>
        `;
    }

    // Get currency symbol
    getCurrencySymbol(currency) {
        const symbols = {
            'BDT': '৳',
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'INR': '₹',
            'CNY': '¥',
            'JPY': '¥',
            'AED': 'د.إ',
            'SAR': 'ر.س'
        };
        return symbols[currency] || '৳';
    }

    // Generate colorful financial summary
    generateColorfulFinancialSummaryHTML(data) {
        const subtotal = parseFloat(data.subtotal || 0);
        const discount = parseFloat(data.discount || 0);
        const shipping = parseFloat(data.shipping || 0);
        const tax = parseFloat(data.tax || 0);
        const advance = parseFloat(data.advance || 0);
        const totalAmount = parseFloat(data.totalAmount || 0);
        const balance = parseFloat(data.balance || 0);
        const currencySymbol = this.getCurrencySymbol(data.currency);
        
        // Calculate discount amount
        const discountAmount = (subtotal * discount) / 100;
        
        // Calculate tax amount
        const taxableAmount = subtotal - discountAmount + shipping;
        const taxAmount = (taxableAmount * tax) / 100;
        
        return `
            <div style="background: linear-gradient(135deg, #e1f5fe 0%, #f3e5f5 100%); padding: 20px; border-radius: 15px; border: 2px solid #0066cc; min-width: 300px; box-shadow: 0 4px 12px rgba(0,102,204,0.2);">
                <h4 style="color: #0066cc; margin: 0 0 15px 0; text-align: center; font-size: 16px; border-bottom: 2px solid #0066cc; padding-bottom: 8px;">💰 Financial Summary</h4>
                <div style="space-y: 8px;">
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(0,102,204,0.2);">
                        <span style="color: #555; font-weight: 500;">Subtotal:</span>
                        <span style="color: #333; font-weight: bold;">${currencySymbol} ${subtotal.toFixed(2)}</span>
                    </div>
                    ${discount > 0 ? `
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(0,102,204,0.2);">
                        <span style="color: #555; font-weight: 500;">Discount (${discount}%):</span>
                        <span style="color: #dc3545; font-weight: bold;">-${currencySymbol} ${discountAmount.toFixed(2)}</span>
                    </div>
                    ` : ''}
                    ${shipping > 0 ? `
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(0,102,204,0.2);">
                        <span style="color: #555; font-weight: 500;">Shipping:</span>
                        <span style="color: #333; font-weight: bold;">${currencySymbol} ${shipping.toFixed(2)}</span>
                    </div>
                    ` : ''}
                    ${tax > 0 ? `
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(0,102,204,0.2);">
                        <span style="color: #555; font-weight: 500;">Tax/VAT (${tax}%):</span>
                        <span style="color: #dc3545; font-weight: bold;">${currencySymbol} ${taxAmount.toFixed(2)}</span>
                    </div>
                    ` : ''}
                    <div style="display: flex; justify-content: space-between; padding: 12px 0; background: linear-gradient(135deg, #0066cc 0%, #004d99 100%); margin: 10px -10px 5px -10px; padding-left: 15px; padding-right: 15px; border-radius: 8px;">
                        <span style="color: white; font-weight: bold; font-size: 16px;">TOTAL AMOUNT:</span>
                        <span style="color: white; font-weight: bold; font-size: 18px;">${currencySymbol} ${totalAmount.toFixed(2)}</span>
                    </div>
                    ${advance > 0 ? `
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(220,53,69,0.3);">
                        <span style="color: #dc3545; font-weight: 500;">Advance Paid:</span>
                        <span style="color: #dc3545; font-weight: bold;">-${currencySymbol} ${advance.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 12px 0; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); margin: 5px -10px -10px -10px; padding-left: 15px; padding-right: 15px; border-radius: 0 0 13px 13px;">
                        <span style="color: white; font-weight: bold; font-size: 16px;">BALANCE DUE:</span>
                        <span style="color: white; font-weight: bold; font-size: 18px;">${currencySymbol} ${balance.toFixed(2)}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // Generate terms and conditions
    generateTermsAndConditionsHTML(data) {
        let termsContent = '';
        
        const hasValidTerms = (data.paymentTerms && data.paymentTerms !== 'N/A') || 
                             (data.deliveryTerms && data.deliveryTerms !== 'N/A') || 
                             (data.validityPeriod && data.validityPeriod !== 'N/A') || 
                             (data.additionalTerms && data.additionalTerms !== 'N/A');
        
        if (hasValidTerms) {
            termsContent += '<ul style="margin: 0; padding-left: 20px; color: #555; line-height: 1.6; font-size: 13px;">';
            
            if (data.paymentTerms && data.paymentTerms !== 'N/A') {
                termsContent += `<li style="margin-bottom: 8px;"><strong>Payment:</strong> ${data.paymentTerms}</li>`;
            }
            if (data.deliveryTerms && data.deliveryTerms !== 'N/A') {
                termsContent += `<li style="margin-bottom: 8px;"><strong>Delivery:</strong> ${data.deliveryTerms}</li>`;
            }
            if (data.validityPeriod && data.validityPeriod !== 'N/A') {
                termsContent += `<li style="margin-bottom: 8px;"><strong>Validity:</strong> ${data.validityPeriod}</li>`;
            }
            if (data.additionalTerms && data.additionalTerms !== 'N/A') {
                termsContent += `<li style="margin-bottom: 8px;">${data.additionalTerms}</li>`;
            }
        }
        
        if (data.includeStandardTerms) {
            if (!termsContent) {
                termsContent = '<ul style="margin: 0; padding-left: 20px; color: #555; line-height: 1.6; font-size: 13px;">';
            }
            termsContent += `
                <li style="margin-bottom: 8px;">Quality: As per industry standards</li>
                <li style="margin-bottom: 8px;">Returns: Subject to company policy</li>
                <li style="margin-bottom: 8px;">Disputes: Subject to Chittagong jurisdiction</li>
                <li style="margin-bottom: 0;">All prices are subject to change without notice</li>
            `;
        }
        
        if (termsContent) {
            termsContent += '</ul>';
        } else {
            termsContent = `
                <ul style="margin: 0; padding-left: 20px; color: #555; line-height: 1.6; font-size: 13px;">
                    <li style="margin-bottom: 8px;">Payment terms: As per agreement</li>
                    <li style="margin-bottom: 8px;">Delivery: As per shipping schedule</li>
                    <li style="margin-bottom: 8px;">Quality: As per industry standards</li>
                    <li style="margin-bottom: 8px;">Returns: Subject to company policy</li>
                    <li style="margin-bottom: 8px;">Disputes: Subject to Chittagong jurisdiction</li>
                    <li style="margin-bottom: 0;">All prices are subject to change without notice</li>
                </ul>
            `;
        }
        
        return `
            <div style="background: linear-gradient(135deg, #fff3e0 0%, #fce4ec 100%); padding: 20px; border-radius: 15px; border-left: 5px solid #ff9800; max-width: 400px;">
                <h4 style="color: #e65100; margin: 0 0 15px 0; font-size: 16px;">📋 Terms & Conditions</h4>
                ${termsContent}
            </div>
        `;
    }
    
    // Collect form data - safely handle null elements
    collectFormData() {
        const getValue = (id, defaultVal = '') => {
            try {
                const element = document.getElementById(id);
                if (!element) {
                    console.warn(`Element with ID '${id}' not found, using default value: ${defaultVal}`);
                    return defaultVal;
                }
                const value = element.value;
                return (value !== null && value !== undefined && value.trim() !== '') ? value : defaultVal;
            } catch (error) {
                console.error(`Error getting value for element '${id}':`, error);
                return defaultVal;
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
        
        console.log('Starting form data collection...');
        
        const formData = {
            docType: getValue('docType', 'DOCUMENT'),
            docNo: getValue('docNo', 'DOC-' + Date.now()),
            docDate: getValue('docDate', new Date().toISOString().split('T')[0]),
            clientName: getValue('clientName', 'N/A'),
            clientAddress: getValue('clientAddress', 'N/A'),
            clientPhone: getValue('clientPhone', 'N/A'),
            clientEmail: getValue('clientEmail', 'N/A'),
            // Import/Export fields
            fromCountry: getValue('fromCountry', 'N/A'),
            toCountry: getValue('toCountry', 'N/A'),
            loadingPort: getValue('loadingPort', 'N/A'),
            dischargePort: getValue('dischargePort', 'N/A'),
            lcNumber: getValue('lcNumber', 'N/A'),
            blNumber: getValue('blNumber', 'N/A'),
            hsCode: getValue('hsCode', 'N/A'),
            customsDecl: getValue('customsDecl', 'N/A'),
            invoiceNumber: getValue('invoiceNumber', 'N/A'),
            packingListNo: getValue('packingListNo', 'N/A'),
            containerNo: getValue('containerNo', 'N/A'),
            sealNo: getValue('sealNo', 'N/A'),
            vesselName: getValue('vesselName', 'N/A'),
            etdEta: getValue('etdEta', 'N/A'),
            shippingLine: getValue('shippingLine', 'N/A'),
            incoterms: getValue('incoterms', 'N/A'),
            documentType: getValue('documentType', 'COMMERCIAL_INVOICE'),
            receivedBy: getValue('receivedBy', 'N/A'),
            receivedDate: getValue('receivedDate', 'N/A'),
            // Financial fields
            currency: getValue('currency', 'BDT'),
            exchangeRate: getValue('exchangeRate', '1.00'),
            bankAccount: getValue('bankAccount', 'default'),
            customBank: getValue('customBank', 'N/A'),
            subtotal: getValue('subtotal', '0.00'),
            discount: getValue('discount', '0'),
            shipping: getValue('shipping', '0.00'),
            tax: getValue('tax', '0'),
            totalAmount: getValue('totalAmount', '0.00'),
            amountWords: getValue('amountWords', 'N/A'),
            advance: getValue('advance', '0.00'),
            balance: getValue('balance', '0.00'),
            paymentTerms: getValue('paymentTerms', 'N/A'),
            deliveryTerms: getValue('deliveryTerms', 'N/A'),
            validityPeriod: getValue('validityPeriod', 'N/A'),
            additionalTerms: getValue('additionalTerms', 'N/A'),
            includeStandardTerms: getCheckboxValue('includeStandardTerms', false),
            products: window.products || []
        };
        
        console.log('Form data collection completed successfully:', formData);
        return formData;
    }
    
    validateData(data) {
        // Make all fields optional - just ensure basic structure exists
        if (!data.docType) {
            data.docType = 'DOCUMENT';
        }
        if (!data.docNo) {
            data.docNo = 'DOC-' + Date.now();
        }
        if (!data.clientName) {
            data.clientName = 'Client Name';
        }
        if (!data.products || data.products.length === 0) {
            data.products = [];
        }
        
        return true;
    }
    
    // Prompt user for filename
    async promptForFilename(data) {
        return new Promise((resolve) => {
            // Create modal for filename input
            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.id = 'filenameModal';
            modal.setAttribute('data-bs-backdrop', 'static');
            modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-edit me-2"></i>Set PNG Filename
                            </h5>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label for="pngFilename" class="form-label">Enter filename (without .png extension):</label>
                                <input type="text" class="form-control" id="pngFilename" 
                                       value="${this.getDocumentFileName(data)}" 
                                       placeholder="Enter filename">
                                <div class="form-text">
                                    <i class="fas fa-info-circle me-1"></i>
                                    The file will be saved as: <strong><span id="previewFilename">${this.getDocumentFileName(data)}.png</span></strong>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" id="cancelFilename">
                                <i class="fas fa-times me-2"></i>Cancel
                            </button>
                            <button type="button" class="btn btn-primary" id="confirmFilename">
                                <i class="fas fa-download me-2"></i>Download PNG
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Initialize modal
            const modalInstance = new bootstrap.Modal(modal);
            modalInstance.show();
            
            const filenameInput = document.getElementById('pngFilename');
            const previewFilename = document.getElementById('previewFilename');
            const confirmBtn = document.getElementById('confirmFilename');
            const cancelBtn = document.getElementById('cancelFilename');
            
            // Update preview as user types
            filenameInput.addEventListener('input', function() {
                const filename = this.value.trim() || 'document';
                previewFilename.textContent = `${filename}.png`;
            });
            
            // Focus on input and select text
            setTimeout(() => {
                filenameInput.focus();
                filenameInput.select();
            }, 300);
            
            // Handle Enter key
            filenameInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    confirmBtn.click();
                }
            });
            
            // Handle confirm
            confirmBtn.addEventListener('click', function() {
                const filename = filenameInput.value.trim() || 'document';
                modalInstance.hide();
                modal.remove();
                resolve(filename);
            });
            
            // Handle cancel
            cancelBtn.addEventListener('click', function() {
                modalInstance.hide();
                modal.remove();
                resolve(null); // Return null to indicate cancellation
            });
            
            // Handle modal close
            modal.addEventListener('hidden.bs.modal', function() {
                if (modal.parentNode) {
                    modal.remove();
                }
            });
        });
    }
    
    getDocumentFileName(data) {
        const docType = (data && data.docType) || document.getElementById('docType').value || 'DOCUMENT';
        const docNo = (data && data.docNo) || document.getElementById('docNo').value || 'NO_NUMBER';
        const date = new Date().toISOString().split('T')[0];
        return `${docType}_${docNo}_${date}`;
    }
    
    splitTextToLines(pdf, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        words.forEach(word => {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            if (pdf.getTextWidth(testLine) > maxWidth) {
                if (currentLine) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    lines.push(word);
                }
            } else {
                currentLine = testLine;
            }
        });
        
        if (currentLine) {
            lines.push(currentLine);
        }
        
        return lines;
    }
    
    saveToHistory(data) {
        try {
            if (typeof twtStorage !== 'undefined') {
                twtStorage.addToHistory(data);
            }
        } catch (error) {
            console.error('Error saving to history:', error);
        }
    }
    
    showLoading() {
        const loadingHTML = `
            <div class="spinner-overlay" id="pdfLoading">
                <div class="text-center text-white">
                    <div class="spinner-border spinner-border-lg" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Generating document...</p>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', loadingHTML);
    }
    
    hideLoading() {
        const loading = document.getElementById('pdfLoading');
        if (loading) {
            loading.remove();
        }
    }
    
    showToast(message, type = 'info') {
        if (typeof showToast === 'function') {
            showToast(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
            alert(message);
        }
    }
}

// Create global PDF generator instance
const twtPDFGenerator = new TWTPDFGenerator();

// Export functions for global use
function generatePDF() {
    return twtPDFGenerator.generatePDF();
}

function generatePNG() {
    return new Promise(async (resolve, reject) => {
        try {
            console.log('Starting PNG generation from global function...');
            
            // First check if DOM is ready
            if (document.readyState !== 'complete') {
                console.log('Waiting for DOM to be ready...');
                await new Promise(resolve => {
                    if (document.readyState === 'complete') {
                        resolve();
                    } else {
                        window.addEventListener('load', resolve, { once: true });
                    }
                });
            }
            
            // Wait for dependencies to load (especially for GitHub Pages)
            let html2canvasRetries = 0;
            while (typeof html2canvas === 'undefined' && html2canvasRetries < 30) {
                console.log(`Waiting for html2canvas... attempt ${html2canvasRetries + 1}`);
                await new Promise(resolve => setTimeout(resolve, 300));
                html2canvasRetries++;
            }
            
            if (typeof html2canvas === 'undefined') {
                throw new Error('html2canvas library failed to load. Please refresh the page and try again.');
            }
            
            // Check if the PDF generator is properly initialized
            if (typeof twtPDFGenerator === 'undefined') {
                console.log('PDF generator not initialized, creating new instance...');
                
                // Wait a bit more for the PDFGenerator class to be available
                let generatorRetries = 0;
                while (typeof PDFGenerator === 'undefined' && generatorRetries < 10) {
                    console.log(`Waiting for PDFGenerator class... attempt ${generatorRetries + 1}`);
                    await new Promise(resolve => setTimeout(resolve, 200));
                    generatorRetries++;
                }
                
                if (typeof PDFGenerator !== 'undefined') {
                    window.twtPDFGenerator = new PDFGenerator();
                } else {
                    throw new Error('PDFGenerator class not available');
                }
            }
            
            // Ensure products array exists
            if (!window.products) {
                window.products = [];
            }
            
            console.log('All dependencies ready, starting PNG generation...');
            const result = await twtPDFGenerator.generatePNG();
            resolve(result);
            
        } catch (error) {
            console.error('Error in generatePNG wrapper:', error);
            
            // Show user-friendly error message
            let errorMessage = 'PNG generation failed. ';
            
            if (error.message.includes('html2canvas')) {
                errorMessage += 'Required libraries are still loading. Please wait a moment and try again.';
            } else if (error.message.includes('Cannot read properties of null')) {
                errorMessage += 'Page is still loading. Please wait a moment and try again.';
            } else {
                errorMessage += 'Please refresh the page and try again.';
            }
            
            if (typeof showToast === 'function') {
                showToast(errorMessage, 'error');
            } else {
                alert(errorMessage + '\nError: ' + error.message);
            }
            
            reject(error);
        }
    });
}

// Fallback PNG generation function
function generatePNGFallback() {
    try {
        console.log('Using fallback PNG generation method...');
        
        // Basic form data collection with maximum safety
        const getValueSafe = (id) => {
            try {
                const el = document.getElementById(id);
                return el ? (el.value || 'N/A') : 'N/A';
            } catch {
                return 'N/A';
            }
        };
        
        const basicData = {
            docType: getValueSafe('docType'),
            docNo: getValueSafe('docNo'),
            clientName: getValueSafe('clientName'),
            totalAmount: getValueSafe('totalAmount') || '0.00'
        };
        
        alert(`Document Summary:\nType: ${basicData.docType}\nNumber: ${basicData.docNo}\nClient: ${basicData.clientName}\nTotal: ${basicData.totalAmount}\n\nFull PNG generation is temporarily unavailable. Please try refreshing the page.`);
        
    } catch (error) {
        console.error('Even fallback failed:', error);
        alert('Unable to generate document. Please refresh the page and try again.');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TWTPDFGenerator, twtPDFGenerator, generatePDF, generatePNG };
}
