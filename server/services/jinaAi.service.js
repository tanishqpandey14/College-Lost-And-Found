const axios = require('axios');

/**
 * Generates vector embeddings for a given text string
 * @param {string} text - Combined item title and description
 * @returns {Promise<number[]>} Array of 768 floating-point vector values
 */
const generateEmbedding = async (text) => {
  try {
    const response = await axios.post(
      'https://api.jina.ai/v1/embeddings',
      {
        model: 'jina-embeddings-v2-base-en',
        input: [text]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.JINA_API_KEY}`
        }
      }
    );

    return response.data.data[0].embedding;
  } catch (error) {
    console.error('Jina AI Embedding API Error:', error.response?.data || error.message);
    throw new Error('Failed to generate Jina AI semantic vector embedding');
  }
};

module.exports = { generateEmbedding };