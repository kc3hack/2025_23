#!/bin/bash
uv venv
uv sync

wget https://huggingface.co/bartowski/Meta-Llama-3-8B-Instruct-GGUF/resolve/main/Meta-Llama-3-8B-Instruct-Q4_K_M.gguf -O models/Meta-Llama-3-8B-Instruct-Q4_K_M.gguf



