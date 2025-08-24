#!/usr/bin/env node

const { spawn } = require('child_process');

// Start the server using tsx
const server = spawn('tsx', ['server/index.ts'], {
  stdio: 'inherit',
  env: process.env
});

server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, stopping server...');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, stopping server...');
  server.kill('SIGINT');
});