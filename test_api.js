const http = require('http');

const data = JSON.stringify({ key: 'dadwork_date_specific_prices', value: JSON.stringify({'2026-07-08': '36'}) });

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/settings',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    // Provide a valid fake session token? Or we might get 401. Let's see what happens.
    'x-session-token': 'admin_test' 
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log(body));
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
