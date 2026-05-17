from unsloth import FastLanguageModel
from trl import SFTTrainer
from transformers import TrainingArguments
from datasets import load_dataset

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="google/gemma-4-e4b-it",
    max_seq_length=2048,
    load_in_4bit=True
)

dataset = load_dataset(
    "json",
    data_files="kcse_dataset.json",
    split="train"
)

model = FastLanguageModel.get_peft_model(
    model,
    r=16,
    target_modules=[
        "q_proj",
        "k_proj",
        "v_proj",
        "o_proj"
    ]
)

trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=dataset,

    args=TrainingArguments(
        output_dir="outputs",
        per_device_train_batch_size=1,
        gradient_accumulation_steps=4,
        learning_rate=2e-4,
        num_train_epochs=2,
        logging_steps=10
    )
)

trainer.train()

model.save_pretrained(
    "models/eduweave-gemma"
)

tokenizer.save_pretrained(
    "models/eduweave-gemma"
)