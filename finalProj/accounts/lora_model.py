# import os
# os.environ["CUDA_VISIBLE_DEVICES"] = ""  # disables GPU
# os.environ["MKL_THREADING_LAYER"] = "GNU"  # optional: helps with some CPU DLL issues

# import torch
# from transformers import AutoTokenizer, AutoModelForCausalLM
# from peft import PeftModel

# BASE_MODEL = r"D:\djangoFYP\finalProj\models\tinyllama-base"
# LORA_PATH = r"D:\djangoFYP\finalProj\models\tinyllama-dsa"

# tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)
# model = AutoModelForCausalLM.from_pretrained(BASE_MODEL, device_map={"": "cpu"})
# model = PeftModel.from_pretrained(model, LORA_PATH, device_map={"": "cpu"})