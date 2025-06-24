require 'sinatra'
require 'rack/protection'
require_relative 'uppercase_count'

# Configure Sinatra to bind to all interfaces for containerized deployment
set :bind, '0.0.0.0'
set :port, 4567

# CORS configuration
before do
  response.headers['Access-Control-Allow-Origin'] = '*' # Adjust for specific domains in production
  response.headers['Access-Control-Allow-Methods'] = 'GET,OPTIONS'
  response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
end

# Handle preflight requests for OPTIONS
options "*" do
  response.headers["Access-Control-Allow-Origin"] = '*' # Adjust for specific origins in production
  response.headers["Access-Control-Allow-Methods"] = "GET,OPTIONS"
  response.headers["Access-Control-Allow-Headers"] = "Content-Type"
  200
end

# API endpoint for GET requests to count uppercase letters
get '/' do
  content_type :json

  # Get the 'text' parameter from the query string
  input_text = params['text']

  # Validate input
  if input_text.nil? || input_text.empty?
    return {
      text: '',
      error: 'Invalid input. Please provide a valid text string.',
      uppercase_count: "Empty String"
    }.to_json
  end

  # Use the UppercaseCounter service
  begin
    uppercase_count = UppercaseCounter.count_uppercase(input_text)
  rescue ArgumentError => e
    status 400
    return { error: e.message }.to_json
  end

  # Return the result as JSON
  {
    text: input_text,
    error: false,
    uppercase_count: uppercase_count
  }.to_json
end

