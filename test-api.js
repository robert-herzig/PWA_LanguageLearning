const https = require('https');
const http = require('http');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };
    
    const req = client.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, json: () => parsedData });
        } catch (e) {
          resolve({ ok: false, json: () => ({ error: 'Invalid JSON response' }) });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testChatAPI() {
  try {
    console.log('Testing API health...');
    const healthResponse = await makeRequest('http://localhost:3001/api/health');
    const healthData = healthResponse.json();
    console.log('Health check:', healthData);
    
    if (healthData.apiKeyConfigured) {
      console.log('\nTesting chat functionality...');
      const chatResponse = await makeRequest('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Hallo, wie geht es dir?',
          level: 'B1',
          topic: 'test',
          vocabularyWords: ['Hallo', 'gut'],
          userId: 'test-user'
        })
      });
      
      if (chatResponse.ok) {
        const chatData = chatResponse.json();
        console.log('Chat test successful!');
        console.log('Response:', chatData.response);
        console.log('Cost:', `$${chatData.estimatedCost.toFixed(4)}`);
        console.log('Remaining budget:', `$${chatData.remainingBudget.toFixed(4)}`);
      } else {
        const error = chatResponse.json();
        console.error('Chat test failed:', error);
      }
    } else {
      console.error('API key not configured!');
    }
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testChatAPI();
