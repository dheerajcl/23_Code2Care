import google.generativeai as genai

genai.configure(api_key="AIzaSyDpt_oFa1aWqTvU0eynSj97mZ4c39hlK6k")

models = genai.list_models()
for model in models:
    print(model.name)
