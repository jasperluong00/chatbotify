import { ChromaClient } from 'chromadb';
import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

export const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o-mini',
  },
  embeddings: {
    model: 'text-embedding-3-small',
    chunkSize: 1000,
    chunkOverlap: 200,
  },
  vectorStore: {
    collectionName: 'website_docs',
    persistDirectory: './data/chatbot/vector_store',
  },
} as const;

export const createEmbeddings = () => {
  return new OpenAIEmbeddings({
    openAIApiKey: config.openai.apiKey,
    modelName: config.embeddings.model,
  });
};

export const createTextSplitter = () => {
  return new RecursiveCharacterTextSplitter({
    chunkSize: config.embeddings.chunkSize,
    chunkOverlap: config.embeddings.chunkOverlap,
  });
};

export const createVectorStore = async () => {
  const client = new ChromaClient();
  return client.getOrCreateCollection({
    name: config.vectorStore.collectionName,
  });
}; 