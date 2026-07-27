import { ScanResult, Finding, SeverityLevel } from '../types';

export class ReportGenerator {
  static generateHTMLReport(scanResult: ScanResult): string {
    const severityColors: Record<SeverityLevel, string> = {
      critical: '#d32f2f',
      high: '#f57c00',
      medium: '#fbc02d',
      low: '#388e3c',
      info: '#1976d2',
    };

    const findingsHTML = scanResult.findings
      .sort((a, b) => this.getSeverityScore(b.severity) - this.getSeverityScore(a.severity))
      .map(finding => `
        <div class="finding" style="border-left: 5px solid ${severityColors[finding.severity]}">
          <h3>${finding.title}</h3>
          <p><strong>Rule ID:</strong> ${finding.ruleId}</p>
          <p><strong>Severity:</strong> <span style="color: ${severityColors[finding.severity]}">${finding.severity.toUpperCase()}</span></p>
          <p><strong>Category:</strong> ${finding.category}</p>
          <p><strong>Description:</strong> ${finding.description}</p>
          <p><strong>Evidence:</strong> ${finding.evidence}</p>
          ${finding.path ? `<p><strong>Location:</strong> ${finding.path}</p>` : ''}
          ${finding.code ? `<p><strong>Code:</strong> <code>${this.escapeHtml(finding.code)}</code></p>` : ''}
          <p><strong>Recommendation:</strong> ${finding.recommendation}</p>
        </div>
      `)
      .join('\n');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>pwnkit Security Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { border-bottom: 3px solid #1976d2; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #1976d2; font-size: 28px; margin-bottom: 10px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px; }
        .summary-card { background: #f5f5f5; padding: 20px; border-radius: 4px; text-align: center; }
        .summary-card h3 { color: #666; font-size: 12px; text-transform: uppercase; margin-bottom: 10px; }
        .summary-card .value { font-size: 32px; font-weight: bold; }
        .summary-card.critical .value { color: #d32f2f; }
        .summary-card.high .value { color: #f57c00; }
        .summary-card.medium .value { color: #fbc02d; }
        .summary-card.low .value { color: #388e3c; }
        .summary-card.total .value { color: #1976d2; }
        .finding { padding: 20px; margin-bottom: 20px; background: #fafafa; border-radius: 4px; }
        .finding h3 { color: #333; margin-bottom: 12px; font-size: 18px; }
        .finding p { margin: 8px 0; color: #666; line-height: 1.6; }
        .finding strong { color: #333; }
        .finding code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; }
        .meta { color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ pwnkit Security Report</h1>
            <p><strong>Target:</strong> ${this.escapeHtml(scanResult.target)}</p>
            <p><strong>Type:</strong> ${scanResult.targetType}</p>
            <p><strong>Scan ID:</strong> ${scanResult.scanId}</p>
        </div>

        <div class="summary">
            <div class="summary-card total">
                <h3>Total Findings</h3>
                <div class="value">${scanResult.summary.total}</div>
            </div>
            <div class="summary-card critical">
                <h3>Critical</h3>
                <div class="value">${scanResult.summary.critical}</div>
            </div>
            <div class="summary-card high">
                <h3>High</h3>
                <div class="value">${scanResult.summary.high}</div>
            </div>
            <div class="summary-card medium">
                <h3>Medium</h3>
                <div class="value">${scanResult.summary.medium}</div>
            </div>
            <div class="summary-card low">
                <h3>Low</h3>
                <div class="value">${scanResult.summary.low}</div>
            </div>
            <div class="summary-card info">
                <h3>Info</h3>
                <div class="value">${scanResult.summary.info}</div>
            </div>
        </div>

        <h2 style="margin: 30px 0 20px 0; color: #333;">Findings</h2>
        ${findingsHTML}

        <div class="meta">
            <p>Report generated: ${new Date().toLocaleString()}</p>
            <p>pwnkit v2.8.0 - Safer AI and app testing</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  static generateTextReport(scanResult: ScanResult): string {
    const divider = '═'.repeat(80);
    let report = `
${divider}
🛡️  pwnkit Security Report
${divider}

TARGET INFORMATION:
  Target: ${scanResult.target}
  Type: ${scanResult.targetType}
  Scan ID: ${scanResult.scanId}
  Start Time: ${scanResult.startTime}
  End Time: ${scanResult.endTime}
  Duration: ${scanResult.duration}ms

SUMMARY:
  Total Findings: ${scanResult.summary.total}
  • Critical: ${scanResult.summary.critical}
  • High: ${scanResult.summary.high}
  • Medium: ${scanResult.summary.medium}
  • Low: ${scanResult.summary.low}
  • Info: ${scanResult.summary.info}

${divider}
FINDINGS
${divider}

`;

    scanResult.findings
      .sort((a, b) => this.getSeverityScore(b.severity) - this.getSeverityScore(a.severity))
      .forEach((finding, index) => {
        report += `
[${index + 1}] ${finding.title}
    Rule ID: ${finding.ruleId}
    Severity: ${finding.severity.toUpperCase()}
    Category: ${finding.category}
    Description: ${finding.description}
    Evidence: ${finding.evidence}
    ${finding.path ? `Location: ${finding.path}\n    ` : ''}${finding.code ? `Code: ${finding.code}\n    ` : ''}Recommendation: ${finding.recommendation}

`;
      });

    report += `${divider}
Report generated: ${new Date().toLocaleString()}
pwnkit v2.8.0 - Safer AI and app testing
${divider}`;

    return report;
  }

  private static getSeverityScore(severity: SeverityLevel): number {
    const scores: Record<SeverityLevel, number> = {
      critical: 5,
      high: 4,
      medium: 3,
      low: 2,
      info: 1,
    };
    return scores[severity];
  }

  private static escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}
