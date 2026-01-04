const { ethers } = require("ethers");

// --- CONFIGURATION ---

// 1. The Contract Address you provided
const CONTRACT_ADDRESS = "0x432797F45FD2170B4554db426D5be514a6451494";

// 2. Your RPC URL (e.g., 'https://sepolia.infura.io/v3/...' or 'http://127.0.0.1:8545')
const RPC_URL = "YOUR_RPC_URL_HERE";

// 3. The Test Wallets (ADD YOUR PRIVATE KEYS HERE)
// WARNING: Use TEST ACCOUNTS only. Never use real funds.
const PRIVATE_KEYS = [
    "0x...key1...",
    "0x...key2...",
    "0x...key3..." 
];

// --- THE SCRIPT ---

const minimalABI = [
    "function pullUp() external",
    "function pullDown() external",
    "function gameScore() view returns (int256)",
    "event ScoreUpdate(address indexed player, int256 newScore)"
];

async function main() {
    console.log("⚔️  Preparing for War...");
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    // Create Wallet Instances
    const wallets = PRIVATE_KEYS.map(key => new ethers.Wallet(key, provider));
    console.log(`✅ Loaded ${wallets.length} wallets ready to battle.`);

    // Create a read-only contract instance for monitoring
    const monitorContract = new ethers.Contract(CONTRACT_ADDRESS, minimalABI, provider);
    
    // Listen for events to log progress in real-time
    console.log("listening for events...");
    monitorContract.on("ScoreUpdate", (player, newScore) => {
        console.log(`[EVENT] Player ${player.slice(0,6)} moved rope to: ${newScore}`);
    });

    // --- ATTACK LOOP ---
    // This loop fires transactions from random wallets as fast as possible
    
    const iterations = 50; // How many total moves to make
    
    for (let i = 0; i < iterations; i++) {
        // 1. Pick a random wallet
        const randomWallet = wallets[Math.floor(Math.random() * wallets.length)];
        
        // 2. Connect wallet to contract
        const gameContract = new ethers.Contract(CONTRACT_ADDRESS, minimalABI, randomWallet);

        // 3. Pick a side (50/50 chance)
        // If you want to force a win, change this logic to always pick one side
        const isTeamUp = Math.random() < 0.5; 
        
        try {
            let tx;
            if (isTeamUp) {
                console.log(`Step ${i+1}: Wallet ${randomWallet.address.slice(0,6)} pulling UP...`);
                tx = await gameContract.pullUp();
            } else {
                console.log(`Step ${i+1}: Wallet ${randomWallet.address.slice(0,6)} pulling DOWN...`);
                tx = await gameContract.pullDown();
            }
            
            // We do NOT await tx.wait() here because we want to spam the network
            // If you get nonce errors, you might need to await.
            console.log(`   -> Tx Sent: ${tx.hash}`);
            
        } catch (error) {
            console.error(`   -> Error: ${error.reason || error.message}`);
        }
        
        // Optional: Small delay to prevent complete RPC rate limiting
        await new Promise(r => setTimeout(r, 1000));
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});