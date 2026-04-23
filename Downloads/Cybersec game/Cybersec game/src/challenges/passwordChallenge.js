// passwordChallenge.js — Identify weak passwords
// Player must select all weak passwords from a list

const passwordSets = [
    {
        passwords: [
            { text: 'password123', weak: true },
            { text: 'Tr0ub4dor&3', weak: false },
            { text: 'admin', weak: true },
            { text: 'xK9$mP2!qL7@nR4', weak: false },
            { text: '123456', weak: true },
            { text: 'qwerty', weak: true },
            { text: 'B1u3$ky#R41n!', weak: false },
            { text: 'letmein', weak: true },
        ]
    },
    {
        passwords: [
            { text: 'iloveyou', weak: true },
            { text: 'f7G!kL9#mN2$pQ', weak: false },
            { text: 'abc123', weak: true },
            { text: '!Cyb3rGr1d#S3c', weak: false },
            { text: 'dragon', weak: true },
            { text: 'p@$$w0rd', weak: true },
            { text: 'Zx8&Yq5*Wn3!Kj', weak: false },
            { text: 'master', weak: true },
        ]
    }
];

let currentSet = null;

export function createPasswordChallenge(container, label) {
    // Pick a set based on label hash
    const idx = label.charCodeAt(label.length - 1) % passwordSets.length;
    currentSet = passwordSets[idx];

    container.innerHTML = '';

    for (let i = 0; i < currentSet.passwords.length; i++) {
        const pw = currentSet.passwords[i];
        const item = document.createElement('div');
        item.className = 'password-item';
        item.dataset.index = i;
        item.innerHTML = `
      <div class="pw-check"></div>
      <div class="pw-text">${pw.text}</div>
    `;
        item.addEventListener('click', () => {
            item.classList.toggle('selected');
        });
        container.appendChild(item);
    }
}

export function checkPasswordChallenge(container) {
    if (!currentSet) return false;

    const items = container.querySelectorAll('.password-item');
    let correct = true;

    for (let i = 0; i < items.length; i++) {
        const isSelected = items[i].classList.contains('selected');
        const shouldBeSelected = currentSet.passwords[i].weak;
        if (isSelected !== shouldBeSelected) {
            correct = false;
            break;
        }
    }

    return correct;
}
