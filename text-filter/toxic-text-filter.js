import { LLMService } from '../llm/llm-service.js';

/**
 * ToxicTextFilter - A utility to filter and replace toxic content in text
 * 
 * This utility uses LLMService to detect hate speech, swearing, and other toxic language,
 * then replaces it with polite alternatives while preserving the original meaning.
 */
class ToxicTextFilter {
    constructor(options = {}) {
        this.llmService = options.llmService || new LLMService();
        this.maxRetries = options.maxRetries || 3;
        this.timeout = options.timeout || 30000;
        this.temperature = options.temperature || 0.1; // Low temperature for consistent results
        this.maxTokens = options.maxTokens || 1000;
        
        // Default prompt for toxic content detection and replacement
        this.defaultPrompt = `You are a text filter. Your task is to replace toxic words with polite alternatives.

IMPORTANT: Return ONLY the filtered text, nothing else.

Examples:
- "You are an idiot" → "You are not very intelligent"
- "I hate you" → "I strongly dislike you"
- "Shut up" → "Please be quiet"
- "Hello, how are you?" → "Hello, how are you?"

Text to filter: "{text}"

Filtered result:`;

        // Alternative prompt for more aggressive filtering
        this.strictPrompt = `You are a content filter that removes ALL potentially offensive content. Your task is to:

1. Identify ANY content that could be considered offensive, inappropriate, or toxic
2. Replace offensive content with very polite, neutral alternatives
3. Be conservative - when in doubt, replace the content
4. Maintain the overall meaning and flow of the text

Rules:
- Replace any swearing, hate speech, or offensive language
- Use very polite, neutral language for replacements
- Preserve the core meaning of the message
- If the entire text is offensive, provide a polite summary

Input text: "{text}"

Return only the filtered text.`;
    }

    /**
     * Filter toxic content from text
     * @param {string} text - The text to filter
     * @param {Object} options - Filtering options
     * @param {boolean} options.strict - Use strict filtering mode
     * @param {string} options.customPrompt - Custom prompt for filtering
     * @returns {Promise<string>} The filtered text
     */
    async filterText(text, options = {}) {
        if (typeof text !== 'string') {
            throw new Error('Text must be a non-empty string');
        }
        if (text === '') {
            return '';
        }

        const prompt = options.customPrompt || 
                      (options.strict ? this.strictPrompt : this.defaultPrompt);
        
        const formattedPrompt = prompt.replace('{text}', text);

        try {
            const response = await this.llmService.generate(formattedPrompt);
            const trimmedResponse = response.trim();
            
            // If response is empty or just whitespace, return original text
            if (!trimmedResponse || trimmedResponse === '') {
                return text;
            }
            
            // If the response contains the full prompt, try to extract just the filtered text
            if (trimmedResponse.includes('Text: "') && trimmedResponse.includes('Filtered text:')) {
                const parts = trimmedResponse.split('Filtered text:');
                if (parts.length > 1) {
                    const extracted = parts[1].trim();
                    return extracted || text; // Return original if extracted is empty
                }
            }
            
            // Handle strict prompt format
            if (trimmedResponse.includes('Input text: "') && trimmedResponse.includes('Return only the filtered text.')) {
                // For strict mode, the response might be just the filtered text
                // If it contains the original prompt, try to extract
                if (trimmedResponse.includes(formattedPrompt)) {
                    return text; // Return original if response is just the prompt
                }
            }
            
            // If the response is just the prompt without any filtered text, return the original
            if ((trimmedResponse.includes('Text: "') || trimmedResponse.includes('Input text: "')) && !trimmedResponse.includes('→')) {
                return text;
            }
            
            // If response looks like it might be the original prompt repeated, return original
            if (trimmedResponse.includes(formattedPrompt) || trimmedResponse === formattedPrompt) {
                return text;
            }
            
            // For real LLMs, if the response is very short and doesn't seem like filtered text,
            // it might be an error or incomplete response - return original
            if (trimmedResponse.length < 3 && !trimmedResponse.includes(text)) {
                return text;
            }
            
            return trimmedResponse;
        } catch (error) {
            throw new Error(`Failed to filter text: ${error.message}`);
        }
    }

    /**
     * Filter multiple texts in batch
     * @param {string[]} texts - Array of texts to filter
     * @param {Object} options - Filtering options
     * @returns {Promise<string[]>} Array of filtered texts
     */
    async filterTexts(texts, options = {}) {
        if (!Array.isArray(texts)) {
            throw new Error('Texts must be an array');
        }

        const results = [];
        for (let i = 0; i < texts.length; i++) {
            try {
                const filtered = await this.filterText(texts[i], options);
                results.push(filtered);
            } catch (error) {
                // If individual text fails, keep original and log error
                console.warn(`Failed to filter text at index ${i}:`, error.message);
                results.push(texts[i]);
            }
        }

        return results;
    }

    /**
     * Check if text contains toxic content without filtering it
     * @param {string} text - The text to check
     * @returns {Promise<boolean>} True if toxic content is detected
     */
    async hasToxicContent(text, options = {}) {
        if (!text || typeof text !== 'string') {
            return false;
        }

        const detectionPrompt = `Analyze the following text and determine if it contains any toxic content (hate speech, swearing, offensive language, etc.).

Text: "${text}"

Respond with ONLY "YES" if toxic content is found, or "NO" if the text is clean.`;

        try {
            const response = await this.llmService.generate(detectionPrompt);

            return response.trim().toUpperCase() === 'YES';
        } catch (error) {
            console.warn('Failed to detect toxic content:', error.message);
            return false; // Default to safe
        }
    }

    /**
     * Get toxicity score for text (0-1, where 1 is most toxic)
     * @param {string} text - The text to analyze
     * @returns {Promise<number>} Toxicity score between 0 and 1
     */
    async getToxicityScore(text) {
        if (!text || typeof text !== 'string') {
            return 0;
        }

        const scorePrompt = `Analyze the toxicity level of the following text. Consider factors like:
- Hate speech or discriminatory language
- Profanity or offensive words
- Aggressive or threatening tone
- Inappropriate content

Text: "${text}"

Respond with ONLY a number between 0 and 1, where:
0 = Completely clean and appropriate
1 = Extremely toxic and offensive

Examples:
- "Hello, how are you?" → 0
- "I hate you" → 0.7
- "You're an idiot" → 0.6
- "Have a great day!" → 0`;

        try {
            const response = await this.llmService.generate(scorePrompt);

            const score = parseFloat(response.trim());
            return isNaN(score) ? 0 : Math.max(0, Math.min(1, score));
        } catch (error) {
            console.warn('Failed to get toxicity score:', error.message);
            return 0; // Default to safe
        }
    }

    /**
     * Set a custom LLMService instance
     * @param {LLMService} llmService - The LLMService instance to use
     */
    setLLMService(llmService) {
        if (!llmService || typeof llmService.generate !== 'function') {
            throw new Error('LLMService instance must have a generate method');
        }
        this.llmService = llmService;
    }

    /**
     * Update filtering options
     * @param {Object} options - New options
     */
    updateOptions(options) {
        if (options.temperature !== undefined) {
            this.temperature = options.temperature;
        }
        if (options.maxTokens !== undefined) {
            this.maxTokens = options.maxTokens;
        }
        if (options.timeout !== undefined) {
            this.timeout = options.timeout;
        }
        if (options.maxRetries !== undefined) {
            this.maxRetries = options.maxRetries;
        }
    }
}

export { ToxicTextFilter }; 