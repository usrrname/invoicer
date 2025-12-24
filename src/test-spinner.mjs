#!/usr/bin/env node

import { createSpinner } from './spinner.mjs';

console.log('Testing Spinner Utility\n');
console.log('======================\n');

// Test 1: Dots animation with success
console.log('Test 1: Dots animation with success');
const dotsSpinner = createSpinner({
  loadingText: 'Processing data...',
  completionText: 'Data processed successfully',
  errorText: 'Failed to process data',
  animationType: 'dots'
});

dotsSpinner.start();

setTimeout(() => {
  dotsSpinner.succeed();
  
  // Test 2: Dots animation with error
  setTimeout(() => {
    console.log('\nTest 2: Dots animation with error');
    const errorSpinner = createSpinner({
      loadingText: 'Attempting to connect...',
      completionText: 'Connected successfully',
      errorText: 'Connection failed',
      animationType: 'dots'
    });
    
    errorSpinner.start();
    
    setTimeout(() => {
      errorSpinner.fail();
      
      // Test 3: Progress bar animation
      setTimeout(() => {
        console.log('\nTest 3: Progress bar animation');
        const progressSpinner = createSpinner({
          loadingText: 'Uploading file...',
          completionText: 'Upload complete',
          errorText: 'Upload failed',
          animationType: 'progress'
        });
        
        progressSpinner.start();
        
        let currentProgress = 0;
        const progressInterval = setInterval(() => {
          currentProgress += 10;
          progressSpinner.updateProgress(currentProgress);
          
          if (currentProgress >= 100) {
            clearInterval(progressInterval);
            setTimeout(() => {
              progressSpinner.succeed();
              
              // Test 4: Manual stop
              setTimeout(() => {
                console.log('\nTest 4: Manual stop without completion message');
                const manualSpinner = createSpinner({
                  loadingText: 'Running task...',
                  completionText: 'Task completed',
                  errorText: 'Task failed',
                  animationType: 'dots'
                });
                
                manualSpinner.start();
                
                setTimeout(() => {
                  manualSpinner.stop();
                  console.log('Spinner stopped manually');
                  
                  console.log('\nAll tests completed!');
                }, 2000);
              }, 500);
            }, 500);
          }
        }, 300);
      }, 500);
    }, 2000);
  }, 500);
}, 3000);
