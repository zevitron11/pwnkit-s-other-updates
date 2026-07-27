#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { PwnkitScanner } from './PwnkitScanner';
import { ScanOptions, ScanResult } from './types';
import { SARIFExporter } from './exporters/SARIFExporter';
import { ReportGenerator } from './exporters/ReportGenerator';

const program = new Command();

program
  .name('pwnkit')
  .description('🛡️ Safer AI and app testing - Security testing tool')
  .version('2.8.0');

program
  .command('scan')
  .description('Run a security scan on a target')
  .requiredOption('-t, --target <url>', 'Target to scan (URL, file path, or package name)')
  .requiredOption('-y, --type <type>', 'Target type (ai, web, code, package)')
  .option('-p, --profile <profile>', 'Scan profile (quick, standard, deep)', 'standard')
  .option('-k, --api-key <key>', 'API key for AI-based scans')
  .option('-d, --depth <depth>', 'Scan depth level', '1')
  .option('-f, --format <format>', 'Output format (json, sarif, html, text)', 'text')
  .option('-o, --output <path>', 'Output file path')
  .action(async (options) => {
    try {
      await runScan({
        target: options.target,
        type: options.type as any,
        profile: options.profile as any,
        apiKey: options.apiKey,
        depth: parseInt(options.depth),
        outputFormat: options.format as any,
        exportPath: options.output,
      });
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('help')
  .description('Show detailed help')
  .action(() => {
    showHelp();
  });

async function runScan(options: ScanOptions) {
  console.log(chalk.blue('\n🛡️  pwnkit - Safer AI and app testing v2.8.0\n'));
  console.log(chalk.cyan(`Scanning ${chalk.bold(options.type)} target: ${chalk.bold(options.target)}`));
  console.log(chalk.cyan(`Profile: ${chalk.bold(options.profile)}`));
  console.log(chalk.gray('Starting scan...'));

  const spinner = createSpinner();
  spinner.start();

  try {
    const scanner = new PwnkitScanner();
    const result = await scanner.scan(options);

    spinner.stop();

    // Display summary
    console.log(chalk.green('\n✓ Scan completed!\n'));
    displaySummary(result);

    // Generate and save report
    if (options.outputFormat || options.exportPath) {
      const report = generateReport(result, options.outputFormat || 'text');
      const outputPath = options.exportPath || getDefaultOutputPath(options, options.outputFormat || 'text');
      
      fs.writeFileSync(outputPath, report);
      console.log(chalk.green(`\n✓ Report saved to: ${outputPath}`));
    }

  } catch (error: any) {
    spinner.stop();
    throw error;
  }
}

function displaySummary(result: ScanResult) {
  const summary = result.summary;
  console.log(chalk.bold('Scan Summary:'));
  console.log(`  Total findings: ${chalk.bold(summary.total)}`);
  
  if (summary.critical > 0) {
    console.log(`  ${chalk.red('●')} Critical: ${chalk.bold.red(summary.critical)}`);
  }
  if (summary.high > 0) {
    console.log(`  ${chalk.yellow('●')} High: ${chalk.bold.yellow(summary.high)}`);
  }
  if (summary.medium > 0) {
    console.log(`  ${chalk.blue('●')} Medium: ${chalk.bold.blue(summary.medium)}`);
  }
  if (summary.low > 0) {
    console.log(`  ${chalk.green('●')} Low: ${chalk.bold.green(summary.low)}`);
  }
  if (summary.info > 0) {
    console.log(`  ${chalk.cyan('●')} Info: ${chalk.bold.cyan(summary.info)}`);
  }

  if (result.findings.length > 0) {
    console.log('\nFindings:');
    result.findings
      .sort((a, b) => getSeverityScore(b.severity) - getSeverityScore(a.severity))
      .forEach((finding, idx) => {
        const severityColor = getSeverityColor(finding.severity);
        console.log(`  ${idx + 1}. ${severityColor(finding.title)} (${finding.ruleId})`);
        if (finding.description) {
          console.log(`     ${finding.description}`);
        }
        if (finding.path) {
          console.log(`     Path: ${finding.path}`);
        }
      });
  }
}

function generateReport(result: ScanResult, format: string): string {
  switch (format) {
    case 'json':
      return JSON.stringify(result, null, 2);
    case 'sarif':
      return JSON.stringify(SARIFExporter.generateSARIF(result), null, 2);
    case 'html':
      return ReportGenerator.generateHTMLReport(result);
    case 'text':
    default:
      return ReportGenerator.generateTextReport(result);
  }
}

function getDefaultOutputPath(options: ScanOptions, format: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const extension = format === 'html' ? 'html' : format === 'sarif' ? 'sarif' : format === 'json' ? 'json' : 'txt';
  return `pwnkit-report-${timestamp}.${extension}`;
}

function showHelp() {
  console.log(chalk.blue('\n🛡️  pwnkit - Safer AI and app testing\n'));
  console.log('Usage:');
  console.log('  pwnkit scan -t <target> -y <type> [options]\n');
  console.log('Options:');
  console.log('  -t, --target <url>       Target to scan (URL, file path, or package name)');
  console.log('  -y, --type <type>        Target type: ai, web, code, package');
  console.log('  -p, --profile <profile>  Scan profile: quick, standard, deep (default: standard)');
  console.log('  -k, --api-key <key>      API key for AI-based scans');
  console.log('  -d, --depth <depth>      Scan depth level (default: 1)');
  console.log('  -f, --format <format>    Output format: json, sarif, html, text (default: text)');
  console.log('  -o, --output <path>      Output file path\n');
  console.log('Examples:');
  console.log('  pwnkit scan -t "https://example.com" -y web');
  console.log('  pwnkit scan -t "./myapp" -y code -f html -o report.html');
  console.log('  pwnkit scan -t "lodash@4.17.0" -y package -f json');
  console.log('  pwnkit scan -t "gpt-4-api" -y ai -p deep\n');
}

function createSpinner() {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let index = 0;

  return {
    start: () => {
      const interval = setInterval(() => {
        process.stdout.write(`\r${chalk.cyan(frames[index % frames.length])} Scanning...`);
        index++;
      }, 80);
      return interval;
    },
    stop: () => {
      process.stdout.write('\r');
    },
  };
}

function getSeverityScore(severity: string): number {
  const scores: Record<string, number> = {
    critical: 5,
    high: 4,
    medium: 3,
    low: 2,
    info: 1,
  };
  return scores[severity] || 0;
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'critical':
      return chalk.red;
    case 'high':
      return chalk.yellow;
    case 'medium':
      return chalk.blue;
    case 'low':
      return chalk.green;
    default:
      return chalk.cyan;
  }
}

program.parse();
