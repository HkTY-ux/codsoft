const express = require('express');
const axios = require('axios');
const path = require('path');
const config = require('./config');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/api/stations', async (req, res) => {
  const { lat, lon } = req.query;
  
  try {
    const response = await axios.get(`https://discover.search.hereapi.com/v1/discover`, {
      params: {
        apiKey: config.HERE_API_KEY,
        q: 'charging station',
        at: `${lat},${lon}`,
        limit: 10
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching charging stations:', error);
    res.status(500).json({ error: 'Failed to fetch charging stations' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});