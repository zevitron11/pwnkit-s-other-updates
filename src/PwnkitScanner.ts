import { AISystemScanner } from './scanners/AISystemScanner';
import { WebAppScanner } from './scanners/WebAppScanner';
import { CodeScanner } from './scanners/CodeScanner';
import { PackageScanner } from './scanners/PackageScanner';
import { ScanOptions, ScanResult } from './types';

export class PwnkitScanner {
  async scan(options: ScanOptions): Promise<ScanResult> {
    const scanner = this.getScannerForType(options);
    return scanner.scan();
  }

  private getScannerForType(options: ScanOptions) {
    switch (options.type) {
      case 'ai':
        return new AISystemScanner(options);
      case 'web':
        return new WebAppScanner(options);
      case 'code':
        return new CodeScanner(options);
      case 'package':
        return new PackageScanner(options);
      default:
        throw new Error(`Unknown target type: ${options.type}`);
    }
  }
}
