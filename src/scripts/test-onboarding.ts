#!/usr/bin/env node

/**
 * Test script for onboarding system
 * Runs all onboarding-related tests and provides a summary
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

const testFiles = [
    // Component tests
    'src/components/onboarding/__tests__/onboarding-flow.test.tsx',
    'src/components/onboarding/__tests__/role-selection.test.tsx',
    'src/components/onboarding/__tests__/creator-onboarding.test.tsx',
    'src/components/onboarding/__tests__/buyer-onboarding.test.tsx',
    'src/components/onboarding/__tests__/onboarding-complete.test.tsx',
    'src/components/onboarding/__tests__/onboarding-integration.test.tsx',

    // API tests
    'src/app/api/onboarding/__tests__/onboarding-api.test.ts',

    // Service tests
    'src/lib/database/services/__tests__/onboarding.service.test.ts',

    // Validation tests
    'src/lib/validations/__tests__/onboarding.test.ts',
];

function checkTestFiles() {
    console.log('🔍 Checking test files...\n');

    const missingFiles: string[] = [];
    const existingFiles: string[] = [];

    testFiles.forEach(file => {
        const fullPath = path.join(process.cwd(), file);
        if (existsSync(fullPath)) {
            existingFiles.push(file);
            console.log(`✅ ${file}`);
        } else {
            missingFiles.push(file);
            console.log(`❌ ${file} (missing)`);
        }
    });

    console.log(`\n📊 Test files: ${existingFiles.length}/${testFiles.length} found`);

    if (missingFiles.length > 0) {
        console.log('\n⚠️  Missing test files:');
        missingFiles.forEach(file => console.log(`   - ${file}`));
    }

    return existingFiles;
}

function runTests(testFiles: string[]) {
    console.log('\n🧪 Running onboarding tests...\n');

    try {
        // Run tests with vitest
        const testPattern = testFiles.map(file =>
            file.replace('src/', '').replace('.tsx', '').replace('.ts', '')
        ).join('|');

        const command = `npx vitest run --reporter=verbose ${testFiles.join(' ')}`;

        console.log(`Running: ${command}\n`);

        const output = execSync(command, {
            encoding: 'utf8',
            stdio: 'inherit'
        });

        console.log('\n✅ All onboarding tests passed!');

    } catch (error) {
        console.error('\n❌ Some tests failed:');
        console.error(error);
        process.exit(1);
    }
}

function runCoverage() {
    console.log('\n📈 Running coverage analysis...\n');

    try {
        const command = 'npx vitest run --coverage --reporter=verbose src/components/onboarding src/lib/database/services/onboarding.service.ts src/lib/validations/onboarding.ts src/app/api/onboarding';

        execSync(command, {
            encoding: 'utf8',
            stdio: 'inherit'
        });

    } catch (error) {
        console.warn('⚠️  Coverage analysis failed (this is optional)');
    }
}

function main() {
    console.log('🚀 Onboarding System Test Runner\n');
    console.log('='.repeat(50));

    // Check if all test files exist
    const existingTestFiles = checkTestFiles();

    if (existingTestFiles.length === 0) {
        console.log('\n❌ No test files found. Please create the test files first.');
        process.exit(1);
    }

    // Run the tests
    runTests(existingTestFiles);

    // Run coverage if requested
    if (process.argv.includes('--coverage')) {
        runCoverage();
    }

    console.log('\n🎉 Onboarding system testing complete!');
    console.log('\nNext steps:');
    console.log('1. Review test results');
    console.log('2. Fix any failing tests');
    console.log('3. Add more test cases if needed');
    console.log('4. Run integration tests with: npm run test:integration');
}

// Run the script
if (require.main === module) {
    main();
}

export { checkTestFiles, runTests, runCoverage };