from flask import Flask, request, jsonify, render_template
from transformers import PegasusForConditionalGeneration, PegasusTokenizer
import google.generativeai as genai
import os
from dotenv import load_dotenv
import nltk
from nltk.tokenize import sent_tokenize
import logging
from typing import Dict, Any

load_dotenv()
nltk.download('punkt')

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Pegasus model
pegasus_model_name = 'google/pegasus-cnn_dailymail'
pegasus_tokenizer = PegasusTokenizer.from_pretrained(pegasus_model_name)
pegasus_model = PegasusForConditionalGeneration.from_pretrained(pegasus_model_name)

# Configure Gemini
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
gemini_model = genai.GenerativeModel('gemini-2.0-flash')

def generate_summary_with_reasoning(text: str, length: str = "medium", target_language: str = None) -> Dict[str, Any]:
    """Generate summary with chain-of-thought reasoning and optional translation."""
    try:
        # Step 1: Initial extractive summary with Pegasus
        inputs = pegasus_tokenizer([text], truncation=True, padding="longest", return_tensors="pt")
        
        # Adjust summary length based on user preference
        if length == "short":
            max_length = 64
            min_length = 30
        elif length == "long":
            max_length = 256
            min_length = 128
        else:  # medium
            max_length = 128
            min_length = 64
            
        summary_ids = pegasus_model.generate(
            **inputs,
            max_length=max_length,
            min_length=min_length,
            num_beams=4,
            early_stopping=True
        )
        pegasus_summary = pegasus_tokenizer.batch_decode(summary_ids, skip_special_tokens=True)[0]
        
        # Step 2: Chain-of-thought reasoning with Gemini
        prompt = f"""
        You are an advanced text summarization system. Follow this process:
        
        1. Analyze the following original text and initial summary:
        Original Text: {text[:5000]}... [truncated if too long]
        Initial Summary: {pegasus_summary}
        
        2. Identify the key themes, entities, and relationships in the original text.
        
        3. Evaluate if the initial summary:
           - Captures all critical information
           - Maintains coherence and flow
           - Preserves the original meaning
           - Matches the requested {'short' if length == 'short' else 'detailed'} format
        
        4. Provide your improved summary with reasoning:
        - First explain your thought process (chain of thought)
        - Then provide the final refined summary that:
          * Preserves all critical information
          * Is easy to understand
          * Maintains context from original
          * Is appropriately concise
        
        Your response format:
        [THOUGHT PROCESS]: <your reasoning>
        [FINAL SUMMARY]: <your refined summary>
        """
        
        response = gemini_model.generate_content(prompt)
        result = response.text
        
        # Parse the response
        if '[THOUGHT PROCESS]:' in result and '[FINAL SUMMARY]:' in result:
            thought = result.split('[THOUGHT PROCESS]:')[1].split('[FINAL SUMMARY]:')[0].strip()
            summary = result.split('[FINAL SUMMARY]:')[1].strip()
        else:
            thought = "The model provided a summary without explicit reasoning."
            summary = result
        
        # Step 3: Translation if requested
        translation = None
        if target_language and target_language != 'none':
            translation_prompt = f"""
            Translate the following summary to {target_language}. 
            Preserve the meaning, tone, and key information.
            
            Summary to translate: {summary}
            
            Provide only the translated text with no additional commentary.
            """
            
            translation_response = gemini_model.generate_content(translation_prompt)
            translation = translation_response.text
        
        return {
            'thought_process': thought,
            'summary': summary,
            'translation': translation,
            'status': 'success'
        }
        
    except Exception as e:
        logger.error(f"Error in summary generation: {str(e)}")
        raise

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/summarize', methods=['POST'])
def summarize():
    data = request.get_json()
    text = data.get('text', '')
    language = data.get('language', 'none')
    length = data.get('length', 'medium')
    
    if not text:
        return jsonify({'error': 'No text provided', 'status': 'error'})
    
    try:
        result = generate_summary_with_reasoning(text, length, language)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in summarize endpoint: {str(e)}")
        return jsonify({
            'error': str(e),
            'status': 'error'
        })

if __name__ == '__main__':
    app.run(debug=True)