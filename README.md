# Sandwich Attack Detector for Solana

A tool for monitoring and detecting potential sandwich attacks on Solana DEX transactions.

## What are Sandwich Attacks?

Sandwich attacks are a common exploit in decentralized finance (DeFi) where malicious actors target pending transactions in the mempool:

1. A legitimate user submits a transaction to swap tokens on a DEX
2. An attacker spots this transaction in the mempool
3. The attacker quickly executes a buy transaction (front-running)
4. The user's original transaction executes at a worse price
5. The attacker quickly executes a sell transaction (back-running)
6. The attacker profits from the price impact of the user's transaction

These attacks are particularly common on high-volume DEXes with low liquidity pools.

## Features

- Connect to Phantom wallet
- Monitor transactions for potential sandwich attack conditions
- Alert users when suspicious transaction patterns are detected
- Configurable thresholds for detection sensitivity
- Educational information about sandwich attacks

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/sandwich-attack-detector.git
cd sandwich-attack-detector

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Usage

1. Open your browser and navigate to the application
2. Connect your Phantom wallet
3. Configure detection thresholds (optional)
4. Click "Start Monitoring"
5. The tool will alert you when it detects potential sandwich attack conditions

## Configuration Options

- **Slippage Threshold**: Maximum tolerated slippage percentage
- **Price Impact Warning Threshold**: Minimum price impact to trigger warnings
- **Pool Activity Threshold**: Number of transactions in the same pool to consider suspicious
- **Time Window**: Time period (in seconds) to monitor for suspicious activity

## Project Structure

```
sandwich-attack-detector/
├── public/               # Static assets and HTML
│   ├── css/              # Stylesheets
│   │   └── styles.css    # Main stylesheet
│   └── index.html        # Main HTML file
├── src/                  # Source code
│   ├── js/               # JavaScript files
│   │   ├── config.js     # Configuration settings
│   │   └── sandwich-attack-detector.js  # Main application code
│   └── components/       # Component files (future expansion)
├── tests/                # Test files (future expansion)
├── package.json          # Project metadata and dependencies
└── README.md             # Project documentation
```

## Future Improvements

- Add support for more wallets beyond Phantom
- Implement WebSocket connection for real-time mempool monitoring
- Develop a browser extension version
- Create a notification system (email, push, etc.)
- Add historical analysis of past transactions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This tool provides detection capabilities but cannot prevent sandwich attacks from occurring. Always use caution when trading on DEXes and consider using private RPC endpoints or other protection mechanisms for high-value transactions.