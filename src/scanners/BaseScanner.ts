import { v4 as uuidv4 } from 'crypto';
import { Finding, ScanOptions, ScanResult, SeverityLevel, TargetType } from './types';

export abstract class BaseScanner {
  protected scanId: string;
  protected findings: Finding[] = [];
  protected options: ScanOptions;

  constructor(options: ScanOptions) {
    this.scanId = this.generateScanId();
    this.options = options;
  }

  protected generateScanId(): string {
    return `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  protected addFinding(
    ruleId: string,
    title: string,
    description: string,
    severity: SeverityLevel,
    category: string,
    recommendation: string,
    evidence: string,
    path?: string,
    code?: string
  ): void {
    const finding: Finding = {
      id: `finding_${this.findings.length + 1}`,
      ruleId,
      title,
      description,
      severity,
      category,
      target: this.options.target,
      path,
      code,
      recommendation,
      evidence,
      timestamp: new Date().toISOString(),
    };
    this.findings.push(finding);
  }

  abstract scan(): Promise<ScanResult>;

  protected createScanResult(): ScanResult {
    const endTime = new Date().toISOString();
    const startTime = new Date(Date.now() - 60000).toISOString(); // Approximate start time

    const summary = {
      total: this.findings.length,
      critical: this.findings.filter(f => f.severity === 'critical').length,
      high: this.findings.filter(f => f.severity === 'high').length,
      medium: this.findings.filter(f => f.severity === 'medium').length,
      low: this.findings.filter(f => f.severity === 'low').length,
      info: this.findings.filter(f => f.severity === 'info').length,
    };

    return {
      scanId: this.scanId,
      target: this.options.target,
      targetType: this.options.type,
      startTime,
      endTime,
      duration: Date.parse(endTime) - Date.parse(startTime),
      findings: this.findings,
      summary,
    };
  }
}
