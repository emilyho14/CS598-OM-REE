# from openai import OpenAI

# client = OpenAI(
#     base_url="https://openrouter.ai/api/v1",
#     api_key="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",
# )

# prompt = """Evaluate this draft Reddit post for r/careeradvice:

#     User draft: 'I just graduated and I can't find a job. I feel like I've wasted my degree, and the state of the economy doesn't help. What do i do.'

#     Rules:
#     (1) Do not get political
#     (2) Don’t be mean
#     (3) Do not sell a product
#     (4) Do not harass anyone
#     (5) No spam

#     Return JSON:
#     'rules_broken': [...],
#     'feedback': '...'
#     """

# response = client.chat.completions.create(
#     model="openai/gpt-3.5-turbo",   # or try "mistralai/mistral-7b-instruct" for open-source

#     messages=[
#         {"role": "system", "content": "You are a helpful AI assistant."},
#         {"role": "user", "content": prompt} # "What color is the sky?"
#     ]
# )

# print(response.choices[0].message.content)

import requests
import json

API_KEY = "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"

url = "https://openrouter.ai/api/v1/chat/completions"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",

    # REQUIRED by OpenRouter for browser-based or extension-based use
    "HTTP-Referer": "https://your-extension.local",
    "X-Title": "RP Reddit Assistant"
}

prompt = """Evaluate this draft Reddit post for r/careeradvice:

User draft: "I think I'm about to be fired, do I have a right to know? 
"A few months ago I made the decision to go back to school, I informed my employer of my decision (it was only going to be a couple of classes at a time), and they approved as long as it didn't interfere with work. So far it hasn't. Last week we had an in-person meeting for testing on a new system being implemented next year, my boss said it was okay I didn't attend in person (due to class which meant I'd be in and out and it would just look bad), as long as I was on the calls they had set up. I was on those calls when I wasn't in class.

However, upper management was ""concerned"" because I wasn't on the meetings, and complained to my boss, who called me to get clarification. He tends to be forgetful and wasn't sure what we'd agreed upon about my lack of not attending in person (no worries, I have an IM to backup my claim if it comes to that), and he was supposed to go back to upper management with this and let me know. He never did (again, forgetful). 

Fast forward to yesterday afternoon where I got sent a tracker spreadsheet where I need to track everything I do for the next two weeks. I immediately replied and asked if I needed to start looking for a job, my boss said no, that the spreadsheet is ""going to help in identifying resources who have time to learn new things with our work space"".

I find that \*really\* hard to believe, but I guess I can't force them to tell me the truth, can I? Job searching is going to be hard finding something I can do full-time to pay the bills while going back to school, but it doesn't sit right with me because I can't seem to get any clarity without going over his head, and I feel like upper management is already sour with me.

  
Please don't be assholes in your replies, I don't need REAL TALK, I just want some advice on what I can do. I would just appreciate some empathy and compassion right now, which I know is a lot to ask for on Reddit."

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

payload = {
    "model": "openai/gpt-3.5-turbo",
    "messages": [
        {"role": "system", "content": "You are a helpful AI assistant."},
        {"role": "user", "content": prompt}
    ]
}

response = requests.post(url, headers=headers, data=json.dumps(payload))

print(response.json())

# {'id': 'gen-1763454829-l9NmMTiopIvClv2gT3CH', 'provider': 'OpenAI', 'model': 'openai/gpt-3.5-turbo', 'object': 'chat.completion', 'created': 1763454829, 'choices': [{'logprobs': None, 'finish_reason': 'stop', 'native_finish_reason': 'stop', 'index': 0, 'message': {'role': 'assistant', 'content': "{\n    'rules_broken': ['Do not be mean'],\n    'feedback': 'The tone of the post is a bit defensive and dismissive, especially towards potential replies. Asking for empathy and compassion is understandable, but it's important to approach seeking advice with a more open and respectful attitude. It might be beneficial to rephrase the post to be 
# more neutral and focused on seeking constructive advice.'\n}", 'refusal': None, 'reasoning': None}}], 'system_fingerprint': None, 'usage': {'prompt_tokens': 549, 'completion_tokens': 81, 'total_tokens': 630, 'prompt_tokens_details': {'cached_tokens': 0, 'audio_tokens': 0}, 'completion_tokens_details': {'reasoning_tokens': 0}}}
