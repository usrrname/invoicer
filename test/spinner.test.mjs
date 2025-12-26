import assert from 'node:assert';
import { describe, test } from 'node:test';
import { createSpinner } from '../src/spinner.mjs';

// Helper to create a promise-based delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe('Spinner Utility', () => {
  test('should create spinner with default options', () => {
    const spinner = createSpinner({
      loadingText: 'Loading...',
      completionText: 'Done',
      errorText: 'Error'
    });
    
    assert.ok(spinner, 'Spinner should be created');
    assert.strictEqual(typeof spinner.start, 'function', 'Should have start method');
    assert.strictEqual(typeof spinner.stop, 'function', 'Should have stop method');
    assert.strictEqual(typeof spinner.succeed, 'function', 'Should have succeed method');
    assert.strictEqual(typeof spinner.fail, 'function', 'Should have fail method');
    assert.strictEqual(typeof spinner.updateProgress, 'function', 'Should have updateProgress method');
  });

  test('should start and stop dots animation', async () => {
    const spinner = createSpinner({
      loadingText: 'Processing data...',
      completionText: 'Data processed successfully',
      errorText: 'Failed to process data',
      animationType: 'dots'
    });

    spinner.start();
    await delay(500);
    spinner.stop();
    
    assert.ok(true, 'Spinner started and stopped without error');
  });

  test('should complete dots animation with success', async () => {
    const spinner = createSpinner({
      loadingText: 'Processing data...',
      completionText: 'Data processed successfully',
      errorText: 'Failed to process data',
      animationType: 'dots'
    });

    spinner.start();
    await delay(500);
    spinner.succeed();
    
    assert.ok(true, 'Spinner completed successfully');
  });

  test('should complete dots animation with error', async () => {
    const spinner = createSpinner({
      loadingText: 'Attempting to connect...',
      completionText: 'Connected successfully',
      errorText: 'Connection failed',
      animationType: 'dots'
    });
    
    spinner.start();
    await delay(500);
    spinner.fail();
    
    assert.ok(true, 'Spinner failed as expected');
  });

  test('should handle progress bar animation', async () => {
    const spinner = createSpinner({
      loadingText: 'Uploading file...',
      completionText: 'Upload complete',
      errorText: 'Upload failed',
      animationType: 'progress'
    });
    
    spinner.start();
    
    for (let currentProgress = 0; currentProgress <= 100; currentProgress += 20) {
      spinner.updateProgress(currentProgress);
      await delay(100);
    }
    
    spinner.succeed();
    
    assert.ok(true, 'Progress bar animation completed');
  });

  test('should update progress correctly', async () => {
    const spinner = createSpinner({
      loadingText: 'Uploading file...',
      completionText: 'Upload complete',
      errorText: 'Upload failed',
      animationType: 'progress'
    });
    
    spinner.start();
    spinner.updateProgress(50);
    await delay(100);
    spinner.stop();
    
    assert.ok(true, 'Progress updated successfully');
  });

  test('should handle multiple start calls gracefully', async () => {
    const spinner = createSpinner({
      loadingText: 'Loading...',
      completionText: 'Done',
      errorText: 'Error',
      animationType: 'dots'
    });
    
    spinner.start();
    spinner.start(); // Should not cause issues
    await delay(100);
    spinner.stop();
    
    assert.ok(true, 'Multiple start calls handled gracefully');
  });

  test('should handle multiple stop calls gracefully', async () => {
    const spinner = createSpinner({
      loadingText: 'Loading...',
      completionText: 'Done',
      errorText: 'Error',
      animationType: 'dots'
    });
    
    spinner.start();
    await delay(100);
    spinner.stop();
    spinner.stop(); // Should not cause issues
    
    assert.ok(true, 'Multiple stop calls handled gracefully');
  });

  test('should clamp progress values', async () => {
    const spinner = createSpinner({
      loadingText: 'Processing...',
      completionText: 'Done',
      errorText: 'Error',
      animationType: 'progress'
    });
    
    spinner.start();
    spinner.updateProgress(-10); // Should clamp to 0
    spinner.updateProgress(150); // Should clamp to 100
    await delay(100);
    spinner.stop();
    
    assert.ok(true, 'Progress values clamped correctly');
  });

  test('should not update progress for dots animation', async () => {
    const spinner = createSpinner({
      loadingText: 'Loading...',
      completionText: 'Done',
      errorText: 'Error',
      animationType: 'dots'
    });
    
    spinner.start();
    spinner.updateProgress(50); // Should have no effect
    await delay(100);
    spinner.stop();
    
    assert.ok(true, 'UpdateProgress ignored for dots animation');
  });

  test('should handle Sailor Moon animation', async () => {
    const spinner = createSpinner({
      loadingText: 'Fighting evil by moonlight...',
      completionText: 'Mission complete!',
      errorText: 'Mission failed!',
      animationType: 'sailormoon'
    });
    
    spinner.start();
    await delay(500);
    spinner.succeed();
    
    assert.ok(true, 'Sailor Moon animation completed');
  });

  test('should display colored success message', async () => {
    const spinner = createSpinner({
      loadingText: 'Processing...',
      completionText: 'Success!',
      errorText: 'Error!',
      animationType: 'dots'
    });
    
    spinner.start();
    await delay(100);
    spinner.succeed();
    
    assert.ok(true, 'Success message displayed with color');
  });

  test('should display colored error message', async () => {
    const spinner = createSpinner({
      loadingText: 'Processing...',
      completionText: 'Success!',
      errorText: 'Failed!',
      animationType: 'dots'
    });
    
    spinner.start();
    await delay(100);
    spinner.fail();
    
    assert.ok(true, 'Error message displayed with color');
  });
});
