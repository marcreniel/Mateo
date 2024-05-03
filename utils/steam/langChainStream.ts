import { createStreamDataTransformer } from 'ai'

// This function is used to parse a LangChain stream to a readable stream, because Vercel breaks the stream in their new AI SDK.

export const LangChainStream = (
  stream: any,
  { onCompletion }: { onCompletion: (completion: string) => Promise<void> }
): ReadableStream => {
  let completion = ''
  const transformStream = new TransformStream({
    async transform(chunk, controller) {
      completion += new TextDecoder('utf-8').decode(chunk)
      controller.enqueue(chunk)
    },
    async flush(controller) {
      await onCompletion(completion)
        .then(() => {
          controller.terminate()
        })
        .catch((e: any) => {
          console.error('Error', e)
          controller.terminate()
        })
    }
  })
  stream.pipeThrough(transformStream)
  return transformStream.readable.pipeThrough(createStreamDataTransformer())
}