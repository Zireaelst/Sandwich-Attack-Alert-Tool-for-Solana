// Sandwich Attack Detection Tool Configuration

export const config = {
  rpcEndpoint: 'https://api.mainnet-beta.solana.com',
  slippageThreshold: 1.0, // In percentage
  priceImpactWarningThreshold: 0.5, // In percentage
  poolActivityThreshold: 3, // Number of transactions in same pool within timeframe
  timeWindow: 5, // In seconds
  refreshRate: 1000, // In milliseconds
};

// DEX Program IDs for transaction monitoring
export const dexProgramIds = [
  'JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB', // Jupiter Aggregator
  '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', // Serum v3
  'SWAP1111111111111111111111111111111111111111', // Abstract Swap program
]; 