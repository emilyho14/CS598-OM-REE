from openai import OpenAI

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="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",
)

prompt = """Evaluate this draft Reddit post for r/careeradvice:

    User draft: 'I just graduated and I can't find a job. I feel like I've wasted my degree,, and the state of the economy doesn't help. What do i do.'

    Rules:
    (1) Do not get political
    (2) Don’t be mean
    (3) Do not sell a product
    (4) Do not harass anyone
    (5) No spam

    Return JSON:
    'rules_broken': [...],
    'feedback': '...'
    """

response = client.chat.completions.create(
    model="openai/gpt-3.5-turbo",   # or try "mistralai/mistral-7b-instruct" for open-source

    messages=[
        {"role": "system", "content": "You are a helpful AI assistant."},
        {"role": "user", "content": prompt} # "What color is the sky?"
    ]
)

print(response.choices[0].message.content)
