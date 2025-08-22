# train.py
import logging
import os
import sys
import subprocess
import torch
import nltk
import numpy as np
from datasets import load_dataset
from transformers import (
    PegasusForConditionalGeneration,
    PegasusTokenizer,
    Seq2SeqTrainer,
    Seq2SeqTrainingArguments,
    DataCollatorForSeq2Seq
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Auto-install accelerate if missing or outdated
try:
    import accelerate
except ImportError:
    logger.warning("accelerate not found, installing via pip...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "accelerate>=0.26.0"])

# Ensure NLTK sentence tokenizer is available
try:
    nltk.data.find("tokenizers/punkt")
except LookupError:
    nltk.download("punkt")


def main():
    # Detect device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"Using device: {device}")

    # Configuration
    CONFIG = {
        "train_samples": 500,
        "val_samples": 50,
        "num_epochs": 1,
        "batch_size": 2,
        "max_input_len": 512,
        "max_target_len": 128,
        "model_name": "google/pegasus-cnn_dailymail",
        "output_dir": "./pegasus_output_vs_code"
    }

    # Load dataset
    logger.info("Loading CNN/DailyMail dataset...")
    dataset = load_dataset("cnn_dailymail", "default")
    train_data = dataset["train"].select(range(CONFIG["train_samples"]))
    val_data = dataset["validation"].select(range(CONFIG["val_samples"]))

    # Load tokenizer and model
    logger.info("Loading model and tokenizer...")
    tokenizer = PegasusTokenizer.from_pretrained(CONFIG["model_name"])
    model = PegasusForConditionalGeneration.from_pretrained(CONFIG["model_name"])
    model.to(device)

    # Preprocessing function
    def process_examples(examples):
        inputs = tokenizer(
            [text.strip() for text in examples["article"]],
            max_length=CONFIG["max_input_len"],
            truncation=True,
            padding="max_length"
        )
        targets = tokenizer(
            text_target=[text.strip() for text in examples["highlights"]],
            max_length=CONFIG["max_target_len"],
            truncation=True,
            padding="max_length"
        )
        inputs["labels"] = targets["input_ids"]
        return inputs

    # Tokenize datasets
    logger.info("Tokenizing dataset...")
    train_dataset = train_data.map(
        process_examples,
        batched=True,
        remove_columns=["article", "highlights", "id"]
    )
    val_dataset = val_data.map(
        process_examples,
        batched=True,
        remove_columns=["article", "highlights", "id"]
    )

    # Data collator
    data_collator = DataCollatorForSeq2Seq(tokenizer, model=model)

    # Training arguments
    training_args = Seq2SeqTrainingArguments(
        output_dir=CONFIG["output_dir"],
        per_device_train_batch_size=CONFIG["batch_size"],
        learning_rate=3e-5,
        num_train_epochs=CONFIG["num_epochs"],
        logging_dir=os.path.join(CONFIG["output_dir"], "logs"),
        logging_steps=10,
        save_steps=100,
        save_total_limit=2,
        do_train=True,
        fp16=torch.cuda.is_available(),
        report_to="none"
    )

    # Initialize Trainer
    trainer = Seq2SeqTrainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        data_collator=data_collator,
        tokenizer=tokenizer
    )

    # Start training
    logger.info("Starting training...")
    train_result = trainer.train()
    trainer.save_model(os.path.join(CONFIG["output_dir"], "final_model"))
    logger.info("Training completed.")
    logger.info(f"Metrics: {train_result.metrics}")


if __name__ == "__main__":
    main()
