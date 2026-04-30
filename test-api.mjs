import http from 'http';

const data = JSON.stringify({
  email: 'swetbalke2005@gmail.com',
  name: 'Swet',
  uid: 'testuid123'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/firebase',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);

  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
