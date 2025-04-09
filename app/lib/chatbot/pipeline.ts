import { ChatOpenAI } from '@langchain/openai';
import { config, createEmbeddings, createTextSplitter, createVectorStore } from './config.js';
import type { Collection } from 'chromadb';

export class R2RPipeline {
  private llm: ChatOpenAI;
  private embeddings: ReturnType<typeof createEmbeddings>;
  private textSplitter: ReturnType<typeof createTextSplitter>;
  private vectorStore: Collection | null = null;

  constructor() {
    this.llm = new ChatOpenAI({
      openAIApiKey: config.openai.apiKey,
      modelName: config.openai.model,
      temperature: 0.7,
    });
    this.embeddings = createEmbeddings();
    this.textSplitter = createTextSplitter();
  }

  async initialize() {
    this.vectorStore = await createVectorStore();
  }

  async processQuery(query: string): Promise<string> {
    if (!this.vectorStore) {
      throw new Error('Vector store not initialized. Call initialize() first.');
    }

    // Generate query embedding
    const queryEmbedding = await this.embeddings.embedQuery(query);

    // Retrieve relevant documents
    const results = await this.vectorStore.query({
      queryEmbeddings: [queryEmbedding],
      nResults: 3,
    });

    // Format context from retrieved documents
    const context = results.documents[0]
      .map((doc, i) => `[${i + 1}] ${doc}`)
      .join('\n\n');

    // Generate response using the context
    const prompt = `You are a helpful AI assistant. Use the following context to answer the user's question. If the context doesn't contain relevant information, say so and try to help based on your general knowledge.

Context:
${context}

User question: ${query}

Answer:`;

    const response = await this.llm.invoke(prompt);
    return response.content as string;
  }

  async addDocuments(documents: string[]) {
    if (!this.vectorStore) {
      throw new Error('Vector store not initialized. Call initialize() first.');
    }

    // Split documents into chunks
    const chunks = await this.textSplitter.createDocuments(documents);

    // Generate embeddings for chunks
    const embeddings = await this.embeddings.embedDocuments(
      chunks.map((chunk) => chunk.pageContent)
    );

    // Add to vector store
    await this.vectorStore.add({
      ids: chunks.map((_, i) => `doc_${i}`),
      embeddings: embeddings,
      documents: chunks.map((chunk) => chunk.pageContent),
    });
  }
} 