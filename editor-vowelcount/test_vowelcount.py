import pytest
from app import app

@pytest.fixture
def client():
    with app.test_client() as client:
        yield client

def test_vowel_count_valid_input(client):
    response = client.get('/vowelcount?text=Hello World')
    data = response.get_json()

    assert response.status_code == 200
    assert data['error'] == False
    assert data['string'] == "Contains 3 vowels"
    assert data['answer'] == 3

def test_vowel_count_no_text(client):
    response = client.get('/vowelcount')
    data = response.get_json()

    assert response.status_code == 400
    assert data['error'] == True
    assert data['string'] == "No text provided"
    assert data['answer'] == 0

def test_vowel_count_empty_string(client):
    response = client.get('/vowelcount?text=')
    data = response.get_json()

    assert response.status_code == 200
    assert data['error'] == False
    assert data['string'] == "Contains 0 vowels"
    assert data['answer'] == 0
