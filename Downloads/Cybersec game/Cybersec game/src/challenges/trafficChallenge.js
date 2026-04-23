// trafficChallenge.js — Trace malicious traffic
// Player must identify the malicious source IP from network logs

const trafficSets = [
    {
        maliciousIP: '192.168.44.13',
        logs: [
            { src: '10.0.0.5', dst: '10.0.0.1', proto: 'TCP', port: 443, info: 'HTTPS GET /api/status', mal: false },
            { src: '10.0.0.12', dst: '10.0.0.1', proto: 'TCP', port: 80, info: 'HTTP GET /index.html', mal: false },
            { src: '192.168.44.13', dst: '10.0.0.1', proto: 'TCP', port: 22, info: 'SSH BRUTE FORCE ATTEMPT #1', mal: true },
            { src: '10.0.0.8', dst: '10.0.0.3', proto: 'UDP', port: 53, info: 'DNS query: api.cybergrid.io', mal: false },
            { src: '192.168.44.13', dst: '10.0.0.1', proto: 'TCP', port: 22, info: 'SSH BRUTE FORCE ATTEMPT #2', mal: true },
            { src: '10.0.0.15', dst: '10.0.0.1', proto: 'TCP', port: 443, info: 'HTTPS POST /api/data', mal: false },
            { src: '192.168.44.13', dst: '10.0.0.2', proto: 'TCP', port: 3306, info: 'SQL INJECTION ATTEMPT', mal: true },
            { src: '10.0.0.3', dst: '10.0.0.7', proto: 'TCP', port: 8080, info: 'HTTP GET /health', mal: false },
            { src: '192.168.44.13', dst: '10.0.0.1', proto: 'TCP', port: 22, info: 'SSH BRUTE FORCE ATTEMPT #3', mal: true },
            { src: '10.0.0.9', dst: '10.0.0.1', proto: 'TCP', port: 443, info: 'HTTPS GET /dashboard', mal: false },
        ]
    },
    {
        maliciousIP: '172.16.99.42',
        logs: [
            { src: '10.0.1.5', dst: '10.0.1.1', proto: 'TCP', port: 443, info: 'HTTPS GET /login', mal: false },
            { src: '172.16.99.42', dst: '10.0.1.1', proto: 'TCP', port: 445, info: 'SMB EXPLOIT ATTEMPT', mal: true },
            { src: '10.0.1.10', dst: '10.0.1.2', proto: 'UDP', port: 53, info: 'DNS query: auth.grid.io', mal: false },
            { src: '172.16.99.42', dst: '10.0.1.3', proto: 'TCP', port: 3389, info: 'RDP BRUTE FORCE #1', mal: true },
            { src: '10.0.1.7', dst: '10.0.1.1', proto: 'TCP', port: 22, info: 'SSH session established', mal: false },
            { src: '172.16.99.42', dst: '10.0.1.1', proto: 'ICMP', port: 0, info: 'PING SWEEP DETECTED', mal: true },
            { src: '10.0.1.2', dst: '10.0.1.5', proto: 'TCP', port: 8443, info: 'HTTPS proxy forward', mal: false },
            { src: '172.16.99.42', dst: '10.0.1.4', proto: 'TCP', port: 21, info: 'FTP UNAUTHORIZED ACCESS', mal: true },
            { src: '10.0.1.8', dst: '10.0.1.1', proto: 'TCP', port: 443, info: 'HTTPS GET /api/nodes', mal: false },
            { src: '10.0.1.3', dst: '10.0.1.6', proto: 'TCP', port: 80, info: 'HTTP GET /status', mal: false },
        ]
    }
];

let currentSet = null;

export function createTrafficChallenge(container, label) {
    const idx = label.charCodeAt(label.length - 1) % trafficSets.length;
    currentSet = trafficSets[idx];

    container.innerHTML = '';

    // Traffic log display
    const logDiv = document.createElement('div');
    logDiv.className = 'traffic-log';

    for (const entry of currentSet.logs) {
        const line = document.createElement('div');
        line.className = entry.mal ? 'malicious' : 'normal';
        const portStr = entry.port ? `:${entry.port}` : '';
        line.textContent = `[${entry.proto}] ${entry.src} → ${entry.dst}${portStr} | ${entry.info}`;
        logDiv.appendChild(line);
    }
    container.appendChild(logDiv);

    // Input for malicious IP
    const inputDiv = document.createElement('div');
    inputDiv.className = 'traffic-input';
    inputDiv.innerHTML = `
    <label>Malicious Source IP:</label>
    <input type="text" id="traffic-ip-input" placeholder="e.g. 192.168.1.1" autocomplete="off" />
  `;
    container.appendChild(inputDiv);
}

export function checkTrafficChallenge(container) {
    if (!currentSet) return false;
    const input = container.querySelector('#traffic-ip-input');
    return input && input.value.trim() === currentSet.maliciousIP;
}
