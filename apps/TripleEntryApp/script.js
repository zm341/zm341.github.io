let blockCount = 0;
const INITIAL_BALANCE = 5.00;
let currentBalance = INITIAL_BALANCE;

document.getElementById('record-btn').addEventListener('click', function() {
    const payer = "0x8f...E21";
    const payee = document.getElementById('payee').value || "0xNULL";
    const amount = parseFloat(document.getElementById('amount').value);

    // 1. Logic Validation (The Smart Contract Audit)
    addLog("Initiating validation check...", "info");
    
    if(!amount || amount <= 0) {
        addLog("FAILURE: Invalid amount parameter.", "error");
        return;
    }

    if(amount > currentBalance) {
        addLog(`CRITICAL: Insufficient funds. Balance: ${currentBalance} ETH.`, "error");
        return;
    }

    // 2. Successful Execution
    currentBalance -= amount;
    blockCount++;
    addLog("LOGIC_PASS: Contract conditions met.", "success");
    addLog("SIGNING: Generating cryptographic receipt...", "info");

    // 3. Generate Mock Hash
    const timestamp = new Date().toISOString();
    const mockHash = btoa(payer + payee + amount + timestamp).substring(0, 32);

    // 4. Update UI
    const blockHTML = `
        <div class="block-card">
            <div style="font-family: 'JetBrains Mono'; color: #58a6ff; font-size: 0.7rem;">TX_HASH: ${mockHash}</div>
            <div style="margin: 8px 0; font-weight: 600;">${amount} ETH transferred to ${payee}</div>
            <div style="display: flex; justify-content: space-between; font-size: 0.65rem; color: #8b949e;">
                <span>GAS_USED: 21,000</span>
                <span>NONCE: ${blockCount}</span>
            </div>
        </div>
    `;
    
    const list = document.getElementById('blockchain-list');
    list.insertAdjacentHTML('afterbegin', blockHTML);
    document.getElementById('block-height').innerText = blockCount;
    
    // Clear inputs
    document.getElementById('amount').value = "";
    addLog(`BLOCK_CONFIRMED: Transaction recorded at index ${blockCount}.`, "success");
});

function addLog(text, type) {
    const logs = document.getElementById('log-list');
    const div = document.createElement('div');
    div.className = `log-entry ${type}`;
    div.innerText = `> [${new Date().toLocaleTimeString()}] ${text}`;
    logs.appendChild(div);
    logs.scrollTop = logs.scrollHeight;
}
