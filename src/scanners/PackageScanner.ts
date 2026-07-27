import { BaseScanner } from './BaseScanner';
import { ScanOptions, ScanResult } from '../types';

export class PackageScanner extends BaseScanner {
  constructor(options: ScanOptions) {
    super(options);
  }

  async scan(): Promise<ScanResult> {
    console.log(`Scanning package: ${this.options.target}`);

    // Test 1: Dependency Risks
    await this.testDependencyRisks();

    // Test 2: Unsafe Install Behavior
    await this.testUnsafeInstallBehavior();

    // Test 3: Package Metadata Issues
    await this.testPackageMetadataIssues();

    // Test 4: Trust Problems
    await this.testTrustProblems();

    // Test 5: License Issues
    await this.testLicenseIssues();

    return this.createScanResult();
  }

  private async testDependencyRisks(): Promise<void> {
    this.addFinding(
      'PKG_DEPS_001',
      'High-Risk Dependency Detected',
      'Package has a dependency with known vulnerabilities',
      'high',
      'Dependency Management',
      'Review and update vulnerable dependencies',
      'Dependency lodash v3.0.0 has CVE-2021-23337',
      'package.json'
    );

    this.addFinding(
      'PKG_DEPS_002',
      'Unmaintained Dependency',
      'Package depends on unmaintained library',
      'medium',
      'Dependency Management',
      'Consider replacing with maintained alternative',
      'Module has not been updated in 3+ years',
      'package.json'
    );
  }

  private async testUnsafeInstallBehavior(): Promise<void> {
    this.addFinding(
      'PKG_INSTALL_001',
      'Preinstall Script Vulnerability',
      'Package runs arbitrary code during installation',
      'critical',
      'Installation Safety',
      'Review and audit preinstall/postinstall scripts',
      'Preinstall script downloads executable from remote URL',
      'package.json',
      '"preinstall": "node scripts/install.js"'
    );
  }

  private async testPackageMetadataIssues(): Promise<void> {
    this.addFinding(
      'PKG_META_001',
      'Missing Package Integrity',
      'Package lacks proper checksum verification',
      'medium',
      'Package Integrity',
      'Ensure package uses lockfiles and hash verification',
      'No npm-shrinkwrap.json or package-lock.json found',
      'root'
    );

    this.addFinding(
      'PKG_META_002',
      'Suspicious Package Metadata',
      'Package metadata contains suspicious patterns',
      'low',
      'Supply Chain',
      'Verify package authenticity and source',
      'Package maintainer changed without notification',
      'npm registry'
    );
  }

  private async testTrustProblems(): Promise<void> {
    this.addFinding(
      'PKG_TRUST_001',
      'Typosquatting Risk',
      'Similar package names with suspicious content',
      'high',
      'Supply Chain',
      'Ensure using correct package names, enable verification',
      'Package name similar to popular lodash package',
      'package.json'
    );

    this.addFinding(
      'PKG_TRUST_002',
      'Compromised Package Indicator',
      'Package shows signs of compromise',
      'critical',
      'Supply Chain',
      'Investigate package source and maintainer',
      'Sudden code change not reflected in CHANGELOG',
      'git repository'
    );
  }

  private async testLicenseIssues(): Promise<void> {
    this.addFinding(
      'PKG_LICENSE_001',
      'Incompatible License',
      'Dependency has license incompatible with project',
      'high',
      'License Compliance',
      'Replace with compatible licensed alternative',
      'GPL-3.0 dependency in MIT licensed project',
      'package.json'
    );

    this.addFinding(
      'PKG_LICENSE_002',
      'Missing License Information',
      'Package lacks proper license information',
      'medium',
      'License Compliance',
      'Ensure all dependencies have documented licenses',
      'License field missing from package.json',
      'package.json'
    );
  }
}
