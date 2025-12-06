#!/usr/bin/env node
// Script to start the backend with an in-memory MongoDB (for testing only)

const { MongoMemoryServer } = require('mongodb-memory-server');
const { spawn } = require('child_process');

(async () => {
  try {
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    console.log('Starting in-memory MongoDB at', uri);

    // Spawn the app with MONGODB_URI set to the in-memory server
    const env = Object.assign({}, process.env, { MONGODB_URI: uri, NODE_ENV: 'development', INTERNAL_API_KEY: process.env.INTERNAL_API_KEY || 'test-key' });
    const proc = spawn('node', ['app.js'], { env, stdio: 'inherit' });

    proc.on('close', async (code) => {
      console.log('app process exited with code', code);
      await mongod.stop();
      process.exit(code);
    });
  } catch (err) {
    console.error('Failed to start in-memory MongoDB', err);
    process.exit(1);
  }
})();
