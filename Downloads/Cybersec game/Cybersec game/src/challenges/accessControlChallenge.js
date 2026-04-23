// accessControlChallenge.js — Configure ACL rules
// Player must set correct ALLOW/DENY for each traffic rule

const aclSets = [
    {
        rules: [
            { text: 'Internal → Database Server (Port 3306)', correct: 'ALLOW', desc: 'Internal database access' },
            { text: 'External → SSH (Port 22)', correct: 'DENY', desc: 'Block external SSH' },
            { text: 'Internal → Web Server (Port 443)', correct: 'ALLOW', desc: 'HTTPS traffic' },
            { text: 'External → Telnet (Port 23)', correct: 'DENY', desc: 'Insecure protocol' },
            { text: 'Internal → DNS Server (Port 53)', correct: 'ALLOW', desc: 'DNS resolution' },
            { text: 'External → SMTP (Port 25)', correct: 'DENY', desc: 'Block spam relay' },
        ]
    },
    {
        rules: [
            { text: 'Internal → File Server (Port 445)', correct: 'ALLOW', desc: 'Internal SMB' },
            { text: 'External → RDP (Port 3389)', correct: 'DENY', desc: 'Block external RDP' },
            { text: 'Internal → LDAP (Port 389)', correct: 'ALLOW', desc: 'Directory services' },
            { text: 'External → FTP (Port 21)', correct: 'DENY', desc: 'Insecure file transfer' },
            { text: 'Internal → HTTPS Proxy (Port 8443)', correct: 'ALLOW', desc: 'Secure proxy' },
            { text: 'External → MySQL (Port 3306)', correct: 'DENY', desc: 'Block external DB' },
        ]
    }
];

let currentSet = null;

export function createAccessControlChallenge(container, label) {
    const idx = label.charCodeAt(label.length - 1) % aclSets.length;
    currentSet = aclSets[idx];

    container.innerHTML = '';

    for (let i = 0; i < currentSet.rules.length; i++) {
        const rule = currentSet.rules[i];
        const item = document.createElement('div');
        item.className = 'acl-rule';
        item.innerHTML = `
      <div class="rule-text">${rule.text}</div>
      <select data-index="${i}">
        <option value="">-- SELECT --</option>
        <option value="ALLOW">ALLOW</option>
        <option value="DENY">DENY</option>
      </select>
    `;
        container.appendChild(item);
    }
}

export function checkAccessControlChallenge(container) {
    if (!currentSet) return false;

    const selects = container.querySelectorAll('select');
    let correct = true;

    for (let i = 0; i < selects.length; i++) {
        if (selects[i].value !== currentSet.rules[i].correct) {
            correct = false;
            break;
        }
    }

    return correct;
}
