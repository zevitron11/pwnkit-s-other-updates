# pwnkit - TypeScript Implementation Guide

## Overview

This is a comprehensive TypeScript implementation of pwnkit, a security testing tool for:
- **AI Systems** - Test for prompt injection, data leaks, unsafe tool use, weak guardrails
- **Web Apps** - Test for input validation flaws, unsafe redirects, CSRF, XSS, and common web vulnerabilities
- **Code** - Review for risky code paths, insecure defaults, secrets, and bad input handling
- **Packages** - Inspect for dependency risks, unsafe install behavior, metadata issues, and supply chain attacks

## Project Structure

```
pwnkit-s-other-updates/
├── src/
│   ├── cli.ts                    # Command-line interface
│   ├── index.ts                  # Main exports
│   ├── types.ts                  # TypeScript type definitions
│   ├── PwnkitScanner.ts         # Main scanner orchestrator
│   ├── scanners/
│   │   ├── BaseScanner.ts       # Abstract base class for all scanners
│   │   ├── AISystemScanner.ts   # AI system security scanner
│   │   ├── WebAppScanner.ts     # Web application scanner
│   │   ├── CodeScanner.ts       # Source code scanner
│   │   └── PackageScanner.ts    # Package security scanner
│   └── exporters/
│       ├── SARIFExporter.ts     # SARIF format export
│       └── ReportGenerator.ts   # HTML/Text report generation
├── package.json
├── tsconfig.json
└── README.md
```

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `typescript` - TypeScript compiler
- `commander` - CLI argument parsing
- `chalk` - Colored console output
- `axios` - HTTP requests (for remote scanning)
- `playwright` - Browser automation

### 2. Build the Project

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### 3. Run pwnkit

After building, you can run:

```bash
node dist/cli.js scan -t <target> -y <type> [options]
```

Or make it executable:

```bash
npm start -- scan -t "https://example.com" -y web
```

## Usage Examples

### Scan a Web Application

```bash
npm start -- scan -t "https://example.com" -y web -f html -o report.html
```

This scans for:
- XSS vulnerabilities
- SQL injection risks
- CSRF protection gaps
- Insecure redirects
- Missing authentication

### Scan AI System

```bash
npm start -- scan -t "my-ai-api" -y ai -p deep
```

Tests for:
- Prompt injection attacks
- Data leakage in responses
- Unsafe tool usage
- Weak content guardrails
- Poor input validation

### Scan Source Code

```bash
npm start -- scan -t "./src" -y code -f json -o findings.json
```

Detects:
- Hardcoded secrets
- Unsafe eval() usage
- Insecure cryptography
- Unvalidated command execution
- Vulnerable dependencies

### Scan Package

```bash
npm start -- scan -t "lodash@4.17.0" -y package -f sarif -o package-report.sarif
```

Identifies:
- Known vulnerabilities in dependencies
- Unmaintained dependencies
- Risky install scripts
- License conflicts
- Supply chain risks

## Command-Line Options

```
-t, --target <url>       Target to scan (URL, file path, or package name)
-y, --type <type>        Target type: ai, web, code, package
-p, --profile <profile>  Scan profile: quick, standard, deep (default: standard)
-k, --api-key <key>      API key for AI-based scans
-d, --depth <depth>      Scan depth level (default: 1)
-f, --format <format>    Output format: json, sarif, html, text (default: text)
-o, --output <path>      Output file path
```

## Output Formats

### Text Report (Default)
Human-readable report with summary and detailed findings.

```bash
npm start -- scan -t "target" -y web
```

### HTML Report
Interactive HTML report with visual severity indicators.

```bash
npm start -- scan -t "target" -y web -f html -o report.html
```

### SARIF Report
SARIF 2.1.0 format for integration with other security tools.

```bash
npm start -- scan -t "target" -y web -f sarif -o report.sarif
```

### JSON Report
Structured JSON output for programmatic processing.

```bash
npm start -- scan -t "target" -y web -f json -o report.json
```

## Scan Profiles

### Quick Profile
- Minimal checks
- Fast execution
- Suitable for CI/CD pipelines

```bash
npm start -- scan -t "target" -y web -p quick
```

### Standard Profile (Default)
- Comprehensive checks
- Balanced execution time
- Recommended for most use cases

```bash
npm start -- scan -t "target" -y web -p standard
```

### Deep Profile
- Extensive checks
- Longer execution time
- Better vulnerability detection
- Suitable for in-depth security reviews

```bash
npm start -- scan -t "target" -y web -p deep
```

## Using as a Library

You can also use pwnkit programmatically in your own code:

```typescript
import { PwnkitScanner } from './src/PwnkitScanner';
import { ReportGenerator } from './src/exporters/ReportGenerator';

async function scanMyApp() {
  const scanner = new PwnkitScanner();
  
  const result = await scanner.scan({
    target: 'https://example.com',
    type: 'web',
    profile: 'standard',
  });

  // Generate HTML report
  const htmlReport = ReportGenerator.generateHTMLReport(result);
  console.log(htmlReport);
  
  // Or generate text report
  const textReport = ReportGenerator.generateTextReport(result);
  console.log(textReport);
}

scanMyApp();
```

## Finding Severity Levels

- **Critical**: Security flaw that allows immediate exploitation
- **High**: Serious vulnerability with significant impact
- **Medium**: Moderate risk requiring attention
- **Low**: Minor issue with limited security impact
- **Info**: Informational finding for awareness

## Supported Vulnerability Categories

### AI Systems
- Prompt injection
- Data leakage
- Unsafe tool usage
- Guardrail bypasses
- Input validation gaps

### Web Applications
- Cross-Site Scripting (XSS)
- SQL Injection
- CSRF attacks
- Insecure redirects
- Authentication bypass
- Weak session management

### Code
- Hardcoded secrets
- Unsafe functions (eval, exec)
- Weak cryptography
- Command injection
- Vulnerable dependencies

### Packages
- Known CVEs
- Unmaintained dependencies
- Malicious install scripts
- License conflicts
- Typosquatting risks

## Development

### Watch Mode

```bash
npm run dev
```

Automatically recompiles TypeScript on changes.

### Running Tests

```bash
npm test
```

## Building for Production

```bash
npm run build
npm start -- scan -t "target" -y web
```

## Best Practices

1. **Only scan targets you own or have permission to test**
2. **Use appropriate scan profiles** - Quick for CI/CD, Deep for thorough reviews
3. **Review all critical and high severity findings**
4. **Export results** - Use SARIF for tool integration, HTML for reports
5. **Keep pwnkit updated** - Security tools should stay current

## Architecture Notes

- **BaseScanner**: Abstract class providing common scanning functionality
- **Type-Specific Scanners**: Each target type has dedicated vulnerability tests
- **Modular Design**: Easy to add new scan types or vulnerability checks
- **Export Flexibility**: Multiple output formats for different use cases
- **CLI-First**: Designed for both CLI usage and library integration

## Future Enhancements

- Playwright browser automation for live app testing
- Custom vulnerability rule definitions
- Integration with vulnerability databases (NVD, CVE)
- Real-time scanning progress updates
- Advanced filtering and sorting options
- Parallel scanning for multiple targets
- Historical scan comparison
- Web dashboard interface

## License

MIT

## Support

For issues, feature requests, or contributions, please visit the GitHub repository.

---

**pwnkit v2.8.0 - Safer AI and app testing**
