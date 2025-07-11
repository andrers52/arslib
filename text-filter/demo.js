#!/usr/bin/env node

/**
 * Demo script for ToxicTextFilter
 * 
 * This script demonstrates the various features of the ToxicTextFilter utility.
 * Run with: node demo.js
 */

import { ToxicTextFilter } from './toxic-text-filter.js';
import { createTestLLM } from '../llm/llm-service.js';

async function runDemo() {
    console.log('🚀 ToxicTextFilter Demo\n');

    // Create a test LLM service for demo purposes
    const testLLM = createTestLLM();
    const filter = new ToxicTextFilter({ llmService: testLLM });

    // Test cases
    const testCases = [
        {
            text: 'Hello, how are you today?',
            description: 'Clean, friendly message'
        },
        {
            text: 'You are an idiot and I hate you!',
            description: 'Toxic content with insults and hate speech'
        },
        {
            text: 'This is a great day to learn something new.',
            description: 'Positive, educational message'
        },
        {
            text: 'I think you\'re wrong about that, but let\'s discuss it.',
            description: 'Disagreement expressed politely'
        },
        {
            text: 'Shut up and listen to me!',
            description: 'Aggressive, commanding tone'
        }
    ];

    console.log('📝 Testing text filtering:\n');

    for (const testCase of testCases) {
        console.log(`Original: "${testCase.text}"`);
        console.log(`Description: ${testCase.description}`);
        
        try {
            // Check for toxic content
            const hasToxic = await filter.hasToxicContent(testCase.text);
            console.log(`Contains toxic content: ${hasToxic ? 'YES' : 'NO'}`);

            // Get toxicity score
            const score = await filter.getToxicityScore(testCase.text);
            console.log(`Toxicity score: ${score.toFixed(2)}`);

            // Filter the text
            const filtered = await filter.filterText(testCase.text);
            console.log(`Filtered: "${filtered}"`);

            // Show if text was changed
            const changed = testCase.text !== filtered;
            console.log(`Text changed: ${changed ? 'YES' : 'NO'}`);
            
        } catch (error) {
            console.log(`Error: ${error.message}`);
        }
        
        console.log('─'.repeat(60));
    }

    // Test batch processing
    console.log('\n📦 Testing batch processing:\n');
    
    const batchTexts = [
        'Hello there!',
        'You\'re stupid!',
        'Have a wonderful day!',
        'I hate this!'
    ];

    console.log('Original texts:');
    batchTexts.forEach((text, i) => console.log(`${i + 1}. "${text}"`));

    try {
        const filteredBatch = await filter.filterTexts(batchTexts);
        
        console.log('\nFiltered texts:');
        filteredBatch.forEach((text, i) => console.log(`${i + 1}. "${text}"`));
    } catch (error) {
        console.log(`Batch processing error: ${error.message}`);
    }

    // Test strict mode
    console.log('\n🔒 Testing strict mode:\n');
    
    const strictTest = 'I think you might be wrong about that.';
    console.log(`Original: "${strictTest}"`);
    
    try {
        const normalFiltered = await filter.filterText(strictTest);
        const strictFiltered = await filter.filterText(strictTest, { strict: true });
        
        console.log(`Normal mode: "${normalFiltered}"`);
        console.log(`Strict mode: "${strictFiltered}"`);
    } catch (error) {
        console.log(`Strict mode error: ${error.message}`);
    }

    // Performance test
    console.log('\n⚡ Performance test:\n');
    
    const performanceText = 'This is a test message for performance evaluation.';
    const iterations = 5;
    
    console.log(`Running ${iterations} iterations...`);
    
    const startTime = Date.now();
    
    for (let i = 0; i < iterations; i++) {
        await filter.filterText(performanceText);
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / iterations;
    
    console.log(`Total time: ${totalTime}ms`);
    console.log(`Average time per filter: ${avgTime.toFixed(2)}ms`);

    console.log('\n✅ Demo completed!');
}

// Handle command line arguments
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
ToxicTextFilter Demo

Usage: node demo.js [options]

Options:
  --help, -h     Show this help message
  --real-llm     Use real LLM service (if configured)
  --verbose      Show detailed output

Examples:
  node demo.js                    # Run with test LLM
  node demo.js --real-llm         # Run with real LLM service
  node demo.js --verbose          # Show detailed output
        `);
        process.exit(0);
    }

    if (args.includes('--real-llm')) {
        console.log('⚠️  Using real LLM service (make sure it\'s configured)');
        // The demo will use the default LLMService which will try to use real services
    }

    runDemo().catch(error => {
        console.error('❌ Demo failed:', error.message);
        process.exit(1);
    });
}

export { runDemo }; 