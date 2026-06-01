import os
import sys
import subprocess

# ======================================================
# Paths
# ======================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.abspath(
    os.path.join(BASE_DIR, "../models/gemma4")
)

if not os.path.exists(os.path.join(MODEL_PATH, "config.json")):
    print("❌ config.json missing — wrong model folder")
    exit()

if not os.path.exists(os.path.join(MODEL_PATH, "model.safetensors")):
    print("❌ model.safetensors missing — incomplete model")
    exit()

OUTPUT_PATH = os.path.abspath(
    os.path.join(BASE_DIR, "../gguf_models/eduweave-gemma-f16.gguf")
)

LLAMA_CPP_PATH = os.path.abspath(
    os.path.join(BASE_DIR, "../llama.cpp")
)

CONVERT_SCRIPT = os.path.join(
    LLAMA_CPP_PATH,
    "convert_hf_to_gguf.py"
)

# ======================================================
# Export Function
# ======================================================

def export_to_gguf():

    print("=" * 60)
    print("🚀 Exporting model to GGUF")
    print("=" * 60)

    print(f"Python      : {sys.executable}")
    print(f"Model Path  : {MODEL_PATH}")
    print(f"Output Path : {OUTPUT_PATH}")
    print(f"Converter   : {CONVERT_SCRIPT}")
    print()

    # Verify paths exist
    if not os.path.exists(MODEL_PATH):
        print(f"❌ Model folder not found:\n{MODEL_PATH}")
        return

    if not os.path.exists(CONVERT_SCRIPT):
        print(f"❌ convert_hf_to_gguf.py not found:\n{CONVERT_SCRIPT}")
        return

    # Create output directory if needed
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    command = [
        sys.executable,
        CONVERT_SCRIPT,
        MODEL_PATH,
        "--outfile",
        OUTPUT_PATH,
        "--outtype",
        "f16"
    ]

    print("Running command:")
    print(" ".join(command))
    print()

    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            cwd=LLAMA_CPP_PATH
        )

        if result.stdout:
            print("STDOUT:")
            print(result.stdout)

        if result.returncode == 0:
            print()
            print("✅ GGUF export completed successfully!")
            print(f"Saved to:\n{OUTPUT_PATH}")

        else:
            print()
            print("❌ Export failed")
            print("STDERR:")
            print(result.stderr)

    except Exception as e:
        print()
        print("❌ Unexpected error")
        print(str(e))


# ======================================================
# Main
# ======================================================

if __name__ == "__main__":
    export_to_gguf()