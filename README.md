

# Sandwich Attack Detector for Solana

A real-time monitoring tool designed to detect and alert users about potential sandwich attacks on decentralized exchanges (DEXes) within the Solana ecosystem.

## 📖 What Are Sandwich Attacks?

Sandwich attacks are a common exploit in decentralized finance (DeFi) where malicious actors target pending transactions in the mempool:

1. A legitimate user submits a transaction to swap tokens on a DEX
2. An attacker spots this transaction in the mempool
3. The attacker quickly executes a buy transaction (front-running)
4. The user's original transaction executes at a worse price
5. The attacker quickly executes a sell transaction (back-running)
6. The attacker profits from the price impact of the user's transaction

These attacks are particularly common on high-volume DEXes with low liquidity pools.

## ✨ Features

- 🔗 **Wallet Integration:** Connect easily with your Phantom wallet.
- 🚨 **Real-time Monitoring:** Instantly detect potential sandwich attack scenarios.
- ⚙️ **Customizable Sensitivity:** Set configurable thresholds to suit your trading strategy.
- 📚 **Educational Resources:** Learn about sandwich attacks directly within the tool.

## 🚀 Installation & Setup

1. **Clone the Repository**
```bash
git clone https://github.com/Zireaelst/Sandwich-Attack-Alert-Tool-for-Solana
cd sandwich-attack-detector

2. Install Dependencies
npm install

3. Launch the App
npm run dev
```

## 🛠️ Usage

1. Launch your browser and navigate to `http://localhost:8080`.
2. Connect your Phantom wallet by clicking "Connect Wallet".
3. Adjust detection thresholds (optional, recommended).
4. Press "Start Monitoring".
5. Receive alerts when suspicious transaction patterns indicating a sandwich attack are detected.

## ⚙️ Configuration Options

- **Slippage Threshold (default: 1%)** – Maximum allowed slippage.
- **Price Impact Warning Threshold (default: 0.5%)** – Minimum price impact that triggers an alert.
- **Pool Activity Threshold (default: 3 transactions)** – Minimum number of transactions in the same pool considered suspicious.
- **Time Window (default: 60 seconds)** – Monitoring period to detect suspicious activities.


## 📂 Project Structure

A quick overview of key files and directories:


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

## 🚧 Future Improvements

- 🔌 Add integration support for more Solana wallets (Solflare, Sollet).
- ⚡ Implement WebSocket connections for instantaneous transaction monitoring.
- 🌐 Develop a browser extension for easier user interaction.
- 📢 Implement real-time notifications (email, SMS, push notifications).
- 📈 Include historical analytics to assess past transaction risks.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ⚠️ Disclaimer

This tool helps detect potential sandwich attacks but **cannot prevent** attacks from occurring. Always exercise caution during transactions on decentralized exchanges and consider additional protective measures such as private RPC endpoints, hardware wallets, or professional security audits for high-value trades.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
