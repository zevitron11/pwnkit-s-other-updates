import { ScanResult, SARIFResult, SARIFFinding } from '../types';

export class SARIFExporter {
  static generateSARIF(scanResult: ScanResult): SARIFResult {
    const findings: SARIFFinding[] = scanResult.findings.map(finding => ({
      ruleId: finding.ruleId,
      level: this.mapSeverityToLevel(finding.severity),
      message: {
        text: finding.description,
      },
      locations: finding.path ? [{
        physicalLocation: {
          artifactLocation: {
            uri: finding.path,
          },
        },
      }] : [],
      properties: {
        category: finding.category,
        recommendation: finding.recommendation,
        evidence: finding.evidence,
      },
    }));

    return {
      version: '2.1.0',
      runs: [{
        tool: {
          driver: {
            name: 'pwnkit',
            version: '2.8.0',
            informationUri: 'https://github.com/Gerberayale521/pwnkit',
          },
        },
        results: findings,
      }],
    };
  }

  private static mapSeverityToLevel(severity: string): string {
    const severityMap: Record<string, string> = {
      critical: 'error',
      high: 'warning',
      medium: 'note',
      low: 'note',
      info: 'none',
    };
    return severityMap[severity] || 'warning';
  }
}
