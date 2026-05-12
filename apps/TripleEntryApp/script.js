document.getElementById('record-btn').addEventListener('click', function() {
    const payer = document.getElementById('payer').value || "N/A";
    const payee = document.getElementById('payee').value || "N/A";
    const amount = document.getElementById('amount').value || "0";

    if(amount === "0") return alert("Please enter an amount.");

    const timestamp = new Date().toLocaleTimeString();
    
    // Create Traditional Entries
    addEntry('payer-list', `DEBIT: $${amount} to ${payee}`);
    addEntry('payee-list', `CREDIT: $${amount} from ${payer}`);

    // Create Triple-Entry (Blockchain)
    // Simulating a hash
    const signature = btoa(payer + payee + amount + timestamp).substring(0, 16);
    const blockchainEntry = `
        <div class="entry" style="border-left: 2px solid #3b82f6">
            <div style="color: #3b82f6">[BLOCK_SIGNED]</div>
            <div>${payer} → ${payee}: $${amount}</div>
            <div style="font-size: 0.6rem; color: #64748b">HASH: ${signature}</div>
            <div style="font-size: 0.6rem; color: #64748b">${timestamp}</div>
        </div>
    `;
    document.getElementById('blockchain-list').innerHTML += blockchainEntry;

    // Reset Inputs
    document.getElementById('amount').value = "";
});

function addEntry(listId, text) {
    const list = document.getElementById(listId);
    const div = document.createElement('div');
    div.className = 'entry';
    div.innerText = text;
    list.appendChild(div);
}