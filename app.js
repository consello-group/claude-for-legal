// Consello Legal Document Analysis Dashboard
// Enhanced Interactive Version

// =============================================================================
// STATE
// =============================================================================
let currentDocument = null;
let currentAnalysisType = 'nda-triage';
let currentResults = null;

// =============================================================================
// DEMO DATA - Sample analysis results for instant demos
// =============================================================================
const DEMO_DATA = {
    green: {
        classification: 'green',
        level: 'GREEN',
        summary: 'Standard Approval',
        document: 'Standard-NDA.txt',
        parties: 'Consello LLC ↔ Acme Corporation',
        type: 'Mutual NDA',
        term: '2 years with 3-year survival',
        governingLaw: 'New York',
        screening: [
            { criterion: 'Mutual Obligations', status: 'pass', note: 'Both parties bound equally' },
            { criterion: 'Term Length', status: 'pass', note: '2 years - within standard range' },
            { criterion: 'Survival Period', status: 'pass', note: '3 years - appropriate' },
            { criterion: 'Public Info Carveout', status: 'pass', note: 'Present and complete' },
            { criterion: 'Prior Possession', status: 'pass', note: 'Properly addressed' },
            { criterion: 'Independent Development', status: 'pass', note: 'Carveout included' },
            { criterion: 'Legal Compulsion', status: 'pass', note: 'Notice requirement included' },
            { criterion: 'Third-Party Receipt', status: 'pass', note: 'Standard carveout present' },
            { criterion: 'Non-Compete Clause', status: 'pass', note: 'None present' },
            { criterion: 'Non-Solicitation', status: 'pass', note: 'None present' },
            { criterion: 'Governing Law', status: 'pass', note: 'New York - preferred jurisdiction' },
            { criterion: 'Remedies', status: 'pass', note: 'Standard injunctive relief' }
        ],
        issues: [],
        recommendation: 'This NDA meets all playbook standards and can be approved via delegation of authority. No escalation required.',
        nextSteps: [
            'Approve NDA via standard delegation',
            'Execute via DocuSign with standard signature blocks',
            'File in contract management system',
            'Set calendar reminder for 2-year expiration'
        ]
    },
    yellow: {
        classification: 'yellow',
        level: 'YELLOW',
        summary: 'Counsel Review Needed',
        document: 'Vendor-NDA-Draft.docx',
        parties: 'Consello LLC ↔ TechVendor Inc.',
        type: 'Mutual NDA',
        term: '3 years with 5-year survival',
        governingLaw: 'California',
        screening: [
            { criterion: 'Mutual Obligations', status: 'pass', note: 'Both parties bound equally' },
            { criterion: 'Term Length', status: 'flag', note: '3 years - at upper limit' },
            { criterion: 'Survival Period', status: 'flag', note: '5 years - above standard' },
            { criterion: 'Public Info Carveout', status: 'pass', note: 'Present and complete' },
            { criterion: 'Prior Possession', status: 'pass', note: 'Properly addressed' },
            { criterion: 'Independent Development', status: 'pass', note: 'Carveout included' },
            { criterion: 'Legal Compulsion', status: 'pass', note: 'Notice requirement included' },
            { criterion: 'Third-Party Receipt', status: 'pass', note: 'Standard carveout present' },
            { criterion: 'Non-Compete Clause', status: 'pass', note: 'None present' },
            { criterion: 'Non-Solicitation', status: 'pass', note: 'None present' },
            { criterion: 'Governing Law', status: 'flag', note: 'California - acceptable but not preferred' },
            { criterion: 'Remedies', status: 'pass', note: 'Standard injunctive relief' }
        ],
        issues: [
            {
                severity: 'yellow',
                title: 'Extended Survival Period',
                description: '5-year survival period exceeds our standard 3-year position.',
                risk: 'Longer ongoing obligations post-termination.',
                recommendation: 'Request reduction to 3 years. If pushed back, 4 years is acceptable for strategic vendors.'
            },
            {
                severity: 'yellow',
                title: 'California Governing Law',
                description: 'California governing law rather than preferred New York.',
                risk: 'Potentially broader interpretation of confidentiality obligations.',
                recommendation: 'Accept if vendor insists - California is within acceptable jurisdictions per playbook.'
            }
        ],
        recommendation: 'This NDA has minor deviations that should be reviewed by designated counsel before execution. Issues are negotiable and within acceptable ranges.',
        nextSteps: [
            'Route to designated reviewer for approval',
            'Consider negotiating survival period to 3-4 years',
            'Document business justification if accepting California law',
            'Expected turnaround: 1-2 business days'
        ]
    },
    red: {
        classification: 'red',
        level: 'RED',
        summary: 'Escalation Required - Significant Issues',
        document: 'problematic-nda.txt',
        parties: 'Consello LLC (Receiving Party) ← Aggressive Corp (Disclosing Party)',
        type: 'Unilateral NDA (receiving party only)',
        term: 'Perpetual (no expiration)',
        governingLaw: 'Texas (Houston arbitration)',
        screening: [
            { criterion: 'Mutual Obligations', status: 'fail', note: 'Unilateral - we are bound, they are not' },
            { criterion: 'Term Length', status: 'fail', note: 'Perpetual - no defined end date' },
            { criterion: 'Survival Period', status: 'fail', note: 'Perpetual confidentiality obligations' },
            { criterion: 'Public Info Carveout', status: 'pass', note: 'Present' },
            { criterion: 'Prior Possession', status: 'pass', note: 'Present' },
            { criterion: 'Independent Development', status: 'fail', note: 'MISSING - critical carveout absent' },
            { criterion: 'Legal Compulsion', status: 'pass', note: 'Present with notice requirement' },
            { criterion: 'Third-Party Receipt', status: 'pass', note: 'Present' },
            { criterion: 'Non-Compete Clause', status: 'fail', note: '2-year non-compete in their sector' },
            { criterion: 'Non-Solicitation', status: 'fail', note: '3-year employee non-solicitation' },
            { criterion: 'Governing Law', status: 'fail', note: 'Texas with mandatory Houston arbitration' },
            { criterion: 'Remedies', status: 'fail', note: '$500,000 liquidated damages clause' }
        ],
        issues: [
            {
                severity: 'red',
                title: 'Unilateral Structure',
                description: 'NDA only binds Consello as receiving party. Counterparty has no confidentiality obligations.',
                risk: 'We cannot share any information requiring protection. Completely one-sided.',
                recommendation: 'Require conversion to mutual NDA or reject. This structure is unacceptable for exploratory discussions.'
            },
            {
                severity: 'red',
                title: 'Missing Independent Development Carveout',
                description: 'No protection for independently developed information or ideas.',
                risk: 'Exposure to claims that our internal work infringes their confidential information.',
                recommendation: 'MUST ADD standard independent development carveout. This is non-negotiable.'
            },
            {
                severity: 'red',
                title: 'Non-Compete Clause (2 years)',
                description: 'Section 8.1 prohibits competing in their sector for 2 years after termination.',
                risk: 'Could prevent legitimate business activities and client relationships.',
                recommendation: 'DELETE ENTIRELY. Non-competes are prohibited in NDAs per playbook.'
            },
            {
                severity: 'red',
                title: 'Non-Solicitation Clause (3 years)',
                description: 'Section 8.2 prohibits hiring their employees for 3 years.',
                risk: 'Restricts talent acquisition; may not be enforceable but creates litigation risk.',
                recommendation: 'DELETE ENTIRELY. Non-solicitation is prohibited in NDAs.'
            },
            {
                severity: 'red',
                title: 'Perpetual Confidentiality',
                description: 'No termination date; obligations continue forever.',
                risk: 'Indefinite administrative burden and legal exposure.',
                recommendation: 'Require defined term (2-3 years) with reasonable survival period (3-5 years).'
            },
            {
                severity: 'red',
                title: 'Liquidated Damages ($500,000)',
                description: 'Section 12 specifies $500,000 per breach regardless of actual damages.',
                risk: 'Disproportionate exposure; may be challenged as penalty but creates significant risk.',
                recommendation: 'DELETE. Standard remedies (injunctive relief + actual damages) are appropriate.'
            },
            {
                severity: 'red',
                title: 'Mandatory Arbitration (Houston)',
                description: 'Disputes must be resolved through binding arbitration in Houston, Texas.',
                risk: 'Inconvenient venue; limited appeal rights; Texas procedural rules.',
                recommendation: 'Require New York courts or, at minimum, neutral arbitration location.'
            },
            {
                severity: 'yellow',
                title: 'Broad Residuals Clause',
                description: 'Section 6 allows them to use any "residual knowledge" retained in memory.',
                risk: 'Vague standard; could justify use of our confidential concepts.',
                recommendation: 'Narrow to exclude technical specifications and business strategies, or delete.'
            }
        ],
        recommendation: 'DO NOT SIGN. This NDA contains multiple provisions that violate playbook standards and create unacceptable risk. Escalate to senior counsel and provide counterparty with our standard mutual NDA template.',
        nextSteps: [
            'ESCALATE to senior counsel immediately',
            'Prepare detailed counterproposal using Consello standard NDA',
            'Document all issues in contract tracker',
            'Schedule call with counterparty to discuss concerns',
            'Consider whether business relationship justifies negotiation effort'
        ]
    }
};

// =============================================================================
// DOM ELEMENTS
// =============================================================================
const elements = {
    // Upload
    uploadZone: document.getElementById('uploadZone'),
    fileInput: document.getElementById('fileInput'),
    documentPreview: document.getElementById('documentPreview'),
    documentName: document.getElementById('documentName'),
    documentMeta: document.getElementById('documentMeta'),
    documentContent: document.getElementById('documentContent'),

    // Analysis
    analysisSelector: document.getElementById('analysisSelector'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    pasteArea: document.getElementById('pasteArea'),

    // Results
    emptyState: document.getElementById('emptyState'),
    resultsDisplay: document.getElementById('resultsDisplay'),
    resultActions: document.getElementById('resultActions'),
    classificationBadge: document.getElementById('classificationBadge'),
    screeningGrid: document.getElementById('screeningGrid'),
    issuesContent: document.getElementById('issuesContent'),
    issueCount: document.getElementById('issueCount'),
    recommendationContent: document.getElementById('recommendationContent'),
    nextStepsContent: document.getElementById('nextStepsContent'),

    // Meta
    metaDocument: document.getElementById('metaDocument'),
    metaParties: document.getElementById('metaParties'),
    metaType: document.getElementById('metaType'),
    metaTerm: document.getElementById('metaTerm'),
    metaLaw: document.getElementById('metaLaw'),

    // Presentation
    presentationOverlay: document.getElementById('presentationOverlay')
};

// =============================================================================
// INITIALIZATION
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
    initializeUploadZone();
    initializeAnalysisSelector();
    initializeSections();
});

// =============================================================================
// UPLOAD FUNCTIONALITY
// =============================================================================
function initializeUploadZone() {
    const zone = elements.uploadZone;
    const input = elements.fileInput;

    if (!zone || !input) return;

    // Drag and drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
        zone.addEventListener(event, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(event => {
        zone.addEventListener(event, () => zone.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(event => {
        zone.addEventListener(event, () => zone.classList.remove('dragover'), false);
    });

    zone.addEventListener('drop', handleDrop, false);
    zone.addEventListener('click', () => input.click());
    input.addEventListener('change', handleFileSelect);
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleDrop(e) {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

async function handleFile(file) {
    const validExtensions = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(ext)) {
        alert('Please upload a PDF, DOCX, or TXT file.');
        return;
    }

    currentDocument = {
        name: file.name,
        size: formatFileSize(file.size),
        file: file
    };

    // Show preview
    elements.uploadZone.classList.add('hidden');
    elements.documentPreview.classList.remove('hidden');
    elements.documentName.textContent = file.name;
    elements.documentMeta.textContent = currentDocument.size;

    // Try to read content for text files
    if (ext === '.txt') {
        try {
            const content = await readFileContent(file);
            elements.documentContent.textContent = content.substring(0, 2000) +
                (content.length > 2000 ? '\n\n[Preview truncated...]' : '');
        } catch (err) {
            elements.documentContent.textContent = '[Unable to preview file content]';
        }
    } else {
        elements.documentContent.textContent = `[${ext.toUpperCase()} file - content preview not available]\n\nUpload complete. Ready for analysis.`;
    }
}

function clearDocument() {
    currentDocument = null;
    elements.fileInput.value = '';
    elements.uploadZone.classList.remove('hidden');
    elements.documentPreview.classList.add('hidden');
    elements.documentContent.textContent = '';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
}

// =============================================================================
// LOAD SAMPLE NDAs
// =============================================================================
async function loadSampleNDA(type) {
    const filename = type === 'standard' ? 'standard-nda.txt' : 'problematic-nda.txt';

    try {
        const response = await fetch(`sample-ndas/${filename}`);
        if (!response.ok) throw new Error('File not found');

        const content = await response.text();

        currentDocument = {
            name: filename,
            size: formatFileSize(content.length),
            content: content
        };

        elements.uploadZone.classList.add('hidden');
        elements.documentPreview.classList.remove('hidden');
        elements.documentName.textContent = filename;
        elements.documentMeta.textContent = currentDocument.size;
        elements.documentContent.textContent = content.substring(0, 2000) +
            (content.length > 2000 ? '\n\n[Preview truncated...]' : '');

    } catch (err) {
        console.error('Error loading sample:', err);
        alert('Could not load sample NDA. Make sure the sample-ndas folder exists.');
    }
}

// =============================================================================
// ANALYSIS TYPE SELECTOR
// =============================================================================
function initializeAnalysisSelector() {
    const options = document.querySelectorAll('.type-option');

    options.forEach(option => {
        option.addEventListener('click', () => {
            options.forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            currentAnalysisType = option.dataset.type;
        });
    });
}

// =============================================================================
// RUN ANALYSIS (placeholder for CLI integration)
// =============================================================================
function runAnalysis() {
    if (!currentDocument) {
        alert('Please upload a document first.');
        return;
    }

    const btn = elements.analyzeBtn;
    const btnText = btn.querySelector('.btn-text');
    const btnLoading = btn.querySelector('.btn-loading');

    // Show loading state
    btnText.classList.add('hidden');
    btnLoading.classList.remove('hidden');
    btn.disabled = true;

    // Simulate analysis delay then show instructions
    setTimeout(() => {
        btnText.classList.remove('hidden');
        btnLoading.classList.add('hidden');
        btn.disabled = false;

        alert(`To analyze this document:\n\n1. Open Claude Code\n2. Run: /${currentAnalysisType === 'nda-triage' ? 'triage-nda' : 'review-contract'}\n3. Paste or upload: ${currentDocument.name}\n4. Copy the results and paste them in the text area below`);
    }, 1000);
}

// =============================================================================
// PARSE MANUAL RESULTS
// =============================================================================
function parseManualResults() {
    const rawText = elements.pasteArea.value;

    if (!rawText.trim()) {
        alert('Please paste analysis results first.');
        return;
    }

    // Try to parse the results
    const results = parseAnalysisText(rawText);
    displayResults(results);
}

function parseAnalysisText(text) {
    // Detect classification
    let classification = 'unknown';
    let level = 'UNKNOWN';
    let summary = 'Analysis Complete';

    if (text.includes('GREEN') || text.includes('🟢')) {
        classification = 'green';
        level = 'GREEN';
        summary = 'Standard Approval';
    } else if (text.includes('YELLOW') || text.includes('🟡')) {
        classification = 'yellow';
        level = 'YELLOW';
        summary = 'Counsel Review Needed';
    } else if (text.includes('RED') || text.includes('🔴')) {
        classification = 'red';
        level = 'RED';
        summary = 'Escalation Required';
    }

    // Extract metadata
    const extractField = (pattern) => {
        const match = text.match(pattern);
        return match ? match[1].trim() : '—';
    };

    const document = currentDocument?.name || extractField(/\*\*Document\*\*:?\s*(.+?)(?:\n|$)/i);
    const parties = extractField(/\*\*Parties\*\*:?\s*(.+?)(?:\n|$)/i);
    const type = extractField(/\*\*Type\*\*:?\s*(.+?)(?:\n|$)/i);
    const term = extractField(/\*\*Term\*\*:?\s*(.+?)(?:\n|$)/i);
    const governingLaw = extractField(/\*\*Governing Law\*\*:?\s*(.+?)(?:\n|$)/i);

    // Parse screening results
    const screening = [];
    const screeningMatches = text.matchAll(/\|\s*([^|]+?)\s*\|\s*(✅|⚠️|❌|PASS|FLAG|FAIL)\s*([^|]*?)\s*\|\s*([^|]*?)\s*\|/g);
    for (const match of screeningMatches) {
        const criterion = match[1].trim();
        const statusText = match[2].trim();
        const note = (match[3] || match[4] || '').trim();

        if (criterion && !criterion.includes('Criterion') && !criterion.includes('---')) {
            let status = 'pass';
            if (statusText.includes('⚠') || statusText.includes('FLAG')) status = 'flag';
            if (statusText.includes('❌') || statusText.includes('FAIL')) status = 'fail';

            screening.push({ criterion, status, note });
        }
    }

    // Parse issues
    const issues = [];
    const issueMatches = text.matchAll(/###?\s*Issue\s*\d+\s*[—-]\s*(YELLOW|RED|🟡|🔴):?\s*(.+?)(?:\n|$)/gi);
    for (const match of issueMatches) {
        const severity = match[1].toLowerCase().includes('red') ? 'red' : 'yellow';
        const title = match[2].trim();
        issues.push({ severity, title, description: '', risk: '', recommendation: '' });
    }

    // Extract recommendation
    const recMatch = text.match(/##\s*Recommendation\s*\n([\s\S]*?)(?=##|$)/i);
    const recommendation = recMatch ? recMatch[1].trim().replace(/\n/g, ' ').substring(0, 500) : '';

    // Extract next steps
    const nextSteps = [];
    const stepsMatch = text.match(/##\s*Next Steps\s*\n([\s\S]*?)(?=##|$)/i);
    if (stepsMatch) {
        const stepLines = stepsMatch[1].match(/^\d+\.\s*(.+)$/gm) || [];
        stepLines.forEach(line => {
            nextSteps.push(line.replace(/^\d+\.\s*/, '').trim());
        });
    }

    return {
        classification,
        level,
        summary,
        document,
        parties,
        type,
        term,
        governingLaw,
        screening: screening.length > 0 ? screening : [{ criterion: 'See full analysis', status: 'pass', note: 'Results parsed from pasted text' }],
        issues,
        recommendation: recommendation || 'See full analysis results above.',
        nextSteps: nextSteps.length > 0 ? nextSteps : ['Review full analysis', 'Take appropriate action based on classification']
    };
}

// =============================================================================
// DEMO ANALYSIS
// =============================================================================
function runDemoAnalysis(type) {
    const data = DEMO_DATA[type];
    if (!data) {
        console.error('Unknown demo type:', type);
        return;
    }

    displayResults(data);
}

// =============================================================================
// DISPLAY RESULTS
// =============================================================================
function displayResults(results) {
    currentResults = results;

    // Hide empty state, show results
    elements.emptyState.classList.add('hidden');
    elements.resultsDisplay.classList.remove('hidden');
    elements.resultActions.classList.remove('hidden');

    // Classification badge
    const badge = elements.classificationBadge;
    badge.className = `classification-badge ${results.classification}`;
    badge.innerHTML = `
        <span class="badge-icon">${getBadgeIcon(results.classification)}</span>
        <div class="badge-content">
            <span class="badge-level">${results.level}</span>
            <span class="badge-text">${results.summary}</span>
        </div>
    `;

    // Meta information
    elements.metaDocument.textContent = results.document;
    elements.metaParties.textContent = results.parties;
    elements.metaType.textContent = results.type;
    elements.metaTerm.textContent = results.term;
    elements.metaLaw.textContent = results.governingLaw;

    // Screening results
    elements.screeningGrid.innerHTML = results.screening.map(item => `
        <div class="screening-item ${item.status}">
            <span class="screening-status">${getStatusIcon(item.status)}</span>
            <span>${item.criterion}</span>
        </div>
    `).join('');

    // Issues
    const issueCount = results.issues.length;
    elements.issueCount.textContent = issueCount;
    elements.issueCount.style.display = issueCount > 0 ? 'inline-flex' : 'none';

    if (issueCount > 0) {
        elements.issuesContent.innerHTML = `<div class="issues-list">
            ${results.issues.map(issue => `
                <div class="issue-card ${issue.severity}">
                    <h4>${getSeverityIcon(issue.severity)} ${issue.title}</h4>
                    ${issue.description ? `<p><strong>What:</strong> ${issue.description}</p>` : ''}
                    ${issue.risk ? `<p class="issue-risk"><strong>Risk:</strong> ${issue.risk}</p>` : ''}
                    ${issue.recommendation ? `<p><strong>Recommendation:</strong> ${issue.recommendation}</p>` : ''}
                </div>
            `).join('')}
        </div>`;
    } else {
        elements.issuesContent.innerHTML = '<div class="no-issues"><p>✓ No issues identified. Document meets all playbook standards.</p></div>';
    }

    // Recommendation
    elements.recommendationContent.innerHTML = `<div class="recommendation-text">${results.recommendation}</div>`;

    // Next steps
    elements.nextStepsContent.innerHTML = `<ul class="next-steps-list">
        ${results.nextSteps.map(step => `<li>${step}</li>`).join('')}
    </ul>`;

    // Scroll to results
    elements.resultsDisplay.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function getBadgeIcon(classification) {
    switch (classification) {
        case 'green': return '✓';
        case 'yellow': return '⚠';
        case 'red': return '✕';
        default: return '?';
    }
}

function getStatusIcon(status) {
    switch (status) {
        case 'pass': return '✓';
        case 'flag': return '⚠';
        case 'fail': return '✕';
        default: return '•';
    }
}

function getSeverityIcon(severity) {
    return severity === 'red' ? '🔴' : '🟡';
}

// =============================================================================
// COLLAPSIBLE SECTIONS
// =============================================================================
function initializeSections() {
    // Sections are expanded by default - this handles toggle
}

function toggleSection(sectionId) {
    const content = document.getElementById(`${sectionId}Content`);
    const toggle = content.previousElementSibling.querySelector('.section-toggle');

    if (content.classList.contains('expanded')) {
        content.classList.remove('expanded');
        toggle.textContent = '▶';
    } else {
        content.classList.add('expanded');
        toggle.textContent = '▼';
    }
}

// =============================================================================
// COPY & EXPORT
// =============================================================================
function copyResults() {
    if (!currentResults) {
        alert('No results to copy.');
        return;
    }

    const text = formatResultsAsText(currentResults);
    navigator.clipboard.writeText(text).then(() => {
        alert('Results copied to clipboard!');
    }).catch(err => {
        console.error('Copy failed:', err);
        alert('Failed to copy. Please try again.');
    });
}

function formatResultsAsText(results) {
    let text = `NDA TRIAGE REPORT\n`;
    text += `${'='.repeat(50)}\n\n`;
    text += `Classification: ${results.level} - ${results.summary}\n`;
    text += `Document: ${results.document}\n`;
    text += `Parties: ${results.parties}\n`;
    text += `Type: ${results.type}\n`;
    text += `Term: ${results.term}\n`;
    text += `Governing Law: ${results.governingLaw}\n\n`;

    text += `SCREENING RESULTS\n${'-'.repeat(30)}\n`;
    results.screening.forEach(item => {
        const status = item.status === 'pass' ? '✓ PASS' : item.status === 'flag' ? '⚠ FLAG' : '✕ FAIL';
        text += `${status} - ${item.criterion}\n`;
    });

    if (results.issues.length > 0) {
        text += `\nISSUES FOUND (${results.issues.length})\n${'-'.repeat(30)}\n`;
        results.issues.forEach((issue, i) => {
            text += `\n${i + 1}. [${issue.severity.toUpperCase()}] ${issue.title}\n`;
            if (issue.description) text += `   ${issue.description}\n`;
            if (issue.recommendation) text += `   Recommendation: ${issue.recommendation}\n`;
        });
    }

    text += `\nRECOMMENDATION\n${'-'.repeat(30)}\n${results.recommendation}\n`;

    text += `\nNEXT STEPS\n${'-'.repeat(30)}\n`;
    results.nextSteps.forEach((step, i) => {
        text += `${i + 1}. ${step}\n`;
    });

    text += `\n${'='.repeat(50)}\n`;
    text += `Generated: ${new Date().toLocaleString()}\n`;
    text += `This analysis assists with legal workflows but does not constitute legal advice.\n`;

    return text;
}

function exportReport() {
    if (!currentResults) {
        alert('No results to export.');
        return;
    }

    const html = generateReportHTML(currentResults);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legal-analysis-${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function generateReportHTML(results) {
    const badgeColors = {
        green: { bg: '#E8F5E9', text: '#2E7D32' },
        yellow: { bg: '#FFF8E1', text: '#F9A825' },
        red: { bg: '#FFEBEE', text: '#C62828' }
    };
    const colors = badgeColors[results.classification] || badgeColors.green;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Legal Analysis Report | Consello</title>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'DM Sans', Arial, sans-serif;
            color: #000;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            line-height: 1.6;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #000;
            padding-bottom: 1rem;
            margin-bottom: 2rem;
        }
        .logo { font-size: 1.5rem; font-weight: 700; letter-spacing: 0.05em; }
        .meta { color: #666; font-size: 0.875rem; }
        .confidential {
            background: #000;
            color: #fff;
            padding: 0.25rem 0.5rem;
            font-size: 0.75rem;
            font-weight: 500;
        }
        h1 { font-size: 1.75rem; margin-bottom: 1rem; }
        .classification {
            display: inline-block;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            font-weight: 700;
            font-size: 1.25rem;
            margin-bottom: 2rem;
            background: ${colors.bg};
            color: ${colors.text};
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin-bottom: 2rem;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 8px;
        }
        .info-item label { font-size: 0.75rem; color: #666; text-transform: uppercase; }
        .info-item span { display: block; font-weight: 500; }
        h2 { font-size: 1.25rem; margin: 2rem 0 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #e0e0e0; }
        .screening-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
        .screening-item {
            padding: 0.5rem 0.75rem;
            border-radius: 4px;
            font-size: 0.875rem;
        }
        .screening-item.pass { background: #E8F5E9; color: #2E7D32; }
        .screening-item.flag { background: #FFF8E1; color: #F9A825; }
        .screening-item.fail { background: #FFEBEE; color: #C62828; }
        .issue-card {
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            border-left: 4px solid;
        }
        .issue-card.yellow { background: #FFF8E1; border-color: #F9A825; }
        .issue-card.red { background: #FFEBEE; border-color: #C62828; }
        .issue-card h3 { font-size: 1rem; margin-bottom: 0.5rem; }
        .issue-card p { font-size: 0.875rem; margin-bottom: 0.25rem; }
        .recommendation { padding: 1rem; background: #f8f9fa; border-radius: 8px; }
        .next-steps { list-style: none; }
        .next-steps li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; }
        .next-steps li::before { content: "→"; position: absolute; left: 0; color: #A64A30; }
        .footer {
            margin-top: 3rem;
            padding-top: 1rem;
            border-top: 1px solid #e0e0e0;
            text-align: center;
            font-size: 0.75rem;
            color: #666;
        }
        @media print {
            body { padding: 0; }
            .header { page-break-after: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">CONSELLO</div>
        <div class="meta">
            <span>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span class="confidential">CONFIDENTIAL</span>
        </div>
    </div>

    <h1>Legal Analysis Report</h1>

    <div class="classification">${results.level} — ${results.summary}</div>

    <div class="info-grid">
        <div class="info-item"><label>Document</label><span>${results.document}</span></div>
        <div class="info-item"><label>Parties</label><span>${results.parties}</span></div>
        <div class="info-item"><label>Type</label><span>${results.type}</span></div>
        <div class="info-item"><label>Term</label><span>${results.term}</span></div>
        <div class="info-item"><label>Governing Law</label><span>${results.governingLaw}</span></div>
    </div>

    <h2>Screening Results</h2>
    <div class="screening-grid">
        ${results.screening.map(item => `
            <div class="screening-item ${item.status}">
                ${getStatusIcon(item.status)} ${item.criterion}
            </div>
        `).join('')}
    </div>

    ${results.issues.length > 0 ? `
        <h2>Issues Found (${results.issues.length})</h2>
        ${results.issues.map(issue => `
            <div class="issue-card ${issue.severity}">
                <h3>${getSeverityIcon(issue.severity)} ${issue.title}</h3>
                ${issue.description ? `<p><strong>What:</strong> ${issue.description}</p>` : ''}
                ${issue.risk ? `<p><strong>Risk:</strong> ${issue.risk}</p>` : ''}
                ${issue.recommendation ? `<p><strong>Recommendation:</strong> ${issue.recommendation}</p>` : ''}
            </div>
        `).join('')}
    ` : ''}

    <h2>Recommendation</h2>
    <div class="recommendation">${results.recommendation}</div>

    <h2>Next Steps</h2>
    <ul class="next-steps">
        ${results.nextSteps.map(step => `<li>${step}</li>`).join('')}
    </ul>

    <div class="footer">
        <p>This analysis assists with legal workflows but does not constitute legal advice.</p>
        <p>All findings should be reviewed by qualified legal professionals.</p>
        <p><strong>© ${new Date().getFullYear()} Consello</strong></p>
    </div>
</body>
</html>`;
}

// =============================================================================
// PRESENTATION MODE
// =============================================================================
function togglePresentationMode() {
    const overlay = elements.presentationOverlay;

    if (overlay.classList.contains('hidden')) {
        // Enter presentation mode
        overlay.classList.remove('hidden');

        // Clone results into presentation view
        if (currentResults) {
            const content = document.createElement('div');
            content.style.cssText = 'background: white; border-radius: 16px; padding: 2rem; max-width: 900px; max-height: 90vh; overflow-y: auto;';
            content.innerHTML = elements.resultsDisplay.innerHTML;
            overlay.appendChild(content);
        }

        document.body.style.overflow = 'hidden';
    } else {
        // Exit presentation mode
        overlay.classList.add('hidden');

        // Remove cloned content
        const content = overlay.querySelector('div:not(.exit-presentation)');
        if (content) content.remove();

        document.body.style.overflow = '';
    }
}

// ESC key to exit presentation mode
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !elements.presentationOverlay.classList.contains('hidden')) {
        togglePresentationMode();
    }
});
