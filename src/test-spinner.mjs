#!/usr/bin/env node

import { createSpinner } from './spinner.mjs';

// Helper to create a promise-based delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

console.log('Testing Spinner Utility\n');
console.log('======================\n');

async function runTests() {
  // Test 1: Dots animation with success
  await testDotsSuccess();
  
  // Test 2: Dots animation with error
  await testDotsError();
  
  // Test 3: Progress bar animation
  await testProgressBar();
  
  // Test 4: Manual stop
  await testManualStop();
  
  console.log('\nAll tests completed!');
}

async function testDotsSuccess() {
  console.log('Test 1: Dots animation with success');
  const dotsSpinner = createSpinner({
    loadingText: 'Processing data...',
    completionText: 'Data processed successfully',
    errorText: 'Failed to process data',
    animationType: 'dots'
  });

  dotsSpinner.start();
  await delay(3000);
  dotsSpinner.succeed();
  await delay(500);
}

async function testDotsError() {
  console.log('\nTest 2: Dots animation with error');
  const errorSpinner = createSpinner({
    loadingText: 'Attempting to connect...',
    completionText: 'Connected successfully',
    errorText: 'Connection failed',
    animationType: 'dots'
  });
  
  errorSpinner.start();
  await delay(2000);
  errorSpinner.fail();
  await delay(500);
}

async function testProgressBar() {
  console.log('\nTest 3: Progress bar animation');
  const progressSpinner = createSpinner({
    loadingText: 'Uploading file...',
    completionText: 'Upload complete',
    errorText: 'Upload failed',
    animationType: 'progress'
  });
  
  progressSpinner.start();
  
  for (let currentProgress = 0; currentProgress <= 100; currentProgress += 10) {
    progressSpinner.updateProgress(currentProgress);
    await delay(300);
  }
  
  await delay(500);
  progressSpinner.succeed();
  await delay(500);
}

async function testManualStop() {
  console.log('\nTest 4: Manual stop without completion message');
  const manualSpinner = createSpinner({
    loadingText: 'Running task...',
    completionText: 'Task completed',
    errorText: 'Task failed',
    animationType: 'dots'
  });
  
  manualSpinner.start();
  await delay(2000);
  manualSpinner.stop();
  console.log('Spinner stopped manually');
}

runTests();
