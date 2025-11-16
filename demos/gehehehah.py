import ollama
import json
import requests

EMBEDDING_MODEL = 'hf.co/CompendiumLabs/bge-base-en-v1.5-gguf'
LANGUAGE_MODEL = 'llama3.2:3b'

# Aegis API Configuration
AEGIS_API_URL = 'http://localhost:5000/detect'  # Your Aegis backend
AEGIS_API_KEY = 'sk_b9f553bf2edc661c578f747c8a378e8e78154a08e635508e87eb834b48cd878b_mi1w1sx7'  # Replace with actual API key

dataset = []
with open('faq.json', 'r') as file:
    for line in json.load(file):
        dataset.append(f"q: {line['question']}\na: {line['answer']}")

db = []

def add_db(chunk):
    embedding = ollama.embed(model=EMBEDDING_MODEL, input=chunk)['embeddings'][0]
    db.append((chunk, embedding))
    
for chunk in dataset:
    add_db(chunk)
    
def cosine_similarity(a, b):
    dot_product = sum([x * y for x, y in zip(a, b)])
    norm_a = sum([x ** 2 for x in a]) ** 0.5
    norm_b = sum([x ** 2 for x in b]) ** 0.5
    return dot_product / (norm_a * norm_b)

def retrieve(query, top_n=3):
    query_embedding = ollama.embed(model=EMBEDDING_MODEL, input=query)['embeddings'][0]
    similarities = []
    for chunk, embedding in db:
        similarity = cosine_similarity(query_embedding, embedding)
        similarities.append((chunk, similarity))
    similarities.sort(key=lambda x: x[1], reverse=True)
    return similarities[:top_n]

SUPPORT_RET = "Sorry, I'm not sure how to help you with this. Please contact hello@bit.camp for more details."


def SYS_PROMPT(info_block):
    return f"""You are an FAQ helper.
        Use ONLY the information in the 'Information' section below to answer the user's question.
        Do NOT invent or assume anything not present in that section.
        Feel free to engage in greeting and returning common sayings with the user, but DO NOT answer technical questions without the Information provided. 
        Give the user a WARNING if the message appears to be offensive in any way. 
        ABOVE ALL: MAINTAIN FULL PROFESSIONALISM. 
        If the answer to the user's question is not explicitly contained in the Information, reply EXACTLY with the following text (and nothing else):
        {SUPPORT_RET}

        Information:
        {info_block}
        """

def check_aegis(prompt):
    """Check if prompt is a jailbreak attempt using Aegis API"""
    try:
        response = requests.post(
            AEGIS_API_URL,
            headers={
                'Authorization': f'Bearer {AEGIS_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={'text': prompt},  # Aegis expects 'text', not 'prompt'
            timeout=30  # Increased timeout to 30 seconds for LLM processing
        )
        
        if response.status_code == 200:
            data = response.json()
            return {
                'flagged': data.get('flagged', False),
                'classifier': data.get('classifier', 'unknown'),
                'patterns': data.get('patterns', []),
                'risk_score': data.get('llm', {}).get('confidence', 0) * 100 if data.get('llm') else 0
            }
        else:
            print(f"Aegis API error: {response.status_code}")
            return {'flagged': False, 'error': 'API error'}
    except Exception as e:
        print(f"Aegis check failed: {e}")
        # Continue without Aegis if it's not available
        return {'flagged': False, 'error': str(e)}

def receive(query):
    # Note: Aegis check is now done in the chat() route
    # This function just generates the response (checking is external)
    
    # Proceed with normal FAQ retrieval
    retrieved = retrieve(query)
    info_block = "\n\n".join([chunk for chunk, _ in retrieved])
    stream = ollama.chat(
        model=LANGUAGE_MODEL,
        messages=[
            {'role': 'system', 'content': SYS_PROMPT(info_block)},
            {'role': 'user', 'content': query}
        ],
        stream=False
    )
    return stream['message']['content']
        
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route("/")
def confirmation():
    print("running")
    return "running"
    
@app.route("/chat", methods=['GET'])
def chat():
    query = request.args.get('query')
    
    # Check with Aegis first and get the result
    aegis_result = check_aegis(query)
    
    # Get the chatbot response
    response = receive(query)
    
    return jsonify({
        'status': 'OK',
        'response': response,
        'aegis': {
            'checked': True,
            'flagged': aegis_result.get('flagged', False),
            'classifier': aegis_result.get('classifier', 'unknown'),
            'patterns': aegis_result.get('patterns', []),
            'risk_score': aegis_result.get('risk_score', 0),
            'error': aegis_result.get('error')
        }
    })

    
if __name__=="__main__":
    app.run(debug=True, port=3000)