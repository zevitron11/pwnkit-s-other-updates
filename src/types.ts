/**
 * Core types and interfaces for pwnkit
 */

export type TargetType = 'ai' | 'web' | 'code' | 'package';
export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type ScanProfile = 'quick' | 'standard' | 'deep';

export interface Finding {
  id: string;
  ruleId: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  category: string;
  target: string;
  path?: string;
  code?: string;
  recommendation: string;
  evidence: string;
  timestamp: string;
}

export interface ScanOptions {
  target: string;
  type: TargetType;
  profile: ScanProfile;
  apiKey?: string;
  depth?: number;
  outputFormat?: 'json' | 'sarif' | 'html';
  exportPath?: string;
}

export interface ScanResult {
  scanId: string;
  target: string;
  targetType: TargetType;
  startTime: string;
  endTime: string;
  duration: number;
  findings: Finding[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
}

export interface SARIFResult {
  version: string;
  runs: SARIFRun[];
}

export interface SARIFRun {
  tool: {
    driver: {
      name: string;
      version: string;
      informationUri: string;
    };
  };
  results: SARIFFinding[];
}

export interface SARIFFinding {
  ruleId: string;
  level: string;
  message: {
    text: string;
  };
  locations: Array<{
    physicalLocation: {
      artifactLocation: {
        uri: string;
      };
      region?: {
        startLine: number;
      };
    };
  }>;
  properties?: {
    [key: string]: string | number;
  };
}
