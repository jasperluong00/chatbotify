import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { R2RPipeline } from './pipeline.js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: '.env' });

// Verify OpenAI API key is loaded
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is not set in environment variables');
  console.log('Current working directory:', process.cwd());
  console.log('Looking for .env file...');
  
  const envPath = path.join(process.cwd(), '.env');
  if (existsSync(envPath)) {
    console.log('✅ .env file exists at:', envPath);
    console.log('Contents of .env:');
    console.log(readFileSync(envPath, 'utf-8'));
  } else {
    console.log('❌ .env file not found at:', envPath);
  }
  
  process.exit(1);
}

console.log('✅ OPENAI_API_KEY is set');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function addDocumentsToVectorStore() {
  try {
    console.log('Initializing pipeline...');
    const pipeline = new R2RPipeline();
    await pipeline.initialize();
    console.log('Pipeline initialized');

    const dataDir = join(process.cwd(), 'data', 'chatbot', 'documents');
    
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
      console.log('Created documents directory:', dataDir);
    }
    
    const files = readdirSync(dataDir);
    console.log('Found files:', files);

    for (const file of files) {
      if (file.endsWith('.txt') || file.endsWith('.md')) {
        console.log(`Processing ${file}...`);
        const content = readFileSync(join(dataDir, file), 'utf-8');
        await pipeline.addDocuments([content]);
        console.log(`Added ${file} to vector store`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Run the script
addDocumentsToVectorStore().catch(console.error); 