// restoreChallenge.js — Restore compromised system
// Player must drag commands into the correct order

const restoreSets = [
    {
        // Correct order: isolate → backup logs → kill malware → patch → restart → verify
        commands: [
            { text: 'systemctl restart services', order: 5 },
            { text: 'kill -9 $(pgrep malware_proc)', order: 3 },
            { text: 'iptables -A INPUT -j DROP', order: 1 },
            { text: 'cp /var/log/syslog /backup/', order: 2 },
            { text: 'apt-get update && apt-get upgrade', order: 4 },
            { text: 'integrity_check --verify-all', order: 6 },
        ]
    },
    {
        // Correct order: disconnect → snapshot → remove backdoor → update creds → reconnect → audit
        commands: [
            { text: 'audit_trail --full-scan', order: 6 },
            { text: 'ifconfig eth0 down', order: 1 },
            { text: 'passwd --expire root', order: 4 },
            { text: 'rm -rf /tmp/.hidden_backdoor', order: 3 },
            { text: 'dd if=/dev/sda of=/backup/disk.img', order: 2 },
            { text: 'ifconfig eth0 up', order: 5 },
        ]
    }
];

let currentSet = null;
let currentOrder = [];

export function createRestoreChallenge(container, label) {
    const idx = label.charCodeAt(label.length - 1) % restoreSets.length;
    currentSet = restoreSets[idx];

    // Shuffle commands
    const shuffled = [...currentSet.commands].sort(() => Math.random() - 0.5);
    currentOrder = shuffled.map((_, i) => i);

    container.innerHTML = '';

    const cmdDiv = document.createElement('div');
    cmdDiv.className = 'restore-commands';
    cmdDiv.id = 'restore-cmd-list';

    for (let i = 0; i < shuffled.length; i++) {
        const cmd = shuffled[i];
        const item = document.createElement('div');
        item.className = 'restore-cmd';
        item.draggable = true;
        item.dataset.origIndex = i;
        item.dataset.correctOrder = cmd.order;
        item.innerHTML = `
      <div class="cmd-order">${i + 1}</div>
      <div class="cmd-text">$ ${cmd.text}</div>
      <div class="drag-handle">⠿</div>
    `;
        cmdDiv.appendChild(item);
    }
    container.appendChild(cmdDiv);

    // Setup drag and drop
    setupDragDrop(cmdDiv);
}

function setupDragDrop(container) {
    let draggedEl = null;

    container.addEventListener('dragstart', (e) => {
        draggedEl = e.target.closest('.restore-cmd');
        if (draggedEl) {
            draggedEl.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        }
    });

    container.addEventListener('dragend', () => {
        if (draggedEl) {
            draggedEl.classList.remove('dragging');
            draggedEl = null;
            updateOrderNumbers(container);
        }
    });

    container.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(container, e.clientY);
        if (draggedEl) {
            if (afterElement == null) {
                container.appendChild(draggedEl);
            } else {
                container.insertBefore(draggedEl, afterElement);
            }
        }
    });
}

function getDragAfterElement(container, y) {
    const elements = [...container.querySelectorAll('.restore-cmd:not(.dragging)')];
    return elements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function updateOrderNumbers(container) {
    const items = container.querySelectorAll('.restore-cmd');
    items.forEach((item, i) => {
        item.querySelector('.cmd-order').textContent = i + 1;
    });
}

export function checkRestoreChallenge(container) {
    if (!currentSet) return false;
    const items = container.querySelectorAll('.restore-cmd');
    let correct = true;

    items.forEach((item, i) => {
        const expectedOrder = i + 1;
        const actualOrder = parseInt(item.dataset.correctOrder);
        if (expectedOrder !== actualOrder) {
            correct = false;
        }
    });

    return correct;
}
