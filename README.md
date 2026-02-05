# Consello Legal Document Analysis Demo

AI-powered contract review and NDA triage for in-house legal teams, featuring Consello brand styling.

> **For detailed AI configuration and architecture**: See [claude.md](claude.md)

---

## Quick Start

### 1. Start the Web Dashboard

**Option A: VS Code Live Server**
1. Install the "Live Server" extension in VS Code
2. Right-click `index.html` → "Open with Live Server"
3. Dashboard opens at `http://127.0.0.1:5500`

**Option B: Simple HTTP Server**
```bash
cd c:\Users\DavidBerglund\claude-for-legal
npx serve
```
Dashboard opens at `http://localhost:3000`

### 2. Run Legal Plugin Commands

The legal plugin commands are available in Claude Code. Use these slash commands:

| Command | Purpose |
|---------|---------|
| `/triage-nda` | Rapid NDA screening with GREEN/YELLOW/RED classification |
| `/review-contract` | Full contract analysis against playbook standards |
| `/brief daily` | Morning legal briefing |
| `/vendor-check [name]` | Check vendor agreement status |

### 3. Demo Flow

1. Open the web dashboard in your browser
2. Upload an NDA or contract (sample files in `sample-ndas/`)
3. Select analysis type (NDA Triage or Contract Review)
4. Run the corresponding command in Claude Code
5. Paste the results into the dashboard
6. View formatted results with classification badges
7. Export as branded Consello report

---

## Project Structure

```
claude-for-legal/
├── .claude/
│   ├── CLAUDE.md           # Project instructions for Claude
│   ├── settings.local.json # Project configuration
│   └── skills/
│       └── consello-brand.md  # Brand skill (project-local)
├── index.html              # Main web dashboard
├── styles.css              # Consello-branded styles
├── app.js                  # Dashboard functionality
├── claude.md               # Detailed AI configuration & architecture
├── SKILL.md                # Consello brand guidelines
├── README.md               # This file
├── reports/
│   └── template.html       # Branded report template
└── sample-ndas/
    ├── standard-nda.txt    # Clean NDA (should show GREEN)
    └── problematic-nda.txt # NDA with issues (should show RED)
```

### Key Configuration Files

| File | Purpose |
|------|---------|
| `.claude/CLAUDE.md` | Instructions Claude follows for this project |
| `claude.md` | Full documentation: playbook summary, output formats, architecture |
| `~/.claude/legal.local.md` | Legal playbook with contract positions & templates |
| `SKILL.md` | Consello brand guidelines with legal report styling |

## Sample Documents

### standard-nda.txt (Expected: GREEN)
A market-standard mutual NDA with:
- Mutual obligations
- All required carveouts
- 2-year term, 3-year survival
- Standard remedies
- New York governing law

### problematic-nda.txt (Expected: RED)
An aggressive one-sided NDA with multiple issues:
- ❌ Unilateral (receiving party only)
- ❌ Missing independent development carveout
- ❌ Non-solicitation clause (3 years)
- ❌ Non-compete clause (2 years)
- ❌ Exclusivity provision
- ❌ Broad residuals clause
- ❌ IP assignment provision
- ❌ Audit rights
- ❌ Perpetual confidentiality
- ❌ $500,000 liquidated damages
- ❌ Mandatory arbitration in Houston

---

## Configuration

### Legal Playbook

The playbook is configured at:
```
~/.claude/legal.local.md
```

This defines standard positions for:
- Limitation of liability
- Indemnification
- IP ownership
- Data protection
- Term and termination
- Governing law
- NDA screening criteria

### Legal Plugin Files

Plugin skills and commands are at:
```
~/.claude/plugins/marketplaces/knowledge-work-plugins/legal/
├── commands/
│   ├── triage-nda.md
│   ├── review-contract.md
│   ├── brief.md
│   └── vendor-check.md
└── skills/
    ├── nda-triage/
    ├── contract-review/
    └── compliance/
```

---

## Demo Script

### Demo 1: NDA Triage (2-3 minutes)

**Setup**: Open dashboard, have both sample NDAs ready

1. **Show the Problem**
   - "Legal teams receive dozens of NDAs weekly"
   - "Manual review is time-consuming and inconsistent"

2. **Standard NDA Demo**
   - Upload `standard-nda.txt`
   - Run `/triage-nda`
   - Show GREEN classification
   - "This NDA is market-standard, can be approved via delegation"

3. **Problematic NDA Demo**
   - Upload `problematic-nda.txt`
   - Run `/triage-nda`
   - Show RED classification with specific issues
   - "Immediately flags non-compete, missing carveouts, perpetual term"
   - "Provides specific fix recommendations"

4. **Export Report**
   - Click "Export Report"
   - Show branded Consello PDF

### Demo 2: Contract Review (5-7 minutes)

1. **Context Gathering**
   - "For deeper analysis, we gather context"
   - Set role as Customer/Buyer
   - Note focus areas

2. **Run Analysis**
   - Run `/review-contract`
   - Walk through clause-by-clause analysis
   - Show redline suggestions

3. **Business Value**
   - "Consistent application of playbook"
   - "Junior attorneys can handle more reviews"
   - "Senior counsel focuses on edge cases"

### Demo 3: Show Integration Potential

- Mention Slack, Box, Microsoft 365 integrations
- Daily briefings with `/brief daily`
- Vendor tracking with `/vendor-check`

---

## Consello Branding

The dashboard follows Consello brand guidelines:

| Element | Value |
|---------|-------|
| Primary Colors | Black #000000, White #FFFFFF |
| Accent Colors | Terracotta #A64A30, Apricot #F6D1A3 |
| Font | DM Sans (Google Fonts) |
| Button Style | Pill-shaped (border-radius: 9999px) |
| Logo Position | Top-left |

---

## Troubleshooting

### Commands not working
Make sure the legal plugin is installed. The plugin files should be at:
```
~/.claude/plugins/marketplaces/knowledge-work-plugins/legal/
```

### Results not parsing
- Ensure you copy the complete output from Claude
- Results should include "Classification" and "Screening Results"

### Dashboard not loading
- Check browser console for errors
- Ensure all files (index.html, styles.css, app.js) are in the same directory

---

## Legal Disclaimer

This tool assists with legal workflows but does not provide legal advice. All AI-generated analysis should be reviewed by qualified legal professionals before being relied upon for legal decisions.

---

© 2026 Consello
