document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const summarizeBtn = document.getElementById('summarizeBtn');
    const inputText = document.getElementById('inputText');
    const charCount = document.getElementById('charCount');
    const sampleBtn = document.getElementById('sampleBtn');
    const clearBtn = document.getElementById('clearBtn');
    const languageSelect = document.getElementById('language');
    const summaryLength = document.getElementById('summaryLength');
    
    // Output elements
    const summaryOutput = document.getElementById('summaryOutput');
    const reasoningOutput = document.getElementById('reasoningOutput');
    const translationOutput = document.getElementById('translationOutput');
    const analysisOutput = document.getElementById('analysisOutput');
    
    // Analysis metrics
    const wordCountEl = document.getElementById('wordCount');
    const sentenceCountEl = document.getElementById('sentenceCount');
    const readabilityScoreEl = document.getElementById('readabilityScore');
    const keyTopicsEl = document.getElementById('keyTopics');
    
    // Loading indicator
    const loadingIndicator = document.getElementById('loadingIndicator');
    const progressBar = document.getElementById('progressBar');
    
    // Tab management
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Sample text
    const sampleTexts = [
        "The COVID-19 pandemic has dramatically changed how people work around the world. Many companies have shifted to remote work arrangements, with employees working from home instead of traditional offices. This shift has led to both challenges and opportunities. On one hand, workers enjoy greater flexibility and no commute times. On the other hand, some struggle with isolation and maintaining work-life boundaries. Experts predict that hybrid work models combining office and remote work will become the norm post-pandemic. Companies are investing in digital collaboration tools and rethinking office spaces to accommodate this new reality.",
        "Artificial intelligence is transforming industries across the globe. From healthcare to finance, AI applications are improving efficiency and enabling new capabilities. In medicine, AI helps diagnose diseases from medical images with accuracy rivaling human experts. Financial institutions use AI to detect fraudulent transactions and assess credit risk. However, the rapid advancement of AI also raises ethical concerns about job displacement, algorithmic bias, and privacy. Governments and organizations are working to establish regulations and ethical frameworks to guide AI development while fostering innovation.",
        "Renewable energy sources like solar and wind power are becoming increasingly important in the global energy mix. As concerns about climate change grow, many countries are setting ambitious targets to reduce greenhouse gas emissions. Solar panel costs have dropped dramatically in the past decade, making solar energy competitive with fossil fuels in many regions. Wind farms, both onshore and offshore, are expanding capacity worldwide. Energy storage technologies are also advancing to address the intermittent nature of renewable sources. The transition to clean energy is creating new jobs while posing challenges for traditional energy sectors."
    ];
    
    // Event Listeners
    inputText.addEventListener('input', updateCharCount);
    sampleBtn.addEventListener('click', loadSampleText);
    clearBtn.addEventListener('click', clearText);
    summarizeBtn.addEventListener('click', generateSummary);
    
    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Functions
    function updateCharCount() {
        const count = inputText.value.length;
        charCount.textContent = `${count} characters`;
        
        // Update analysis metrics in real-time
        if (count > 0) {
            updateTextAnalysis(inputText.value);
        } else {
            resetAnalysisMetrics();
        }
    }
    
    function loadSampleText() {
        const randomIndex = Math.floor(Math.random() * sampleTexts.length);
        inputText.value = sampleTexts[randomIndex];
        updateCharCount();
    }
    
    function clearText() {
        inputText.value = '';
        updateCharCount();
        resetAnalysisMetrics();
    }
    
    function switchTab(tabId) {
        // Update active tab button
        tabBtns.forEach(b => b.classList.remove('active'));
        document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
        
        // Update active tab content
        tabContents.forEach(content => content.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
    }
    
    function updateTextAnalysis(text) {
        // Word count
        const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        wordCountEl.textContent = words;
        
        // Sentence count
        const sentences = text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
        sentenceCountEl.textContent = sentences;
        
        // Simple readability score (Flesch-Kincaid approximation)
        const readability = calculateReadability(text);
        readabilityScoreEl.textContent = readability;
        
        // Estimate key topics (simplified)
        const topics = estimateKeyTopics(text);
        keyTopicsEl.textContent = topics.length;
    }
    
    function resetAnalysisMetrics() {
        wordCountEl.textContent = '0';
        sentenceCountEl.textContent = '0';
        readabilityScoreEl.textContent = '0';
        keyTopicsEl.textContent = '0';
    }
    
    function calculateReadability(text) {
        if (text.trim() === '') return 0;
        
        const words = text.trim().split(/\s+/);
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const syllables = estimateSyllables(words.join(' '));
        
        if (words.length === 0 || sentences.length === 0) return 0;
        
        // Flesch Reading Ease score
        const score = 206.835 - (1.015 * (words.length / sentences.length)) - (84.6 * (syllables / words.length));
        return Math.min(100, Math.max(0, Math.round(score)));
    }
    
    function estimateSyllables(text) {
        // Simplified syllable estimation
        const words = text.toLowerCase().split(/\s+/);
        let count = 0;
        
        words.forEach(word => {
            // Basic syllable counting rules
            const vowels = word.match(/[aeiouy]+/g);
            if (!vowels) {
                count += 1;
                return;
            }
            
            let syllableCount = vowels.length;
            
            // Subtract silent vowels
            if (word.endsWith('e') && !word.endsWith('le')) {
                syllableCount--;
            }
            
            // Ensure at least one syllable per word
            count += Math.max(1, syllableCount);
        });
        
        return count;
    }
    
    function estimateKeyTopics(text) {
        // Simplified topic extraction (in a real app, use NLP libraries)
        const commonWords = new Set(['the', 'and', 'of', 'to', 'in', 'is', 'it', 'that', 'for', 'with', 'on', 'as', 'at', 'by']);
        const words = text.toLowerCase().split(/\s+/);
        const wordFrequency = {};
        
        words.forEach(word => {
            const cleanWord = word.replace(/[^a-z]/g, '');
            if (cleanWord.length > 3 && !commonWords.has(cleanWord)) {
                wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1;
            }
        });
        
        // Get top 5 words by frequency
        return Object.entries(wordFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(entry => entry[0]);
    }
    
    async function generateSummary() {
        const text = inputText.value.trim();
        const targetLanguage = languageSelect.value;
        const length = summaryLength.value;
        
        if (!text) {
            alert('Please enter some text to summarize');
            return;
        }
        
        // Show loading indicator
        showLoading(true);
        
        try {
            // Simulate progress (in real app, you'd update based on actual progress)
            simulateProgress();
            
            // Call backend API
            const response = await fetch('/summarize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    text,
                    language: targetLanguage,
                    length 
                })
            });
            
            const data = await response.json();
            
            if (data.status === 'success') {
                // Display results
                displayResults(data);
                
                // If translation was requested
                if (targetLanguage !== 'none' && data.translation) {
                    displayTranslation(data.translation);
                }
            } else {
                throw new Error(data.error || 'Unknown error occurred');
            }
        } catch (error) {
            showError(error);
        } finally {
            showLoading(false);
        }
    }
    
    function simulateProgress() {
        let progress = 0;
        const interval = setInterval(() => {
            if (progress >= 90) {
                clearInterval(interval);
                return;
            }
            progress += Math.random() * 10;
            progressBar.style.width = `${Math.min(progress, 90)}%`;
        }, 300);
    }
    
    function showLoading(show) {
        if (show) {
            loadingIndicator.style.display = 'block';
            document.querySelectorAll('.output-placeholder').forEach(el => el.style.display = 'flex');
            document.querySelectorAll('.output-text').forEach(el => el.style.display = 'none');
            progressBar.style.width = '0%';
        } else {
            loadingIndicator.style.display = 'none';
            progressBar.style.width = '100%';
            setTimeout(() => progressBar.style.width = '0%', 500);
        }
    }
    
    function displayResults(data) {
        // Display summary and reasoning
        summaryOutput.textContent = data.summary;
        reasoningOutput.textContent = data.thought_process;
        
        document.querySelectorAll('.output-placeholder').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.output-text').forEach(el => el.style.display = 'block');
        
        // Switch to summary tab
        switchTab('summary');
        
        // Update analysis for the summary
        updateTextAnalysis(data.summary);
    }
    
    function displayTranslation(translation) {
        translationOutput.textContent = translation;
        document.querySelector('#translation .output-placeholder').style.display = 'none';
        translationOutput.style.display = 'block';
    }
    
    function showError(error) {
        alert('Error generating summary: ' + error.message);
        console.error(error);
        
        // Show error in reasoning tab
        reasoningOutput.textContent = `Error: ${error.message}\n\nPlease try again with different text or check your network connection.`;
        document.querySelector('#reasoning .output-placeholder').style.display = 'none';
        reasoningOutput.style.display = 'block';
        switchTab('reasoning');
    }
});