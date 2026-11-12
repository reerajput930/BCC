// Compares chat messages by meaning, with a small multilingual language model that runs on
// this server – no outside service sees the messages. The model (about 130 MB) downloads
// once on the first start into server/.models/.
import { fileURLToPath } from 'node:url'
import { env, pipeline } from '@huggingface/transformers'

env.cacheDir = fileURLToPath(new URL('./.models/', import.meta.url))

const MODEL = 'Xenova/multilingual-e5-small'

let extractor = null

export async function loadModel() {
  extractor ??= await pipeline('feature-extraction', MODEL, { dtype: 'q8' })
}

// One vector per text. They're normalised, so the dot product of two is their similarity:
// about 0.9 for questions that mean the same, around 0.8 for unrelated ones.
export async function embed(texts) {
  // e5 models expect this prefix on every text they compare
  const output = await extractor(
    texts.map((text) => `query: ${text}`),
    { pooling: 'mean', normalize: true },
  )
  return output.tolist()
}

export function similarity(a, b) {
  let sum = 0
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i]
  return sum
}
