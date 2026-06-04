// Apollo Audit System - Main JavaScript

// Global Variables
let auditTypes = [];
let selectedAuditType = null;
let allAudits = [];
const STORAGE_KEY = 'apollo_audits';
const AUDIT_TYPES_KEY = 'apollo_audit_types';

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Apollo Audit System Initializing...');
    
    // Load audit types
    loadAuditTypes();
    
    // Load existing audits
    loadAllAudits();
    
    // Set today's date as default
    document.getElementById('auditDate').valueAsDate = new Date();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize dashboard
    updateDashboard();
    
    // Display audit types
    displayAuditTypes();
    
    // Display audit history
    displayAuditHistory();
    
    // Set current user
    setCurrentUser();
});

// Load audit types from JSON or use default
function loadAuditTypes() {
    const defaultAuditTypes = [
        {
            id: 22104,
            name: "Bin Straightening Initiative",
            code: "BSI",
            category: "Quality",
            description: "Daily bin organization and R.O.B.O.T.S. standards validation",
            frequency: "Daily",
            estimatedDuration: "2-5 minutes",
            standards: [
                { name: "Right Size Bin", key: "rightSizeBin", description: "Items fit appropriately in bin size" },
                { name: "Overhang", key: "noOverhang", description: "No items hang over bin edge" },
                { name: "Blocking", key: "noBlocking", description: "Labels not blocked" },
                { name: "Overstuffed", key: "notOverstuffed", description: "Bin not packed beyond capacity" },
                { name: "Titles Out", key: "titlesOut", description: "Product labels face outward" },
                { name: "Same ASIN", key: "sameASIN", description: "Only identical items in bin" }
            ],
            assignedRoles: ["TLD Associates", "Area Managers"]
        },
        {
            id: 22105,
            name: "Safety Inspection",
            code: "SI",
            category: "Safety",
            description: "Safety hazard identification and compliance check",
            frequency: "Daily",
            estimatedDuration: "15-20 minutes",
            standards: [
                { name: "Fall Hazards", key: "fallHazards", description: "Check for potential fall hazards" },
                { name: "PPE Compliance", key: "ppeCompliance", description: "Verify proper PPE usage" },
                { name: "Ergonomics", key: "ergonomics", description: "Check ergonomic practices" },
                { name: "Emergency Procedures", key: "emergencyProc", description: "Verify emergency protocols in place" }
            ],
            assignedRoles: ["Safety Team", "Area Managers"]
        },
        {
            id: 22106,
            name: "Pick Accuracy Audit",
            code: "PAA",
            category: "Quality",
            description: "Verify pick accuracy and ASIN matching",
            frequency: "Shift",
            estimatedDuration: "30-45 minutes",
            standards: [
                { name: "Correct ASIN", key: "correctASIN", description: "Items match requested ASIN" },
                { name: "Correct Quantity", key: "correctQty", description: "Quantity matches order" },
                { name: "Label Verification", key: "labelVerif", description: "All items properly labeled" }
            ],
            assignedRoles: ["Quality Auditors", "Area Managers"]
        },
        {
            id: 22107,
            name: "Associate Compliance Review",
            code: "ACR",
            category: "Compliance",
            description: "Review associate adherence to policies",
            frequency: "Weekly",
            estimatedDuration: "30 minutes",
            standards: [
                { name: "Time Adherence", key: "timeAdherence", description: "On-time arrival and breaks" },
                { name: "Equipment Use", key: "equipmentUse", description: "Proper equipment usage" },
                { name: "Safety Protocol", key: "safetyProto", description: "Follows safety procedures" },
                { name: "Quality Standards", key: "qualityStd", description: "Maintains quality standards" }
            ],
            assignedRoles: ["Area Managers", "Senior Managers"]
        },
        {
            id: 22108,
            name: "Equipment Maintenance Check",
            code: "EMC",
            category: "Maintenance",
            description: "Equipment condition and maintenance verification",
            frequency: "Weekly",
            estimatedDuration: "45 minutes",
            standards: [
                { name: "Functionality", key: "functionality", description: "All equipment functioning properly" },
                { name: "Cleanliness", key: "cleanliness", description: "Equipment is clean and well-maintained" },
                { name: "Repairs Needed", key: "repairsNeeded", description: "Identify needed repairs" },
                { name: "Safety", key: "equipment_safety", description: "Equipment is safe to use" }
            ],
            assignedRoles: ["Maintenance Team", "Area Managers"]
        }
    ];
    
    auditTypes = defaultAuditTypes;
    console.log('Audit types loaded:', auditTypes.length);
}

// Setup Event Listeners
function setupEventListeners() {
    // Form submission
    const configForm = document.getElementById('configForm');
    if (configForm) {
        configForm.addEventListener('submit', submitAudit);
    }
    
    // Search and filter
    document.getElementById('searchAudits').addEventListener('input', filterAudits);
    document.getElementById('filterByType').addEventListener('change', filterAudits);
    document.getElementById('filterByStatus').addEventListener('change', filterAudits);
}

// Display Audit Types
function displayAuditTypes() {
    const container = document.getElementById('auditTypesContainer');
    container.innerHTML = '';
    
    auditTypes.forEach(type => {
        const card = document.createElement('div');
        card.className = 'audit-type-card';
        card.onclick = () => selectAuditType(type);
        
        card.innerHTML = `
            <div>
                <span class="audit-type-code">${type.code}</span>
                <span class="audit-type-category">${type.category}</span>
            </div>
            <h3>${type.name}</h3>
            <p>${type.description}</p>
            <div class="audit-details">
                <div class="audit-detail-item">
                    <span class="audit-detail-label">Frequency:</span>
                    <span class="audit-detail-value">${type.frequency}</span>
                </div>
                <div class="audit-detail-item">
                    <span class="audit-detail-label">Est. Duration:</span>
                    <span class="audit-detail-value">${type.estimatedDuration}</span>
                </div>
                <div class="audit-detail-item">
                    <span class="audit-detail-label">Standards:</span>
                    <span class="audit-detail-value">${type.standards.length}</span>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Select Audit Type
function selectAuditType(type) {
    selectedAuditType = type;
    console.log('Selected audit type:', type.name);
    
    // Show form
    document.getElementById('auditTypesContainer').parentElement.style.display = 'none';
    document.getElementById('auditConfigForm').style.display = 'block';
    
    // Update form title
    document.getElementById('formAuditTitle').textContent = `Configure: ${type.name}`;
    
    // Populate standards checklist
    populateStandardsChecklist(type);
    
    // Update audit type filter dropdown
    updateAuditTypeFilter();
    
    // Smooth scroll to form
    setTimeout(() => {
        document.getElementById('configForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// Populate Standards Checklist
function populateStandardsChecklist(type) {
    const container = document.getElementById('standardsChecklistContainer');
    container.innerHTML = '';
    
    type.standards.forEach(standard => {
        const checkboxGroup = document.createElement('div');
        checkboxGroup.className = 'checkbox-group';
        checkboxGroup.innerHTML = `
            <input type="checkbox" id="${standard.key}" name="${standard.key}" value="yes">
            <label for="${standard.key}">
                <strong>${standard.name}:</strong> ${standard.description}
            </label>
        `;
        container.appendChild(checkboxGroup);
    });
}

// Update Audit Type Filter
function updateAuditTypeFilter() {
    const filterSelect = document.getElementById('filterByType');
    const currentValue = filterSelect.value;
    filterSelect.innerHTML = '<option value="">All Audit Types</option>';
    
    auditTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.code;
        option.textContent = type.name;
        filterSelect.appendChild(option);
    });
    
    filterSelect.value = currentValue;
}

// Submit Audit
function submitAudit(e) {
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
    
    console.log('Audit submitted:', audit);
    
    // Show success message
    showMessage(`✓ Audit #${audit.id.split('-')[1].slice(-6)} submitted successfully!`, 'success');
    
    // Reset form
    document.getElementById('configForm').reset();
    
    // Reset UI
    cancelAuditCreation();
    
    // Update dashboard
    setTimeout(() => {
        updateDashboard();
        displayAuditHistory();
    }, 500);
}

// Calculate Audit Status
function calculateStatus(checkedCount, totalCount) {
    const compliancePercent = (checkedCount / totalCount) * 100;
    return compliancePercent >= 80 ? 'Compliant' : 'Non-Compliant';
}

// Load All Audits
function loadAllAudits() {
    const stored = localStorage.getItem(STORAGE_KEY);
    allAudits = stored ? JSON.parse(stored) : [];
    console.log('Loaded audits:', allAudits.length);
}

// Display Audit History
function displayAuditHistory() {
    const tbody = document.getElementById('auditTableBody');
    tbody.innerHTML = '';
    
    if (allAudits.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="9">No audits found. Create your first audit to get started.</td></tr>';
        return;
    }
    
    // Sort by date descending
    const sortedAudits = [...allAudits].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    sortedAudits.forEach(audit => {
        const date = new Date(audit.auditDate);
        const formattedDate = date.toLocaleDateString();
        
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td><strong>${audit.auditTypeName}</strong></td>
            <td>${audit.auditorName}</td>
            <td>${audit.location}</td>
            <td>${audit.itemsAudited}</td>
            <td>${audit.defectsFound}</td>
            <td>${renderStars(audit.overallRating)}</td>
            <td><span class="status-badge status-${audit.status.toLowerCase().replace('-', '')}">${audit.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-small" onclick="viewAuditDetails('${audit.id}')">View</button>
                    <button class="btn btn-small" onclick="deleteAudit('${audit.id}')">Delete</button>
                </div>
            </td>
        `;
    });
}

// Display Recent Audits
function displayRecentAudits() {
    const container = document.getElementById('recentAuditsList');
    
    if (allAudits.length === 0) {
        container.innerHTML = '<p class="empty-state">No audits yet. Create your first audit to get started.</p>';
        return;
    }
    
    const recentAudits = [...allAudits].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);
    
    container.innerHTML = recentAudits.map(audit => {
        const date = new Date(audit.timestamp);
        const timeString = date.toLocaleString();
        
        return `
            <div class="audit-item">
                <div class="audit-item-header">
                    <span class="audit-item-type">${audit.auditTypeName}</span>
                    <span class="audit-item-time">${timeString}</span>
                </div>
                <div class="audit-item-details">
                    <strong>${audit.auditorName}</strong> | Location: ${audit.location} | Status: <span class="status-badge status-${audit.status.toLowerCase().replace('-', '')}">${audit.status}</span>
                </div>
            </div>
        `;
    }).join('');
}

// View Audit Details
function viewAuditDetails(auditId) {
    const audit = allAudits.find(a => a.id === auditId);
    if (!audit) return;
    
    const modal = document.getElementById('auditDetailsModal');
    const content = document.getElementById('auditDetailsContent');
    
    content.innerHTML = `
        <h2>Audit Details - ${audit.auditTypeName}</h2>
        
        <div class="audit-detail-section">
            <h3>Audit Information</h3>
            <table class="detail-table">
                <tr>
                    <td><strong>Audit ID:</strong></td>
                    <td>${audit.id}</td>
                </tr>
                <tr>
                    <td><strong>Auditor:</strong></td>
                    <td>${audit.auditorName} (${audit.auditorRole})</td>
                </tr>
                <tr>
                    <td><strong>Date:</strong></td>
                    <td>${audit.auditDate} at ${audit.auditTime}</td>
                </tr>
                <tr>
                    <td><strong>Location:</strong></td>
                    <td>${audit.location}</td>
                </tr>
                <tr>
                    <td><strong>Department:</strong></td>
                    <td>${audit.department}</td>
                </tr>
                <tr>
                    <td><strong>Status:</strong></td>
                    <td><span class="status-badge status-${audit.status.toLowerCase().replace('-', '')}">${audit.status}</span></td>
                </tr>
            </table>
        </div>
        
        <div class="audit-detail-section">
            <h3>Audit Metrics</h3>
            <table class="detail-table">
                <tr>
                    <td><strong>Items Audited:</strong></td>
                    <td>${audit.itemsAudited}</td>
                </tr>
                <tr>
                    <td><strong>Defects Found:</strong></td>
                    <td>${audit.defectsFound} (${audit.defectRate.toFixed(2)}%)</td>
                </tr>
                <tr>
                    <td><strong>Duration:</strong></td>
                    <td>${audit.durationMinutes} minutes</td>
                </tr>
                <tr>
                    <td><strong>Rating:</strong></td>
                    <td>${renderStars(audit.overallRating)}</td>
                </tr>
            </table>
        </div>
        
        <div class="audit-detail-section">
            <h3>Standards Compliance</h3>
            <div class="standards-detail">
                ${Object.entries(audit.standards).map(([key, value]) => `
                    <div class="standard-check ${value ? 'compliant' : 'non-compliant'}">
                        ${value ? '✓' : '✗'} ${key}
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="audit-detail-section">
            <h3>Observations & Findings</h3>
            <p><strong>Observations:</strong></p>
            <p>${audit.observations}</p>
            ${audit.findings ? `<p><strong>Findings:</strong></p><p>${audit.findings}</p>` : ''}
            ${audit.recommendations ? `<p><strong>Recommendations:</strong></p><p>${audit.recommendations}</p>` : ''}
        </div>
        
        <div class="form-actions">
            <button class="btn btn-outline" onclick="downloadAuditReport('${audit.id}')">Download Report</button>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Close Audit Details
function closeAuditDetails() {
    document.getElementById('auditDetailsModal').style.display = 'none';
}

// Delete Audit
function deleteAudit(auditId) {
    if (confirm('Are you sure you want to delete this audit? This action cannot be undone.')) {
        allAudits = allAudits.filter(a => a.id !== auditId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allAudits));
        updateDashboard();
        displayAuditHistory();
        showMessage('Audit deleted successfully.', 'info');
    }
}

// Filter Audits
function filterAudits() {
    const searchTerm = document.getElementById('searchAudits').value.toLowerCase();
    const typeFilter = document.getElementById('filterByType').value;
    const statusFilter = document.getElementById('filterByStatus').value;
    
    const tbody = document.getElementById('auditTableBody');
    tbody.innerHTML = '';
    
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
        tbody.innerHTML = '<tr class="empty-row"><td colspan="9">No audits match your filters.</td></tr>';
        return;
    }
    
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    filtered.forEach(audit => {
        const date = new Date(audit.auditDate);
        const formattedDate = date.toLocaleDateString();
        
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td><strong>${audit.auditTypeName}</strong></td>
            <td>${audit.auditorName}</td>
            <td>${audit.location}</td>
            <td>${audit.itemsAudited}</td>
            <td>${audit.defectsFound}</td>
            <td>${renderStars(audit.overallRating)}</td>
            <td><span class="status-badge status-${audit.status.toLowerCase().replace('-', '')}">${audit.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-small" onclick="viewAuditDetails('${audit.id}')">View</button>
                    <button class="btn btn-small" onclick="deleteAudit('${audit.id}')">Delete</button>
                </div>
            </td>
        `;
    });
}

// Update Dashboard
function updateDashboard() {
    const total = allAudits.length;
    const compliant = allAudits.filter(a => a.status === 'Compliant').length;
    const nonCompliant = allAudits.filter(a => a.status === 'Non-Compliant').length;
    
    const avgTime = total > 0 
        ? (allAudits.reduce((sum, a) => sum + a.durationMinutes, 0) / total).toFixed(1) 
        : '--';
    
    const complianceRate = total > 0 ? ((compliant / total) * 100).toFixed(1) : '0';
    
    const uniqueAuditors = new Set(allAudits.map(a => a.auditorName)).size;
    
    document.getElementById('totalAudits').textContent = total;
    document.getElementById('compliantAudits').textContent = compliant;
    document.getElementById('nonCompliantAudits').textContent = nonCompliant;
    document.getElementById('avgCompletionTime').textContent = avgTime;
    document.getElementById('complianceRate').textContent = complianceRate + '%';
    document.getElementById('activeAuditors').textContent = uniqueAuditors;
    
    displayRecentAudits();
}

// Cancel Audit Creation
function cancelAuditCreation() {
    document.getElementById('auditTypesContainer').parentElement.style.display = 'block';
    document.getElementById('auditConfigForm').style.display = 'none';
    document.getElementById('configForm').reset();
    selectedAuditType = null;
    document.getElementById('auditMessage').style.display = 'none';
}

// Show Message
function showMessage(message, type) {
    const messageBox = document.getElementById('auditMessage');
    messageBox.textContent = message;
    messageBox.className = `message-box ${type}`;
    messageBox.style.display = 'block';
    
    setTimeout(() => {
        messageBox.style.display = 'none';
    }, 5000);
}

// Render Stars
function renderStars(rating) {
    return '⭐'.repeat(rating);
}

// Export Audit History
function exportAuditHistory() {
    if (allAudits.length === 0) {
        showMessage('No audits to export.', 'info');
        return;
    }
    
    const dataStr = JSON.stringify(allAudits, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `apollo-audits-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// Download Audit Report
function downloadAuditReport(auditId) {
    const audit = allAudits.find(a => a.id === auditId);
    if (!audit) return;
    
    let reportContent = `APOLLO AUDIT SYSTEM - AUDIT REPORT\n`;
    reportContent += `${'='.repeat(50)}\n\n`;
    reportContent += `Audit ID: ${audit.id}\n`;
    reportContent += `Audit Type: ${audit.auditTypeName}\n`;
    reportContent += `Date: ${audit.auditDate} at ${audit.auditTime}\n`;
    reportContent += `Auditor: ${audit.auditorName} (${audit.auditorRole})\n`;
    reportContent += `Location: ${audit.location}\n`;
    reportContent += `Department: ${audit.department}\n`;
    reportContent += `Status: ${audit.status}\n\n`;
    
    reportContent += `METRICS\n${'-'.repeat(50)}\n`;
    reportContent += `Items Audited: ${audit.itemsAudited}\n`;
    reportContent += `Defects Found: ${audit.defectsFound} (${audit.defectRate.toFixed(2)}%)\n`;
    reportContent += `Duration: ${audit.durationMinutes} minutes\n`;
    reportContent += `Rating: ${renderStars(audit.overallRating)}\n\n`;
    
    reportContent += `OBSERVATIONS\n${'-'.repeat(50)}\n`;
    reportContent += `${audit.observations}\n\n`;
    
    if (audit.findings) {
        reportContent += `FINDINGS\n${'-'.repeat(50)}\n`;
        reportContent += `${audit.findings}\n\n`;
    }
    
    if (audit.recommendations) {
        reportContent += `RECOMMENDATIONS\n${'-'.repeat(50)}\n`;
        reportContent += `${audit.recommendations}\n\n`;
    }
    
    const dataBlob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-report-${audit.id}.txt`;
    link.click();
}

// Set Current User
function setCurrentUser() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        document.getElementById('currentUser').textContent = savedUser;
    } else {
        const defaultUser = 'Auditor ' + Math.floor(Math.random() * 1000);
        localStorage.setItem('currentUser', defaultUser);
        document.getElementById('currentUser').textContent = defaultUser;
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('auditDetailsModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}
