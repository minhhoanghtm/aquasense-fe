/**
 * Test-only AI contract double for AQS-102. It never persists data and only
 * listens on localhost. The sequence covers the public FastAPI risk contract.
 */
import http from 'node:http';

const forecasts = [
  { predictedDO: 5.1, predictedPH: 7.7, riskScore: 20, riskLevel: 'SAFE' },
  { predictedDO: 4.6, predictedPH: 7.55, riskScore: 55, riskLevel: 'WARNING' },
  { predictedDO: 3.8, predictedPH: 7.2, riskScore: 85, riskLevel: 'DANGER' },
];
let requestIndex = 0;

const server = http.createServer((request, response) => {
  if (request.method !== 'POST' || request.url !== '/api/predict') {
    response.writeHead(404, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ detail: 'Not found' }));
    return;
  }

  const forecast = forecasts[Math.min(requestIndex, forecasts.length - 1)];
  requestIndex += 1;
  response.writeHead(200, { 'content-type': 'application/json' });
  response.end(JSON.stringify({
    ...forecast,
    modelVersion: 'aqs-102-test-only',
  }));
});

server.listen(8101, '127.0.0.1', () => {
  console.log('AQS-102 test-only AI mock listening on 127.0.0.1:8101');
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
