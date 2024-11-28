import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['server.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outdir: 'dist',
  format: 'esm',
  external: [
    'express',
    '@anthropic-ai/sdk',
    '@pinecone-database/pinecone',
    'openai',
    'dotenv'
  ]
});
