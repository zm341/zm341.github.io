let blockCount = 0;
let currentBalance = 10.00; // Starting ETH for demo purposes

function addLog(text, type) {
    const logs = document.getElementById('log-list');
    const div = document.createElement('div');
    div.className = `log-entry ${type}`;
    div.innerText = `> [${new Date().toLocaleTimeString()}] ${text}`;
    logs.appendChild(div);
    logs.scrollTop = logs.scrollHeight;
}

document.getElementById('record-btn').addEventListener('click', function() {
    const payer = "0x8f...E21";
    const payeeSelect = document.getElementById('payee');
    const payeeAddress = payeeSelect.value;
    // Extract name from the option text (everything before the parenthesis)
    const payeeName = payeeSelect.options[payeeSelect.selectedIndex].text.split(' (')[0];
    const amountInput = document.getElementById('amount');
    const amount = parseFloat(amountInput.value);

    addLog(`Initiating validation for ${payeeName}...`, "info");
    
    // 1. Basic Field Validation
    if(!amount || amount <= 0) {
        addLog("FAILURE: Transaction amount must be greater than 0.", "error");
        return;
    }

    // 2. Proof of Funds (Accounting Assertion: Existence)
    if(amount > currentBalance) {
        addLog(`CRITICAL: Insufficient funds in wallet. Current: ${currentBalance.toFixed(2)} ETH.`, "error");
        return;
    }

    // 3. Smart Contract Logic Execution
    currentBalance -= amount;
    blockCount++;
    addLog(`VERIFIED: Recipient ${payeeAddress} confirmed on whitelist.`, "success");
    addLog("SIGNING: Finalizing cryptographic Triple-Entry...", "info");

    const timestamp = new Date().toISOString();
    // Simulate a SHA-256 style hash
    const mockHash = btoa(payer + payeeAddress + amount + timestamp + blockCount).substring(0, 32).toUpperCase();

    // 4. Update the Consensus Ledger
    const blockHTML = `
        <div class="block-card">
            <div style="font-family: 'JetBrains Mono'; color: #58a6ff; font-size: 0.65rem; margin-bottom: 5px;">HASH: ${mockHash}</div>
            <div style="margin: 10px 0; font-weight: 600; font-size: 1.1rem;">${amount.toFixed(2)} ETH → ${payeeName}</div>
            <div style="display: flex; justify-content: space-between; font-size: 0.65rem; color: #8b949e; font-family: 'JetBrains Mono';">
                <span>INDEX: #${blockCount}</span>
                <span>STATUS: IMMUTABLE</span>
                <span>STATE_CHANGE: -${amount.toFixed(2)} ETH</span>
            </div>
        </div>
    `;
    
    const list = document.getElementById('blockchain-list');
    list.insertAdjacentHTML('afterbegin', blockHTML);
    
    // Update Stats Display
    document.getElementById('block-height').innerText = blockCount;
    amountInput.value = "";
    
    addLog(`BLOCK_FINALIZED: Ledger updated at Block #${blockCount}.`, "success");
});
