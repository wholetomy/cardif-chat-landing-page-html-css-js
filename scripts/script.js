window.onload = function () {
    PreencherImagemDoParceiro();
    configurarValidadorDeDocumento();
    configurarBotaoDeAtendimento();
    PreencherDropDownDeAssuntos();
};

function PreencherDropDownDeAssuntos() {
    fetch('/json/assuntos.json')
        .then(response => response.json())
        .then(data => {
            data.sort((a, b) => a.assunto.localeCompare(b.assunto));
            const selectAssunto = document.getElementById('assunto');
            data.forEach(item => {
                let option = document.createElement('option');
                option.value = item.id;
                option.textContent = item.assunto;
                selectAssunto.appendChild(option);
            });
        })
        .catch(error => console.error('Erro ao carregar o JSON:', error));
}

function PreencherImagemDoParceiro() {
    const urlParams = new URLSearchParams(window.location.search);
    const partnerId = urlParams.get('partner');
    if (!partnerId) {
        console.warn('Parâmetro "partner" não encontrado na URL. Usando fallback.');
        exibirImagemFallback();
        return;
    }
    fetch('/json/imagens.json')
        .then(response => response.json())
        .then(data => {
            const imagem = data.find(item => item.cod_campanha == partnerId);
            if (imagem) {
                const imagemUrl = `/images/${imagem.titulo}`;
                exibirImagem(imagemUrl);
            } else {
                console.warn(`Não foi encontrada uma imagem para o partner ${partnerId}. Usando fallback.`);
                exibirImagemFallback();
            }
        })
        .catch(error => {
            console.error('Erro ao carregar o JSON de imagens:', error);
            exibirImagemFallback();
        });
}

function exibirImagem(imagemUrl) {
    const logoImg = document.getElementById('logo');
    logoImg.src = imagemUrl;
}

function exibirImagemFallback() {
    const logoImg = document.getElementById('logo');
    logoImg.src = '/images/cardif_logo.png';
}

function configurarValidadorDeDocumento() {
    const tipoDocumento = document.getElementById('tipoDocumento');
    const inputDocumento = document.getElementById('inputDocumento');
    const erroDocumento = document.getElementById('erroDocumento');
    const labelDocumento = document.getElementById('labelDocumento');
    tipoDocumento.addEventListener('change', function() {
        labelDocumento.textContent = tipoDocumento.value;
        inputDocumento.value = '';
        erroDocumento.style.display = 'none';
        if (tipoDocumento.value === 'CPF') {
            inputDocumento.maxLength = 11;
        } else {
            inputDocumento.maxLength = 14;
        }
    });
    inputDocumento.addEventListener('input', function() {
        const valor = inputDocumento.value;
        const tipo = tipoDocumento.value;
        let valido = false;
        if (tipo === 'CPF') {
            valido = ValidarCPF(valor);
        } else if (tipo === 'CNPJ') {
            valido = ValidarCNPJ(valor);
        }
        if (valido) {
            erroDocumento.style.display = 'none';
        } else {
            erroDocumento.style.display = 'block';
        }
    });
}

function ValidarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11) return false;
    let soma = 0;
    let resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    return true;
}

function ValidarCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]+/g, '');
    if (cnpj.length !== 14) return false;
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(0))) return false;
    tamanho += 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(1))) return false;
    return true;
}

function configurarBotaoDeAtendimento() {
    const btnIniciarAtendimento = document.getElementById('btnIniciarAtendimento');
    const nome = document.getElementById('nome');
    const inputDocumento = document.getElementById('inputDocumento');
    const erroDocumento = document.getElementById('erroDocumento');
    const tipoDocumento = document.getElementById('tipoDocumento');
    const assunto = document.getElementById('assunto');
    const urlParams = new URLSearchParams(window.location.search);
    const partnerId = urlParams.get('partner');

    btnIniciarAtendimento.addEventListener('click', function() {
        if (nome.value === '' || inputDocumento.value === '' || assunto.value === '') {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        const valorDocumento = inputDocumento.value;
        const tipo = tipoDocumento.value;
        let valido = false;

        if (tipo === 'CPF') {
            valido = ValidarCPF(valorDocumento);
        } else if (tipo === 'CNPJ') {
            valido = ValidarCNPJ(valorDocumento);
        }

        if (!valido) {
            erroDocumento.style.display = 'block';
            alert('Por favor, preencha o documento corretamente.');
            return;
        }

        const botParams = {
            name: nome.value,
            identifier: valorDocumento,
            partnerId: partnerId,
            partnerName: '',
            subject: assunto.value
        };

        localStorage.setItem('botParams', JSON.stringify(botParams));

        window.location.href = 'chat.html';
    });
}
