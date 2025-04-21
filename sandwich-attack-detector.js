// Sandwich Attack Detection Tool for Solana
// This script connects to a Solana RPC node and monitors for potential sandwich attack conditions

import { Connection, PublicKey, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { Jupiter } from '@jup-ag/core';
import { TokenListProvider } from '@solana/spl-token-registry';

// Configuration
const config = {
  rpcEndpoint: 'https://api.mainnet-beta.solana.com',
  slippageThreshold: 1.0, // In percentage
  priceImpactWarningThreshold: 0.5, // In percentage
  poolActivityThreshold: 3, // Number of transactions in same pool within timeframe
  timeWindow: 5, // In seconds
  refreshRate: 1000, // In milliseconds
};

// Initialize connection
const connection = new Connection(config.rpcEndpoint);
let jupiter = null;
let tokenMap = new Map();
let userWallet = null;
let isMonitoring = false;
let recentPoolActivity = new Map(); // Track activity in pools

// UI Elements
const connectWalletBtn = document.getElementById('connect-wallet');
const startMonitoringBtn = document.getElementById('start-monitoring');
const stopMonitoringBtn = document.getElementById('stop-monitoring');
const alertsContainer = document.getElementById('alerts-container');
const statusDisplay = document.getElementById('status');

// Initialize Jupiter and token list
async function initialize() {
  try {
    statusDisplay.textContent = 'Initializing...';
    
    // Load token list
    const tokenListProvider = new TokenListProvider();
    const tokenList = await tokenListProvider.resolve();
    const tokens = tokenList.filterByClusterSlug('mainnet-beta').getList();
    
    tokens.forEach(token => {
      tokenMap.set(token.address, token);
    });
    
    // Initialize Jupiter
    jupiter = await Jupiter.load({
      connection,
      cluster: 'mainnet-beta',
    });
    
    statusDisplay.textContent = 'Initialized successfully';
    startMonitoringBtn.disabled = false;
  } catch (error) {
    statusDisplay.textContent = `Initialization error: ${error.message}`;
    console.error('Initialization error:', error);
  }
}

// Connect wallet function
async function connectWallet() {
  try {
    if (window.solana) {
      const response = await window.solana.connect();
      userWallet = response.publicKey;
      connectWalletBtn.textContent = `Connected: ${userWallet.toString().substring(0, 4)}...${userWallet.toString().substring(userWallet.toString().length - 4)}`;
      statusDisplay.textContent = 'Wallet connected';
    } else {
      throw new Error('Solana wallet not found. Please install Phantom or another Solana wallet extension.');
    }
  } catch (error) {
    statusDisplay.textContent = `Wallet connection error: ${error.message}`;
    console.error('Wallet connection error:', error);
  }
}

// Start monitoring for potential sandwich attacks
async function startMonitoring() {
  if (!userWallet) {
    createAlert('error', 'Please connect your wallet first');
    return;
  }
  
  isMonitoring = true;
  statusDisplay.textContent = 'Monitoring active';
  startMonitoringBtn.disabled = true;
  stopMonitoringBtn.disabled = false;
  
  // Start monitoring mempool
  monitorMempool();
  
  // Start monitoring transactions in user's account
  monitorUserTransactions();
}

// Stop monitoring
function stopMonitoring() {
  isMonitoring = false;
  statusDisplay.textContent = 'Monitoring stopped';
  startMonitoringBtn.disabled = false;
  stopMonitoringBtn.disabled = true;
}

// Monitor mempool for pending transactions
async function monitorMempool() {
  while (isMonitoring) {
    try {
      // In a real implementation, you would use a websocket connection to monitor the mempool
      // For now, we'll simulate by checking recent confirmed transactions and analyzing patterns
      
      const signatures = await connection.getSignaturesForAddress(userWallet);
      
      // For each recent transaction signature
      for (const signatureInfo of signatures.slice(0, 10)) {
        // Skip if we've already processed this transaction
        if (signatureInfo.processed) continue;
        
        // Get transaction details
        const transaction = await connection.getTransaction(signatureInfo.signature);
        if (!transaction) continue;
        
        // Analyze for swap transactions
        if (isSwapTransaction(transaction)) {
          // Check for indicators of a potential sandwich attack
          const riskAssessment = assessSandwichRisk(transaction);
          
          if (riskAssessment.risk === 'high') {
            createAlert('danger', `⚠️ High Risk of Sandwich Attack: ${riskAssessment.reason}`);
          } else if (riskAssessment.risk === 'medium') {
            createAlert('warning', `⚠️ Possible Sandwich Risk: ${riskAssessment.reason}`);
          }
          
          // Mark as processed
          signatureInfo.processed = true;
        }
      }
      
      // Pause before next check
      await new Promise(resolve => setTimeout(resolve, config.refreshRate));
    } catch (error) {
      console.error('Error monitoring mempool:', error);
      statusDisplay.textContent = `Monitoring error: ${error.message}`;
      await new Promise(resolve => setTimeout(resolve, config.refreshRate * 5)); // Longer pause on error
    }
  }
}

// Monitor user's own transactions
async function monitorUserTransactions() {
  if (!userWallet) return;
  
  // Subscribe to account changes
  const subscriptionId = connection.onAccountChange(
    userWallet,
    async (accountInfo, context) => {
      if (!isMonitoring) {
        connection.removeAccountChangeListener(subscriptionId);
        return;
      }
      
      // Get recent transactions
      const signatures = await connection.getSignaturesForAddress(userWallet, { limit: 5 });
      
      for (const sigInfo of signatures) {
        const tx = await connection.getTransaction(sigInfo.signature);
        if (!tx) continue;
        
        // Check specifically for DEX interactions
        if (isDexInteraction(tx)) {
          // Calculate price impact
          const priceImpact = calculatePriceImpact(tx);
          
          if (priceImpact > config.priceImpactWarningThreshold) {
            createAlert('warning', `Transaction had ${priceImpact.toFixed(2)}% price impact. Potential sandwich attack.`);
            
            // Provide suggestions
            createAlert('info', 'Suggestions: Use lower slippage tolerance or private RPC endpoints to protect against sandwiching');
          }
        }
      }
    }
  );
}

// Determine if a transaction is a swap on a DEX
function isSwapTransaction(transaction) {
  // In a full implementation, you would check the program IDs against known DEX programs
  // This is a simplified check
  const programIds = transaction.transaction.message.programIds().map(p => p.toString());
  
  // Check for common Solana DEX program IDs
  const dexProgramIds = [
    'JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB', // Jupiter Aggregator
    '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', // Serum v3
    'SWAP1111111111111111111111111111111111111111', // Abstract Swap program
  ];
  
  return programIds.some(pid => dexProgramIds.includes(pid));
}

// Determine if transaction is interacting with a DEX
function isDexInteraction(transaction) {
  // Similar to isSwapTransaction but can be more specific
  return isSwapTransaction(transaction);
}

// Calculate estimated price impact from a transaction
function calculatePriceImpact(transaction) {
  // In a real implementation, you would decode the transaction instructions
  // and calculate the actual price impact.
  // For this prototype, we'll return a random value for demonstration
  return Math.random() * 2; // Random value between 0-2%
}

// Assess risk of a transaction being sandwiched
function assessSandwichRisk(transaction) {
  // In a real implementation, you would:
  // 1. Look at pool liquidity
  // 2. Check transaction size relative to pool
  // 3. Monitor for unusual activity in the pool
  // 4. Check slippage settings
  
  // For this prototype, we'll use a simple heuristic
  const poolId = extractPoolId(transaction);
  
  if (poolId) {
    // Track activity in this pool
    if (!recentPoolActivity.has(poolId)) {
      recentPoolActivity.set(poolId, []);
    }
    
    const now = Date.now();
    const recentActivity = recentPoolActivity.get(poolId);
    
    // Add this transaction
    recentActivity.push(now);
    
    // Remove old activity
    const relevantTimeWindow = now - (config.timeWindow * 1000);
    const filteredActivity = recentActivity.filter(time => time >= relevantTimeWindow);
    recentPoolActivity.set(poolId, filteredActivity);
    
    // If there's a lot of activity in this pool in a short time, that's suspicious
    if (filteredActivity.length >= config.poolActivityThreshold) {
      return {
        risk: 'high',
        reason: `Unusual activity detected in pool: ${filteredActivity.length} transactions in ${config.timeWindow}s`
      };
    }
    
    // Check transaction size
    const txSize = estimateTransactionSize(transaction);
    if (txSize > 1000) { // SOL value or token amount, arbitrary threshold for demo
      return {
        risk: 'medium',
        reason: 'Large transaction size relative to pool liquidity'
      };
    }
  }
  
  return { risk: 'low', reason: 'No suspicious patterns detected' };
}

// Extract pool ID from transaction (simplified)
function extractPoolId(transaction) {
  // In a real implementation, you would decode the transaction to get the actual pool ID
  // For this prototype, we'll return a mock ID
  return 'pool-' + Math.floor(Math.random() * 5);
}

// Estimate transaction size (simplified)
function estimateTransactionSize(transaction) {
  // In a real implementation, you would decode the transaction to get the actual size
  // For this prototype, we'll return a random value
  return Math.random() * 2000;
}

// Create an alert in the UI
function createAlert(type, message) {
  const alertElement = document.createElement('div');
  alertElement.className = `alert alert-${type}`;
  alertElement.textContent = message;
  
  // Add close button
  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'close-alert';
  closeButton.innerHTML = '&times;';
  closeButton.onclick = function() {
    alertsContainer.removeChild(alertElement);
  };
  
  alertElement.appendChild(closeButton);
  alertsContainer.prepend(alertElement);
  
  // Auto-remove after 30 seconds
  setTimeout(() => {
    if (alertElement.parentNode === alertsContainer) {
      alertsContainer.removeChild(alertElement);
    }
  }, 30000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  connectWalletBtn.addEventListener('click', connectWallet);
  startMonitoringBtn.addEventListener('click', startMonitoring);
  stopMonitoringBtn.addEventListener('click', stopMonitoring);
  
  // Initialize the app
  initialize();
});

// Export functions for testing
export {
  connectWallet,
  startMonitoring,
  stopMonitoring,
  assessSandwichRisk
};
