<img width="1918" height="870" alt="image" src="https://github.com/user-attachments/assets/8272fc7d-cf1f-4129-bed9-e95d02dbaaa6" />
<img width="1918" height="865" alt="image" src="https://github.com/user-attachments/assets/367e30c9-7a4d-407f-a115-28e0b73f0de0" />
<img width="1918" height="862" alt="image" src="https://github.com/user-attachments/assets/26ec081e-ab74-4ce6-af56-58f31dccbe01" />
<img width="1900" height="858" alt="image" src="https://github.com/user-attachments/assets/d2552714-5d04-43b4-8199-0902d3ebf1c9" />


📰 Text Summarization using Pegasus, Transformers & Flask

This project implements an Extractive + Abstractive Text Summarization System powered by Hugging Face Transformers, Pegasus, and Google Generative AI.
It supports training/evaluation on the CNN/DailyMail dataset, and provides a Flask API + Web Interface for generating summaries.

✨ Features

🧠 Abstractive Summarization with Pegasus / GPT models

📊 ROUGE Evaluation using HuggingFace evaluate

🌐 Flask API for backend integration

💻 Frontend (HTML, CSS, JS) for user interaction

🔑 Environment-based API key management (.env)

📚 Support for multiple datasets (CNN/DailyMail, custom text, news articles)

📰 News scraping integration with newspaper3k and newsapi-python

📂 Project Structure
├── app.py                 # Flask app entry point
├── train.py               # Model training & evaluation
├── requirements.txt       # Dependencies
├── .env                   # API Keys (ignored in Git)
├── templates/             # HTML frontend
│   └── index.html
├── static/                # CSS, JS, assets
├── models/                # Saved models & checkpoints
├── data/                  # Datasets (ignored in Git)
└── README.md

⚙️ Installation & Setup
1. Clone Repository
git clone https://github.com/YourUsername/YourRepoName.git
cd YourRepoName

2. Create Virtual Environment
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows

3. Install Dependencies
pip install -r requirements.txt

4. Setup Environment Variables

Create a .env file in the project root:

API_KEY=your_google_genai_key_here

5. Run Flask App
python app.py


Then open: http://127.0.0.1:5000

📊 Training (Pegasus on CNN/DailyMail)

To train your own summarization model:

python train.py


This will:

Load dataset (datasets)

Train Pegasus with Hugging Face transformers

Evaluate using ROUGE metrics

📡 API Endpoints
POST /summarize

Request:

{
  "text": "Your long article or document here..."
}


Response:

{
  "summary": "Generated concise summary."
}

🛠 Tech Stack

Backend: Flask, Python

NLP Models: Pegasus, Hugging Face Transformers, Google Generative AI

Frontend: HTML, CSS, JavaScript

Evaluation: ROUGE (HuggingFace evaluate)

Data Sources: CNN/DailyMail, NewsAPI, Newspaper3k

📈 Example Output

Input:
"The quick brown fox jumps over the lazy dog. This sentence is often used to test typing or fonts. It contains every letter in the English alphabet."

Summary:
"A sentence containing all English letters is used for typing and font tests."

🚀 Future Improvements

✅ Add multilingual summarization

✅ Deploy on Render/Heroku/AWS

✅ Add user authentication for API usage

✅ Store summaries in database

🤝 Contributing

Pull requests are welcome! For major changes, open an issue first to discuss what you’d like to change.

📜 License

This project is licensed under the MIT License.
