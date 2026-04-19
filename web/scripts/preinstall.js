#!/usr/bin/env node

if (!/pnpm/.test(process.env.npm_execpath || '')) {
  console.error(
    '\x1b[31m%s\x1b[0m',
    'Error: This project requires pnpm as the package manager.\n' +
    'Please install pnpm (https://pnpm.io) and run:\n' +
    '  pnpm install\n'
  );
  process.exit(1);
}