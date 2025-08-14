import { pipeline, AutoTokenizer } from "@huggingface/transformers";

const MODEL_NAME = "redis/langcache-embed-v1";
/* {import("@huggingface/transformers").FeatureExtractionPipeline | null} */
let pipe = null;

/* {import("@huggingface/transformers").PreTrainedTokenizer | null} */
let tok = null;

/**
 * Initializes the model and tokenizer for embeddings
 *
 * @returns {Promise<{embeddingsPipeline: import("@huggingface/transformers").FeatureExtractionPipeline, tokenizer: import("@huggingface/transformers").PreTrainedTokenizer}>}
 */
async function getModel() {
  if (!pipe) {
    pipe = await pipeline("feature-extraction", MODEL_NAME, {
      dtype: "fp32",
    });
  }

  if (!tok) {
    tok = await AutoTokenizer.from_pretrained(MODEL_NAME);
  }

  return {
    embeddingsPipeline: pipe,
    tokenizer: tok,
  };
}

/**
 * @typedef {Object} Embeddings
 * @property {string} text - The original text
 * @property {number} tokens - The number of tokens in the text
 * @property {number} dimensions - The number of dimensions in the embeddings
 * @property {import("@huggingface/transformers").DataArray} embeddings - The embeddings for the text
 */

/**
 * Generates embeddings for the provided texts
 *
 * @param {string[]} texts - Array of strings to generate embeddings for
 * @returns {Promise<Embeddings[]>} - Array of embeddings for each text
 */
export async function generateEmbeddings(texts) {
  const embeddings = [];
  const { embeddingsPipeline, tokenizer } = await getModel();

  for (const text of texts) {
    const output = await embeddingsPipeline(text, { normalize: true });

    const encoded = tokenizer.encode(text);

    embeddings.push({
      text,
      tokens: encoded.length,
      dimensions: output.size,
      embeddings: output.data,
    });
  }

  return embeddings;
}

/**
 * Calculates the cosine similarity between two arrays of embeddings
 *
 * @param {Embeddings} embeddings - Array of embeddings objects
 * @param {Embeddings} embeddings2 - Second array of embeddings objects
 * @return {string} - Cosine similarity between the two sets of embeddings
 */
export function cosinesim({ embeddings: A }, { embeddings: B }) {
  let dotproduct = 0;
  let mA = 0;
  let mB = 0;
  let n = A.length > B.length ? B.length : A.length;

  for (let i = 0; i < n; i++) {
    dotproduct += A[i] * B[i];
    mA += A[i] * A[i];
    mB += B[i] * B[i];
  }

  mA = Math.sqrt(mA);
  mB = Math.sqrt(mB);
  let similarity = dotproduct / (mA * mB);

  return similarity.toFixed(4);
}
