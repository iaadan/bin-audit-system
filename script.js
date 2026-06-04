// Initialize dashboard metrics
function initializeDashboard() {
    // Simulate real-time data updates
    updateMetrics();
    setInterval(updateMetrics, 5000); // Update every 5 seconds
}

function updateMetrics() {
    // Simulate metric changes
    const baselineAudit = 0;
    const currentBins = Math.floor(Math.random() * 200);
    const avgTime = 1.54 + (Math.random() - 0.5) * 0.5; // ±0.25 minutes
    const errorReduction = Math.floor(Math.random() * 20); // 0-20%

    document.getElementById('binsProcessed').textContent = currentBins;
    document.getElementById('avgTimePerBin').textContent = avgTime.toFixed(2);
    document.getElementById('errorReduction').textContent = errorReduction + '%';
}

// Handle Audit Form Submission
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupAuditForm();
    setupSmoothScrolling();
});

function setupAuditForm() {
    const auditForm = document.getElementById('auditForm');
    const auditMessage = document.getElementById('auditMessage');

    if (auditForm) {
        auditForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Collect form data
            const formData = {
                associateName: document.getElementById('associateName').value,
                date: document.getElementById('date').value,
                zone: document.getElementById('zone').value,
                binNumber: document.getElementById('binNumber').value,
                standards: {
                    rightSizeBin: document.querySelector('input[name="rightSizeBin"]').checked,
                    noOverhang: document.querySelector('input[name="noOverhang"]').checked,
                    noBlocking: document.querySelector('input[name="noBlocking"]').checked,
                    notOverstuffed: document.querySelector('input[name="notOverstuffed"]').checked,
                    titlesOut: document.querySelector('input[name="titlesOut"]').checked,
                    sameASIN: document.querySelector('input[name="sameASIN"]').checked
                },
                notes: document.getElementById('notes').value,
                timeSpent: document.getElementById('timeSpent').value
            };

            // Validate form
            if (!validateAuditForm(formData)) {
                showMessage('Please check all R.O.B.O.T.S. standards before submitting.', 'error');
                return;
            }

            // Save to localStorage
            saveAuditData(formData);

            // Show success message
            showMessage('✓ Audit submitted successfully! Thank you for your diligence.', 'success');

            // Reset form
            auditForm.reset();

            // Clear message after 5 seconds
            setTimeout(() => {
                auditMessage.style.display = 'none';
            }, 5000);
        });
    }
}

function validateAuditForm(data) {
    // Check that all standards are checked
    const standards = data.standards;
    return (
        standards.rightSizeBin &&
        standards.noOverhang &&
        standards.noBlocking &&
        standards.notOverstuffed &&
        standards.titlesOut &&
        standards.sameASIN
    );
}

function saveAuditData(data) {
    // Get existing audits from localStorage
    let audits = JSON.parse(localStorage.getItem('audits') || '[]');

    // Add timestamp
    data.timestamp = new Date().toISOString();

    // Add to audits array
    audits.push(data);

    // Save back to localStorage
    localStorage.setItem('audits', JSON.stringify(audits));

    console.log('Audit saved:', data);
    console.log('Total audits:', audits.length);
}

function showMessage(message, type) {
    const auditMessage = document.getElementById('auditMessage');
    auditMessage.textContent = message;
    auditMessage.className = 'audit-message ' + type;
    auditMessage.style.display = 'block';
}

// Smooth scrolling for navigation links
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Analytics tracking function
function trackEvent(eventName, eventData) {
    console.log('Event tracked:', eventName, eventData);
}

// Export audit data
function exportAuditData() {
    const audits = JSON.parse(localStorage.getItem('audits') || '[]');
    const dataStr = JSON.stringify(audits, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bin-audits-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// Get audit statistics
function getAuditStats() {
    const audits = JSON.parse(localStorage.getItem('audits') || '[]');
    
    if (audits.length === 0) {
        return null;
    }

    const stats = {
        totalAudits: audits.length,
        averageTimePerBin: 0,
        complianceRate: 0,
        auditsByZone: {}
    };

    let totalTime = 0;
    let compliantAudits = 0;

    audits.forEach(audit => {
        if (audit.timeSpent) {
            totalTime += parseFloat(audit.timeSpent);
        }

        const standards = audit.standards;
        if (
            standards.rightSizeBin &&
            standards.noOverhang &&
            standards.noBlocking &&
            standards.notOverstuffed &&
            standards.titlesOut &&
            standards.sameASIN
        ) {
            compliantAudits++;
        }

        if (audit.zone) {
            stats.auditsByZone[audit.zone] = (stats.auditsByZone[audit.zone] || 0) + 1;
        }
    });

    stats.averageTimePerBin = (totalTime / audits.length).toFixed(2);
    stats.complianceRate = ((compliantAudits / audits.length) * 100).toFixed(1);

    return stats;
}

// Display audit statistics
function displayAuditStats() {
    const stats = getAuditStats();
    if (stats) {
        console.log('Audit Statistics:', stats);
        return stats;
    }
}

// Clear all audit data
function clearAllAuditData() {
    if (confirm('Are you sure you want to clear all audit data? This action cannot be undone.')) {
        localStorage.removeItem('audits');
        console.log('All audit data cleared');
        return true;
    }
    return false;
}