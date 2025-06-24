require 'minitest/autorun' 
require 'rack/test'
require_relative '../app'

class TestUppercaseCounterApp < Minitest::Test
  include Rack::Test::Methods

  def app
    UppercaseCounterApp
  end

  def test_uppercase_count
    get '/uppercasecount', { text: 'Hello World' }, { 'CONTENT_TYPE' => 'application/json', 'Host' => 'localhost' }
    assert_equal 200, last_response.status
    response_data = JSON.parse(last_response.body)
    assert_equal 2, response_data['uppercase_count']
  end

  def test_no_text_provided
    get '/uppercasecount', {}, { 'CONTENT_TYPE' => 'application/json', 'Host' => 'localhost' }
    assert_equal 400, last_response.status
    response_data = JSON.parse(last_response.body)
    assert_equal 'No text provided', response_data['error']
  end
end
