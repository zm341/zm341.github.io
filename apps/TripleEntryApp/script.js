let blockCount = 0;
let currentBalance = 0.00; // Starting at zero for audit integrity

function addLog(text, type) {
    const logs = document.getElementById('log-list');
    const div = document.createElement('div');
    div.className = `log-entry ${type}`;
    div.innerText = `> [${new Date().toLocaleTimeString()}] ${text}`;
    logs.appendChild(div);
    logs.scrollTop = logs.scrollHeight;
}

function updateStats() {
    document.getElementById('block-height').innerText = blockCount;
    document.getElementById('balance-display').innerText = currentBalance.toFixed(2);
}

// --- DEPOSIT LOGIC ---
document.getElementById('deposit-btn').addEventListener('click', function() {
    const amount = parseFloat(document.getElementById('amount').value);
    
    if(!amount || amount <= 0) {
        addLog("FAILURE: Enter a valid deposit amount.", "error");
        return;
    }

    currentBalance += amount;
    blockCount++;
    addLog(`LIQUIDITY_INJECTION: +${amount.toFixed(2)} ETH added to Treasury.`, "success");

    const timestamp = new Date().toISOString();
    const mockHash = btoa("MINT" + amount + timestamp + blockCount).substring(0, 32).toUpperCase();

    const blockHTML = `
        <div class="block-card" style="border-left: 4px solid var(--accent);">
            <div style="font-family: 'JetBrains Mono'; color: var(--accent); font-size: 0.65rem; margin-bottom: 5px;">MINT_HASH: ${mockHash}</div>
            <div style="margin: 10px 0; font-weight: 600; font-size: 1.1rem; color: var(--accent);">+ ${amount.toFixed(2)} ETH DEPOSITED</div>
            <div style="display: flex; justify-content: space-between; font-size: 0.65rem; color: #8b949e; font-family: 'JetBrains Mono';">
                <span>SOURCE: TREASURY_RESERVE</span>
                <span>STATE: CONFIRMED</span>
            </div>
        </div>
    `;
    
    document.getElementById('blockchain-list').insertAdjacentHTML('afterbegin', blockHTML);
    updateStats();
    document.getElementById('amount').value = "";
});

// --- PAYMENT LOGIC ---
document.getElementById('record-btn').addEventListener('click', function() {
    const payer = "0x8f...E21";
    const payeeSelect = document.getElementById('payee');
    const payeeAddress = payeeSelect.value;
    const payeeName = payeeSelect.options[payeeSelect.selectedIndex].text.split(' (')[0];
    const amountInput = document.getElementById('amount');
    const amount = parseFloat(amountInput.value);

    addLog(`Initiating validation for ${payeeName}...`, "info");
    
    if(!amount || amount <= 0) {
        addLog("FAILURE: Transaction amount must be greater than 0.", "error");
        return;
    }

    if(amount > currentBalance) {
        addLog(`CRITICAL: Insufficient funds. Required: ${amount.toFixed(2)} ETH.`, "error");
        return;
    }

    currentBalance -= amount;
    blockCount++;
    addLog(`VERIFIED: Recipient whitelist confirmation successful.`, "success");

    const timestamp = new Date().toISOString();
    const mockHash = btoa(payer + payeeAddress + amount + timestamp + blockCount).substring(0, 32).toUpperCase();

    const blockHTML = `
        <div class="block-card">
            <div style="font-family: 'JetBrains Mono'; color: #58a6ff; font-size: 0.65rem; margin-bottom: 5px;">TX_HASH: ${mockHash}</div>
            <div style="margin: 10px 0; font-weight: 600; font-size: 1.1rem;">${amount.toFixed(2)} ETH → ${payeeName}</div>
            <div style="display: flex; justify-content: space-between; font-size: 0.65rem; color: #8b949e; font-family: 'JetBrains Mono';">
                <span>INDEX: #${blockCount}</span>
                <span>STATUS: IMMUTABLE</span>
            </div>
        </div>
    `;
    
    document.getElementById('blockchain-list').insertAdjacentHTML('afterbegin', blockHTML);
    updateStats();
    amountInput.value = "";
});
