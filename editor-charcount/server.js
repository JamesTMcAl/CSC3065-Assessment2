const express = require('express');
const charcount = require('./charcount');

const PORT = 80;
const HOST = '0.0.0.0';

const app = express();

app.get('/', (req, res) => {
  const output = {
    error: false,
    string: '',
    answer: null, // Default answer when no result is available
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const text = req.query.text;

    // Check if the `text` parameter is missing
    if (!text) {
      return res.status(400).json({
        error: true,
        string: 'Missing "text" parameter.',
        answer: null,
      });
    }

    // Process the `text` and count characters
    const answer = charcount.counter(text);
    output.string = `Contains ${answer} characters.`;
    output.answer = answer;

    res.status(200).json(output);
  } catch (error) {
    console.error('Error processing request:', error.message);

    // Internal server error fallback
    res.status(500).json({
      error: true,
      string: 'Internal server error.',
      answer: null,
      details: error.message, // Include detailed error information for debugging
    });
  }
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`Running on http://${HOST}:${PORT}`);
  });
}

