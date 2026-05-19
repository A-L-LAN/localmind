import os
import subprocess

# ======================================================
# Paths
# ======================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

MODEL_PATH = os.path.abspath(
    "../models/eduweave-gemma"
)

OUTPUT_PATH = os.path.abspath(
    "../gguf_models/eduweave-gemma.gguf"
)

LLAMA_CPP_PATH = os.path.abspath(
    "../llama.cpp"
)

CONVERT_SCRIPT = os.path.join(
    LLAMA_CPP_PATH,
    "convert_hf_to_gguf.py"
)

# ======================================================
# Export Function
# ======================================================

def export_to_gguf():

    print("🚀 Exporting model to GGUF...")
    print(f"Model: {MODEL_PATH}")

    command = [
        "python",
        CONVERT_SCRIPT,

        MODEL_PATH,

        "--outfile",
        OUTPUT_PATH,

        "--outtype",
        "q4_k_m"
    ]

    result = subprocess.run(
        command,
        capture_output=True,
        text=True
    )

    if result.returncode == 0:

        print("✅ GGUF export complete!")
        print(
            f"Saved to:\n{OUTPUT_PATH}"
        )

    else:

        print("❌ Export failed")
        print(result.stderr)


# ======================================================
# Run
# ======================================================

if __name__ == "__main__":
    export_to_gguf()