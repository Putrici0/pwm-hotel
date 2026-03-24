document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const step1 = document.getElementById('step-1');
        const step2 = document.getElementById('step-2');
        const step3 = document.getElementById('step-3');

        const btn1 = document.getElementById('btn-step-1');
        const btn2 = document.getElementById('btn-step-2');
        const btn3 = document.getElementById('btn-step-3');

        const emailInput = document.getElementById('reset-email');
        const codeInput = document.getElementById('reset-code');
        const pass1 = document.getElementById('reset-pass-1');
        const pass2 = document.getElementById('reset-pass-2');

        const err1 = document.getElementById('reset-error-1');
        const err2 = document.getElementById('reset-error-2');
        const err3 = document.getElementById('reset-error-3');

        const toggle1 = document.getElementById('toggle-reset-1');
        const toggle2 = document.getElementById('toggle-reset-2');

        let targetEmail = '';

        if (toggle1 && pass1) {
            toggle1.addEventListener('click', () => {
                pass1.setAttribute('type', pass1.getAttribute('type') === 'password' ? 'text' : 'password');
            });
        }

        if (toggle2 && pass2) {
            toggle2.addEventListener('click', () => {
                pass2.setAttribute('type', pass2.getAttribute('type') === 'password' ? 'text' : 'password');
            });
        }

        if (codeInput) {
            codeInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
            });
        }

        if (btn1) {
            btn1.addEventListener('click', () => {
                err1.style.display = 'none';
                const email = emailInput.value.trim();
                const savedEmail = localStorage.getItem('savedUserEmail');

                if (email === 'user@ulpgc.es' || (savedEmail && email === savedEmail)) {
                    targetEmail = email;
                    step1.style.display = 'none';
                    step2.style.display = 'block';
                } else {
                    err1.textContent = 'El correo electrónico no está registrado.';
                    err1.style.display = 'block';
                }
            });
        }

        if (btn2) {
            btn2.addEventListener('click', () => {
                err2.style.display = 'none';
                const code = codeInput.value;

                if (code === '123456') {
                    step2.style.display = 'none';
                    step3.style.display = 'block';
                } else {
                    err2.textContent = 'Código incorrecto. El código de prueba es 123456.';
                    err2.style.display = 'block';
                }
            });
        }

        if (btn3) {
            btn3.addEventListener('click', () => {
                err3.style.display = 'none';
                const p1 = pass1.value;
                const p2 = pass2.value;
                const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[?!*]).{6,}$/;

                if (p1 !== p2) {
                    err3.textContent = 'Las contraseñas no coinciden.';
                    err3.style.display = 'block';
                    return;
                }

                if (!regex.test(p1)) {
                    err3.textContent = 'La contraseña debe tener al menos 6 caracteres, una mayúscula, un número y un carácter especial (? ! *).';
                    err3.style.display = 'block';
                    return;
                }

                if (targetEmail !== 'user@ulpgc.es') {
                    localStorage.setItem('savedUserPassword', p1);
                }

                window.location.href = 'login.html';
            });
        }
    }, 500);
});