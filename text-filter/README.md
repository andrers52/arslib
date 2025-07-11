# ToxicTextFilter

A utility for detecting and filtering toxic content in text using LLM (Large Language Model) services. The filter can identify hate speech, swearing, offensive language, and other toxic content, then replace it with polite alternatives while preserving the original meaning.

## Features

- **Content Filtering**: Replace toxic content with polite alternatives
- **Toxicity Detection**: Check if text contains toxic content
- **Toxicity Scoring**: Get a numerical score (0-1) for toxicity level
- **Batch Processing**: Filter multiple texts efficiently
- **Flexible Configuration**: Customize filtering behavior and LLM settings
- **Error Handling**: Graceful handling of LLM service failures

## Installation

The ToxicTextFilter is part of the arslib package. Make sure you have the required dependencies:

```bash
npm install @ollama/ollama  # For Ollama LLM service
# or
npm install @xenova/transformers  # For Transformers.js
```

## Quick Start

```javascript
const { ToxicTextFilter } = require('arslib');

// Create a filter instance
const filter = new ToxicTextFilter();

// Filter toxic content
const result = await filter.filterText('You are an idiot!');
console.log(result); // "You are not very intelligent!"

// Check for toxic content
const hasToxic = await filter.hasToxicContent('Hello, how are you?');
console.log(hasToxic); // false

// Get toxicity score
const score = await filter.getToxicityScore('I hate you');
console.log(score); // 0.7
```

## API Reference

### Constructor

```javascript
new ToxicTextFilter(options)
```

**Options:**
- `llmService` (LLMService): Custom LLM service instance
- `temperature` (number): LLM temperature (0.1 by default)
- `maxTokens` (number): Maximum tokens for response (1000 by default)
- `timeout` (number): Request timeout in ms (30000 by default)
- `maxRetries` (number): Maximum retry attempts (3 by default)

### Methods

#### `filterText(text, options)`

Filters toxic content from a single text string.

**Parameters:**
- `text` (string): The text to filter
- `options` (object, optional):
  - `strict` (boolean): Use strict filtering mode
  - `customPrompt` (string): Custom prompt for filtering

**Returns:** Promise<string> - The filtered text

**Example:**
```javascript
const filtered = await filter.filterText('You are stupid!');
// Returns: "You are not very intelligent!"

// Using strict mode
const strictFiltered = await filter.filterText('I think you might be wrong', { strict: true });
// More aggressive filtering

// Using custom prompt
const customFiltered = await filter.filterText('Test', { 
    customPrompt: 'Filter this text: {text}' 
});
```

#### `filterTexts(texts, options)`

Filters multiple texts in batch.

**Parameters:**
- `texts` (string[]): Array of texts to filter
- `options` (object, optional): Same as filterText

**Returns:** Promise<string[]> - Array of filtered texts

**Example:**
```javascript
const texts = ['Hello!', 'You are an idiot!', 'Have a great day!'];
const filtered = await filter.filterTexts(texts);
// Returns: ['Hello!', 'You are not very intelligent!', 'Have a great day!']
```

#### `hasToxicContent(text)`

Checks if text contains toxic content without filtering it.

**Parameters:**
- `text` (string): The text to check

**Returns:** Promise<boolean> - True if toxic content is detected

**Example:**
```javascript
const hasToxic = await filter.hasToxicContent('You are an idiot!');
console.log(hasToxic); // true
```

#### `getToxicityScore(text)`

Gets a numerical toxicity score (0-1) for the text.

**Parameters:**
- `text` (string): The text to analyze

**Returns:** Promise<number> - Toxicity score between 0 and 1

**Example:**
```javascript
const score = await filter.getToxicityScore('I hate you');
console.log(score); // 0.7

const cleanScore = await filter.getToxicityScore('Hello, how are you?');
console.log(cleanScore); // 0.0
```

#### `setLLMService(llmService)`

Sets a custom LLM service instance.

**Parameters:**
- `llmService` (LLMService): LLM service instance with a `run` method

**Example:**
```javascript
const { TransformersLLMService } = require('arslib');
const customLLM = new TransformersLLMService({ modelPath: '/path/to/model' });
filter.setLLMService(customLLM);
```

#### `updateOptions(options)`

Updates filtering options.

**Parameters:**
- `options` (object): Options to update (temperature, maxTokens, timeout, maxRetries)

**Example:**
```javascript
filter.updateOptions({
    temperature: 0.5,
    maxTokens: 500,
    timeout: 15000
});
```

## Configuration

### Using Ollama

```javascript
const { ToxicTextFilter } = require('arslib');

// Set environment variable
process.env.LLM_SERVICE_URL = 'http://localhost:11434';

const filter = new ToxicTextFilter();
```

### Using Transformers.js

```javascript
const { ToxicTextFilter, TransformersLLMService } = require('arslib');

// Set environment variable
process.env.TRANSFORMERS_MODEL_PATH = '/path/to/your/model';

const llmService = new TransformersLLMService();
const filter = new ToxicTextFilter({ llmService });
```

### Using Custom LLM Service

```javascript
const { ToxicTextFilter } = require('arslib');

// Create custom LLM service
const customLLM = {
    run: async (params) => {
        // Your custom LLM implementation
        return 'Filtered response';
    }
};

const filter = new ToxicTextFilter({ llmService: customLLM });
```

## Filtering Modes

### Default Mode
Balanced filtering that replaces clearly toxic content while preserving the original meaning and tone.

### Strict Mode
More aggressive filtering that replaces any potentially offensive content with very polite alternatives.

```javascript
// Default mode
const normal = await filter.filterText('You are wrong about that');

// Strict mode
const strict = await filter.filterText('You are wrong about that', { strict: true });
```

## Error Handling

The filter handles errors gracefully:

- **LLM Service Errors**: Individual text failures in batch processing are logged but don't stop the process
- **Invalid Input**: Non-string inputs are rejected with descriptive errors
- **Network Issues**: Timeouts and connection errors are handled with retries
- **Default to Safe**: When detection fails, the filter defaults to considering content as safe

```javascript
try {
    const result = await filter.filterText('Test message');
} catch (error) {
    console.error('Filtering failed:', error.message);
    // Handle error appropriately
}
```

## Performance Considerations

- **Batch Processing**: Use `filterTexts()` for multiple texts to reduce overhead
- **Caching**: The underlying LLMService supports caching for repeated requests
- **Timeout**: Adjust timeout based on your LLM service performance
- **Temperature**: Lower temperature (0.1) provides more consistent results

## Examples

### Basic Usage

```javascript
const { ToxicTextFilter } = require('arslib');

async function filterUserInput(userText) {
    const filter = new ToxicTextFilter();
    
    // Check if content is toxic
    const isToxic = await filter.hasToxicContent(userText);
    
    if (isToxic) {
        // Filter the content
        const filtered = await filter.filterText(userText);
        return {
            original: userText,
            filtered: filtered,
            wasFiltered: true
        };
    }
    
    return {
        original: userText,
        filtered: userText,
        wasFiltered: false
    };
}
```

### Content Moderation System

```javascript
const { ToxicTextFilter } = require('arslib');

class ContentModerator {
    constructor() {
        this.filter = new ToxicTextFilter();
        this.threshold = 0.5; // Toxicity threshold
    }
    
    async moderateContent(text) {
        const score = await this.filter.getToxicityScore(text);
        
        if (score > this.threshold) {
            const filtered = await this.filter.filterText(text);
            return {
                action: 'filter',
                original: text,
                filtered: filtered,
                score: score
            };
        }
        
        return {
            action: 'allow',
            text: text,
            score: score
        };
    }
}
```

### Batch Processing for Large Datasets

```javascript
const { ToxicTextFilter } = require('arslib');

async function processLargeDataset(texts) {
    const filter = new ToxicTextFilter();
    const batchSize = 10;
    const results = [];
    
    for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        const filteredBatch = await filter.filterTexts(batch);
        results.push(...filteredBatch);
        
        // Add delay to avoid overwhelming the LLM service
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
}
```

## Testing

Run the tests:

```bash
# Run all text filter tests
npm test text-filter

# Run specific test file
npm test toxic-text-filter.test.js

# Run with verbose output
npm run test:text-filter:verbose
```

## Demo

Run the demo script to see the filter in action:

```bash
# Run demo with test LLM
node text-filter/demo.js

# Run demo with real LLM (if configured)
node text-filter/demo.js --real-llm

# Show help
node text-filter/demo.js --help
```

## Contributing

When contributing to the ToxicTextFilter:

1. Add tests for new features
2. Update documentation for API changes
3. Follow the existing code style
4. Test with both mock and real LLM services

## License

This module is part of arslib and follows the same license terms. 