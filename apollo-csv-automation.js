// Apollo Audit System - CSV Automation & Export

// CSV Export Classes and Functions
class CSVExporter {
    constructor() {
        this.dateFormat = 'YYYY-MM-DD HH:mm:ss';
    }

    /**
     * Export all audits to CSV format
     */
    exportAuditsToCSV(audits = null) {
        const auditData = audits || allAudits;
        
        if (auditData.length === 0) {
            showMessage('No audits to export.', 'info');
            return null;
        }

        const csvContent = this.generateAuditCSV(auditData);
        this.downloadCSV(csvContent, `apollo-audits-${this.getFormattedDate()}.csv`);
        return csvContent;
    }

    /**
     * Export audit standards to CSV
     */
    exportStandardsToCSV(audits = null) {
        const auditData = audits || allAudits;
        
        if (auditData.length === 0) {
            showMessage('No audits to export.', 'info');
            return null;
        }

        const csvContent = this.generateStandardsCSV(auditData);
        this.downloadCSV(csvContent, `apollo-standards-${this.getFormattedDate()}.csv`);
        return csvContent;
    }

    /**
     * Export compliance report to CSV
     */
    exportComplianceReportToCSV(audits = null) {
        const auditData = audits || allAudits;
        
        if (auditData.length === 0) {
            showMessage('No audits to export.', 'info');
            return null;
        }

        const csvContent = this.generateComplianceReportCSV(auditData);
        this.downloadCSV(csvContent, `apollo-compliance-report-${this.getFormattedDate()}.csv`);
        return csvContent;
    }

    /**
     * Export auditor performance to CSV
     */
    exportAuditorPerformanceToCSV(audits = null) {
        const auditData = audits || allAudits;
        
        if (auditData.length === 0) {
            showMessage('No audits to export.', 'info');
            return null;
        }

        const csvContent = this.generateAuditorPerformanceCSV(auditData);
        this.downloadCSV(csvContent, `apollo-auditor-performance-${this.getFormattedDate()}.csv`);
        return csvContent;
    }

    /**
     * Export location/zone audit data to CSV
     */
    exportLocationDataToCSV(audits = null) {
        const auditData = audits || allAudits;
        
        if (auditData.length === 0) {
            showMessage('No audits to export.', 'info');
            return null;
        }

        const csvContent = this.generateLocationDataCSV(auditData);
        this.downloadCSV(csvContent, `apollo-location-data-${this.getFormattedDate()}.csv`);
        return csvContent;
    }

    /**
     * Generate Main Audit CSV
     */
    generateAuditCSV(audits) {
        const headers = [
            'Audit ID',
            'Timestamp',
            'Audit Type',
            'Audit Code',
            'Auditor Name',
            'Auditor Role',
            'Date',
            'Time',
            'Location/Zone',
            'Department',
            'Items Audited',
            'Defects Found',
            'Defect Rate (%)',
            'Duration (minutes)',
            'Overall Rating',
            'Status',
            'Observations',
            'Findings',
            'Recommendations'
        ];

        const rows = audits.map(audit => [
            audit.id,
            audit.timestamp,
            audit.auditTypeName,
            audit.auditType,
            audit.auditorName,
            audit.auditorRole,
            audit.auditDate,
            audit.auditTime,
            audit.location,
            audit.department,
            audit.itemsAudited,
            audit.defectsFound,
            audit.defectRate.toFixed(2),
            audit.durationMinutes,
            audit.overallRating,
            audit.status,
            this.escapeCSV(audit.observations),
            this.escapeCSV(audit.findings || ''),
            this.escapeCSV(audit.recommendations || '')
        ]);

        return this.formatCSV(headers, rows);
    }

    /**
     * Generate Standards Compliance CSV
     */
    generateStandardsCSV(audits) {
        const headers = [
            'Audit ID',
            'Audit Type',
            'Auditor Name',
            'Date',
            'Location',
            'Standard',
            'Compliant (Yes/No)'
        ];

        const rows = [];
        
        audits.forEach(audit => {
            Object.entries(audit.standards).forEach(([standard, compliant]) => {
                rows.push([
                    audit.id,
                    audit.auditTypeName,
                    audit.auditorName,
                    audit.auditDate,
                    audit.location,
                    this.formatStandardName(standard),
                    compliant ? 'Yes' : 'No'
                ]);
            });
        });

        return this.formatCSV(headers, rows);
    }

    /**
     * Generate Compliance Report CSV
     */
    generateComplianceReportCSV(audits) {
        const stats = this.calculateComplianceStats(audits);
        
        const headers = [
            'Metric',
            'Value',
            'Percentage'
        ];

        const rows = [
            ['Total Audits', audits.length, '100%'],
            ['Compliant Audits', stats.compliant, `${stats.complianceRate}%`],
            ['Non-Compliant Audits', stats.nonCompliant, `${(100 - stats.complianceRate).toFixed(1)}%`],
            ['Average Defect Rate', `${stats.avgDefectRate.toFixed(2)}%`, ''],
            ['Average Rating', stats.avgRating.toFixed(2), ''],
            ['Average Duration (min)', stats.avgDuration.toFixed(1), ''],
            ['', '', ''],
            ['Compliance by Type', '', ''],
            ...Object.entries(stats.byType).map(([type, data]) => [
                type,
                `${data.compliant}/${data.total}`,
                `${((data.compliant / data.total) * 100).toFixed(1)}%`
            ]),
            ['', '', ''],
            ['Compliance by Department', '', ''],
            ...Object.entries(stats.byDepartment).map(([dept, data]) => [
                dept,
                `${data.compliant}/${data.total}`,
                `${((data.compliant / data.total) * 100).toFixed(1)}%`
            ])
        ];

        return this.formatCSV(headers, rows);
    }

    /**
     * Generate Auditor Performance CSV
     */
    generateAuditorPerformanceCSV(audits) {
        const stats = this.calculateAuditorStats(audits);
        
        const headers = [
            'Auditor Name',
            'Role',
            'Total Audits',
            'Compliant',
            'Compliance Rate (%)',
            'Average Duration (min)',
            'Average Rating',
            'Average Defect Rate (%)',
            'Last Audit'
        ];

        const rows = Object.values(stats).map(auditor => [
            auditor.name,
            auditor.role,
            auditor.totalAudits,
            auditor.compliant,
            auditor.complianceRate.toFixed(1),
            auditor.avgDuration.toFixed(1),
            auditor.avgRating.toFixed(2),
            auditor.avgDefectRate.toFixed(2),
            auditor.lastAudit
        ]);

        return this.formatCSV(headers, rows);
    }

    /**
     * Generate Location Data CSV
     */
    generateLocationDataCSV(audits) {
        const stats = this.calculateLocationStats(audits);
        
        const headers = [
            'Location/Zone',
            'Department',
            'Total Audits',
            'Compliant',
            'Non-Compliant',
            'Compliance Rate (%)',
            'Average Defects',
            'Average Rating',
            'Last Audit'
        ];

        const rows = Object.values(stats).map(location => [
            location.name,
            location.department,
            location.totalAudits,
            location.compliant,
            location.nonCompliant,
            location.complianceRate.toFixed(1),
            location.avgDefects.toFixed(2),
            location.avgRating.toFixed(2),
            location.lastAudit
        ]);

        return this.formatCSV(headers, rows);
    }

    /**
     * Calculate compliance statistics
     */
    calculateComplianceStats(audits) {
        const compliant = audits.filter(a => a.status === 'Compliant').length;
        const nonCompliant = audits.length - compliant;
        
        let totalDefects = 0;
        let totalRating = 0;
        let totalDuration = 0;
        const byType = {};
        const byDepartment = {};

        audits.forEach(audit => {
            totalDefects += audit.defectsFound;
            totalRating += audit.overallRating;
            totalDuration += audit.durationMinutes;

            // By Type
            if (!byType[audit.auditTypeName]) {
                byType[audit.auditTypeName] = { compliant: 0, total: 0 };
            }
            byType[audit.auditTypeName].total++;
            if (audit.status === 'Compliant') {
                byType[audit.auditTypeName].compliant++;
            }

            // By Department
            if (!byDepartment[audit.department]) {
                byDepartment[audit.department] = { compliant: 0, total: 0 };
            }
            byDepartment[audit.department].total++;
            if (audit.status === 'Compliant') {
                byDepartment[audit.department].compliant++;
            }
        });

        return {
            compliant,
            nonCompliant,
            complianceRate: audits.length > 0 ? ((compliant / audits.length) * 100).toFixed(1) : 0,
            avgDefectRate: audits.length > 0 ? (totalDefects / audits.length) : 0,
            avgRating: audits.length > 0 ? (totalRating / audits.length) : 0,
            avgDuration: audits.length > 0 ? (totalDuration / audits.length) : 0,
            byType,
            byDepartment
        };
    }

    /**
     * Calculate auditor statistics
     */
    calculateAuditorStats(audits) {
        const stats = {};

        audits.forEach(audit => {
            if (!stats[audit.auditorName]) {
                stats[audit.auditorName] = {
                    name: audit.auditorName,
                    role: audit.auditorRole,
                    totalAudits: 0,
                    compliant: 0,
                    totalRating: 0,
                    totalDuration: 0,
                    totalDefects: 0,
                    lastAudit: audit.auditDate
                };
            }

            stats[audit.auditorName].totalAudits++;
            if (audit.status === 'Compliant') {
                stats[audit.auditorName].compliant++;
            }
            stats[audit.auditorName].totalRating += audit.overallRating;
            stats[audit.auditorName].totalDuration += audit.durationMinutes;
            stats[audit.auditorName].totalDefects += audit.defectsFound;
            stats[audit.auditorName].lastAudit = audit.auditDate;
        });

        Object.values(stats).forEach(auditor => {
            auditor.complianceRate = (auditor.compliant / auditor.totalAudits) * 100;
            auditor.avgRating = auditor.totalRating / auditor.totalAudits;
            auditor.avgDuration = auditor.totalDuration / auditor.totalAudits;
            auditor.avgDefectRate = (auditor.totalDefects / auditor.totalAudits);
        });

        return stats;
    }

    /**
     * Calculate location statistics
     */
    calculateLocationStats(audits) {
        const stats = {};

        audits.forEach(audit => {
            const key = `${audit.location}-${audit.department}`;
            if (!stats[key]) {
                stats[key] = {
                    name: audit.location,
                    department: audit.department,
                    totalAudits: 0,
                    compliant: 0,
                    nonCompliant: 0,
                    totalDefects: 0,
                    totalRating: 0,
                    lastAudit: audit.auditDate
                };
            }

            stats[key].totalAudits++;
            if (audit.status === 'Compliant') {
                stats[key].compliant++;
            } else {
                stats[key].nonCompliant++;
            }
            stats[key].totalDefects += audit.defectsFound;
            stats[key].totalRating += audit.overallRating;
            stats[key].lastAudit = audit.auditDate;
        });

        Object.values(stats).forEach(location => {
            location.complianceRate = (location.compliant / location.totalAudits) * 100;
            location.avgDefects = location.totalDefects / location.totalAudits;
            location.avgRating = location.totalRating / location.totalAudits;
        });

        return stats;
    }

    /**
     * Format CSV data
     */
    formatCSV(headers, rows) {
        const csvArray = [headers, ...rows];
        return csvArray.map(row => 
            row.map(cell => {
                const cellStr = String(cell);
                return cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')
                    ? `"${cellStr.replace(/"/g, '""')}"` 
                    : cellStr;
            }).join(',')
        ).join('\n');
    }

    /**
     * Escape CSV special characters
     */
    escapeCSV(str) {
        if (!str) return '';
        return String(str).replace(/"/g, '""');
    }

    /**
     * Download CSV file
     */
    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showMessage(`✓ ${filename} exported successfully!`, 'success');
    }

    /**
     * Get formatted date
     */
    getFormattedDate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Format standard name for display
     */
    formatStandardName(standardKey) {
        return standardKey
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
}

// Create global CSV exporter instance
const csvExporter = new CSVExporter();

/**
 * Automated CSV Export Functions
 */

// Auto-export audits on submission
function autoExportAuditOnSubmit(audit) {
    try {
        // Generate individual audit CSV
        const headers = [
            'Audit ID',
            'Timestamp',
            'Audit Type',
            'Auditor Name',
            'Auditor Role',
            'Date',
            'Time',
            'Location',
            'Department',
            'Items Audited',
            'Defects Found',
            'Defect Rate (%)',
            'Duration (minutes)',
            'Overall Rating',
            'Status',
            'Observations'
        ];

        const row = [
            audit.id,
            audit.timestamp,
            audit.auditTypeName,
            audit.auditorName,
            audit.auditorRole,
            audit.auditDate,
            audit.auditTime,
            audit.location,
            audit.department,
            audit.itemsAudited,
            audit.defectsFound,
            audit.defectRate.toFixed(2),
            audit.durationMinutes,
            audit.overallRating,
            audit.status,
            csvExporter.escapeCSV(audit.observations)
        ];

        const csvContent = csvExporter.formatCSV(headers, [row]);
        
        // Save to local storage for auto-sync
        saveAutoExportLog(audit.id, csvContent);
        
        console.log('Audit auto-exported:', audit.id);
    } catch (error) {
        console.error('Auto-export error:', error);
    }
}

/**
 * Save auto-export log
 */
function saveAutoExportLog(auditId, csvContent) {
    const log = JSON.parse(localStorage.getItem('apollo_csv_export_log') || '{}');
    log[auditId] = {
        timestamp: new Date().toISOString(),
        content: csvContent
    };
    localStorage.setItem('apollo_csv_export_log', JSON.stringify(log));
}

/**
 * Generate bulk CSV exports
 */
function generateBulkCSVExports() {
    const timestamp = new Date().toISOString().split('T')[0];
    
    // Create zip-like structure in localStorage
    const bulkExports = {
        timestamp: new Date().toISOString(),
        exports: {
            audits: csvExporter.generateAuditCSV(allAudits),
            standards: csvExporter.generateStandardsCSV(allAudits),
            compliance: csvExporter.generateComplianceReportCSV(allAudits),
            auditorPerformance: csvExporter.generateAuditorPerformanceCSV(allAudits),
            locationData: csvExporter.generateLocationDataCSV(allAudits)
        }
    };
    
    localStorage.setItem('apollo_bulk_exports', JSON.stringify(bulkExports));
    console.log('Bulk exports generated:', timestamp);
    
    return bulkExports;
}

/**
 * Schedule automatic daily exports
 */
function scheduleAutomaticDailyExports() {
    const lastExportDate = localStorage.getItem('apollo_last_export_date');
    const today = new Date().toISOString().split('T')[0];
    
    if (lastExportDate !== today) {
        console.log('Running scheduled daily export...');
        generateBulkCSVExports();
        localStorage.setItem('apollo_last_export_date', today);
        
        // Optional: auto-download main audit CSV
        if (allAudits.length > 0) {
            csvExporter.exportAuditsToCSV(allAudits);
        }
    }
}

/**
 * Export filtered audit results to CSV
 */
function exportFilteredResultsToCSV() {
    const searchTerm = document.getElementById('searchAudits').value.toLowerCase();
    const typeFilter = document.getElementById('filterByType').value;
    const statusFilter = document.getElementById('filterByStatus').value;
    
    let filtered = allAudits.filter(audit => {
        const matchesSearch = 
            audit.auditorName.toLowerCase().includes(searchTerm) ||
            audit.location.toLowerCase().includes(searchTerm) ||
            audit.auditTypeName.toLowerCase().includes(searchTerm);
        
        const matchesType = !typeFilter || audit.auditType === typeFilter;
        const matchesStatus = !statusFilter || audit.status === statusFilter;
        
        return matchesSearch && matchesType && matchesStatus;
    });
    
    if (filtered.length === 0) {
        showMessage('No audits match your filters to export.', 'info');
        return;
    }
    
    csvExporter.exportAuditsToCSV(filtered);
}

/**
 * Schedule export at specific time
 */
function scheduleExportAtTime(hour, minute) {
    function checkAndExport() {
        const now = new Date();
        if (now.getHours() === hour && now.getMinutes() === minute) {
            console.log(`Scheduled export triggered at ${hour}:${minute}`);
            generateBulkCSVExports();
            if (allAudits.length > 0) {
                csvExporter.exportAuditsToCSV(allAudits);
            }
        }
    }
    
    setInterval(checkAndExport, 60000); // Check every minute
    console.log(`Export scheduled for ${hour}:${String(minute).padStart(2, '0')}`);
}

/**
 * Modify submitAudit to include auto-export
 */
const originalSubmitAudit = submitAudit;
submitAudit = function(e) {
    e.preventDefault();
    
    const formData = new FormData(document.getElementById('configForm'));
    
    // Validate form
    const requiredFields = ['auditorName', 'auditorRole', 'auditDate', 'auditTime', 'location', 'department', 'observations', 'itemsAudited', 'durationMinutes', 'overallRating'];
    
    for (let field of requiredFields) {
        if (!formData.get(field)) {
            showMessage('Please fill in all required fields.', 'error');
            return;
        }
    }
    
    // Check standards compliance
    const standardsCheckboxes = document.querySelectorAll('#standardsChecklistContainer input[type="checkbox"]');
    const checkedStandards = Array.from(standardsCheckboxes).filter(cb => cb.checked);
    
    if (checkedStandards.length === 0) {
        showMessage('Please check at least one standard.', 'error');
        return;
    }
    
    // Build audit object
    const audit = {
        id: 'AUD-' + Date.now(),
        timestamp: new Date().toISOString(),
        auditType: selectedAuditType.code,
        auditTypeName: selectedAuditType.name,
        auditorName: formData.get('auditorName'),
        auditorRole: formData.get('auditorRole'),
        auditDate: formData.get('auditDate'),
        auditTime: formData.get('auditTime'),
        location: formData.get('location'),
        department: formData.get('department'),
        observations: formData.get('observations'),
        findings: formData.get('findings'),
        recommendations: formData.get('recommendations'),
        itemsAudited: parseInt(formData.get('itemsAudited')),
        defectsFound: parseInt(formData.get('defectsFound') || 0),
        durationMinutes: parseInt(formData.get('durationMinutes')),
        overallRating: parseInt(formData.get('overallRating')),
        standards: selectedAuditType.standards.reduce((acc, std) => {
            acc[std.key] = document.getElementById(std.key).checked;
            return acc;
        }, {}),
        status: calculateStatus(checkedStandards.length, selectedAuditType.standards.length),
        defectRate: (parseInt(formData.get('defectsFound') || 0) / parseInt(formData.get('itemsAudited'))) * 100
    };
    
    // Save audit
    allAudits.push(audit);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allAudits));
    
    // AUTO-EXPORT: Generate CSV on submission
    autoExportAuditOnSubmit(audit);
    
    console.log('Audit submitted:', audit);
    
    showMessage(`✓ Audit #${audit.id.split('-')[1].slice(-6)} submitted successfully!`, 'success');
    
    document.getElementById('configForm').reset();
    cancelAuditCreation();
    
    setTimeout(() => {
        updateDashboard();
        displayAuditHistory();
    }, 500);
};

// Initialize automated exports
document.addEventListener('DOMContentLoaded', function() {
    // Schedule daily automatic exports
    scheduleAutomaticDailyExports();
    
    // Optional: Schedule exports at specific time (e.g., 6 PM)
    // scheduleExportAtTime(18, 0);
});
