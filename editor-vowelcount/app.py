from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

# Enable CORS for specific origin(s) for vowel count endpoint
CORS(app, resources={r"/vowelcount": {"origins": "*"}})  

# Function to count vowels in a given text
def count_vowels(text):
    vowels = "aeiou"
    text = text.lower()  # Convert to lowercase for case-insensitive counting
    count = sum(1 for char in text if char in vowels)
    print(f"text: {text}, vowel count: {count}")
    return count

# Route to handle vowel count requests
@app.route('/vowelcount', methods=['GET'])
def vowel_count_handler():
    text = request.args.get('text', "")  # Get text from query parameters
    if text == "":
        return jsonify({
            "text": text,
            "vowelCount": 0,
            "message": "Empty text provided"
        }), 400

    # Ensure text is processed correctly, including special characters
    vowel_count = count_vowels(text)

    response = {
        "text": text,
        "vowelCount": vowel_count
    }
    return jsonify(response), 200


if __name__ == '__main__':
    # Start the Flask server
    app.run(debug=True, host='0.0.0.0', port=5000)
