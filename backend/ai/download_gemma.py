from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM
)

model_name = "google/gemma-4-E2B-it-assistant"

print("Downloading tokenizer...")

tokenizer = AutoTokenizer.from_pretrained(
    model_name
)

print("Downloading model...")

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    device_map="auto",
    torch_dtype="auto"
)

save_path = "./ai/models/gemma4WithNoAssist"

print("Saving locally...")

model.save_pretrained(save_path)
tokenizer.save_pretrained(save_path)

print("Gemma downloaded successfully!")