from unsloth import FastLanguageModel
from trl import SFTTrainer
from transformers import TrainingArguments
from datasets import load_dataset
import torch

# ======================================================
# Config
# ======================================================

MAX_SEQ_LENGTH = 2048

MODEL_NAME = "unsloth/gemma-3-4b-it"
# Switch to Gemma 3 if Unsloth does not support Gemma 4:
# MODEL_NAME = "google/gemma-4-e4b-it"

OUTPUT_DIR = "../models/eduweave-gemma"

# ======================================================
# Load Gemma Model
# ======================================================

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name=MODEL_NAME,
    max_seq_length=MAX_SEQ_LENGTH,
    load_in_4bit=True,
    dtype=None
)

# ======================================================
# LoRA Setup
# ======================================================

model = FastLanguageModel.get_peft_model(
    model,
    r=16,
    target_modules=[
        "q_proj",
        "k_proj",
        "v_proj",
        "o_proj",
        "gate_proj",
        "up_proj",
        "down_proj"
    ],
    lora_alpha=16,
    lora_dropout=0,
    bias="none",
    use_gradient_checkpointing="unsloth",
    random_state=3407
)

# ======================================================
# Load Dataset
# ======================================================

dataset = load_dataset(
    "json",
    data_files="../datasets/kcse_dataset.json",
    split="train"
)

# ======================================================
# Format Dataset
# ======================================================

def format_prompt(example):

    instruction = example.get("instruction", "")
    input_text = example.get("input", "")
    output = example.get("output", "")

    text = f"""
### Instruction:
{instruction}

### Input:
{input_text}

### Response:
{output}
"""

    return {"text": text}


dataset = dataset.map(format_prompt)

# ======================================================
# Enable Training Mode
# ======================================================

model = FastLanguageModel.for_training(model)

# ======================================================
# Trainer
# ======================================================

trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=dataset,

    dataset_text_field="text",

    max_seq_length=MAX_SEQ_LENGTH,

    packing=False,

    args=TrainingArguments(
        output_dir="../outputs",

        per_device_train_batch_size=1,
        gradient_accumulation_steps=4,

        warmup_steps=5,

        num_train_epochs=2,

        learning_rate=2e-4,

        logging_steps=1,

        optim="adamw_8bit",

        weight_decay=0.01,

        lr_scheduler_type="linear",

        fp16=not torch.cuda.is_bf16_supported(),
        bf16=torch.cuda.is_bf16_supported(),

        save_strategy="epoch",

        seed=3407
    )
)

# ======================================================
# Train
# ======================================================

print("🚀 Starting training...")

trainer.train()

print("✅ Training complete!")

# ======================================================
# Save Model
# ======================================================

model.save_pretrained(OUTPUT_DIR)

tokenizer.save_pretrained(OUTPUT_DIR)

print(f"✅ Model saved to {OUTPUT_DIR}")