// Web Worker for heavy computations
/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {
  switch (data.type) {
    case 'HEAVY_COMPUTATION':
      // Perform heavy computations here to avoid blocking the main thread
      const result = performHeavyComputation(data.payload)
      postMessage({ type: 'COMPUTATION_RESULT', result })
      break

    case 'DATA_PROCESSING':
      // Process large datasets
      const processedData = processLargeDataset(data.payload)
      postMessage({ type: 'DATA_PROCESSED', data: processedData })
      break

    default:
      postMessage({ type: 'ERROR', message: 'Unknown task type' })
  }
})

function performHeavyComputation(data: any): any {
  // Example: Complex calculations, data transformations
  return data.map((item: any) => {
    // Simulate heavy computation
    return { ...item, computed: Math.random() * 1000 }
  })
}

function processLargeDataset(data: any[]): any {
  // Process large datasets without blocking the main thread
  return data.filter(item => item.active)
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(0, 100)
}