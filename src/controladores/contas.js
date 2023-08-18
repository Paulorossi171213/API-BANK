let { banco, contas, saques, depositos, transferencias } = require('../bancoDeDados/bancoDeDados')

let bancoDeDados = require('../bancoDeDados/bancoDeDados')

let { format } = require('date-fns')




const listarContas = (req, res) => {
    const senhaBanco = req.query.senha_banco;
    if (!senhaBanco) {
        return res.status(400).json({ mensagem: 'A senha do banco não foi informada.' });
    }

    const senhaDoBanco = '123';
    if (senhaBanco !== senhaDoBanco) {
        return res.status(401).json({ mensagem: 'A senha do banco está incorreta.' });
    }


    const contasEncontradas = contas;
    res.status(200).json(contasEncontradas);
}

const criarConta = (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;


    if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
        return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios' });
    }


    if (bancoDeDados.contas.some(conta => conta.usuario.cpf === cpf)) {
        return res.status(400).json({ mensagem: 'CPF já cadastrado' });
    }

    if (bancoDeDados.contas.some(conta => conta.usuario.email === email)) {
        return res.status(400).json({ mensagem: 'E-mail já cadastrado' });
    }


    const numeroConta = (bancoDeDados.contas.length + 1).toString();


    const novaConta = {
        numero: numeroConta,
        saldo: 0,
        usuario: {
            nome,
            cpf,
            data_nascimento,
            telefone,
            email,
            senha
        }
    };


    bancodedados.contas.push(novaConta);


    res.status(201).json(novaConta);


}

const atualizarUsuarioConta = (req, res) => {
    const numeroConta = req.params.numeroConta;

    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;


    const contaExistente = contas.find(conta => conta.numero === numeroConta);

    if (!contaExistente) {
        return res.status(404).json({ mensagem: "Conta não encontrada!" });
    }


    if (!nome && !cpf && !data_nascimento && !telefone && !email && !senha) {
        return res.status(400).json({ mensagem: "Informe ao menos um campo para atualizar!" });
    }


    if (cpf) {
        const cpfExistente = contas.some(conta => conta.numero !== numeroConta && conta.usuario.cpf === cpf);
        if (cpfExistente) {
            return res.status(400).json({ mensagem: "CPF já cadastrado em outra conta!" });
        }
    }


    if (email) {
        const emailExistente = contas.some(conta => conta.numero !== numeroConta && conta.usuario.email === email);
        if (emailExistente) {
            return res.status(400).json({ mensagem: "E-mail já cadastrado em outra conta!" });
        }
    }


    const usuario = contaExistente.usuario;

    if (nome) {
        usuario.nome = nome;
    }

    if (cpf) {
        usuario.cpf = cpf;
    }

    if (data_nascimento) {
        usuario.data_nascimento = data_nascimento;
    }

    if (telefone) {
        usuario.telefone = telefone;
    }

    if (email) {
        usuario.email = email;
    }

    if (senha) {
        usuario.senha = senha;
    }

    return res.status(200).json({ mensagem: "Conta atualizada com sucesso" });
}

const excluirConta = (req, res) => {
    const numeroConta = req.params.numeroConta;


    const contaExistenteIndex = contas.findIndex(conta => conta.numero === numeroConta);

    if (contaExistenteIndex === -1) {
        return res.status(404).json({ mensagem: "Conta não encontrada!" });
    }


    if (contas[contaExistenteIndex].saldo !== 0) {
        return res.status(400).json({ mensagem: "Não é permitido excluir conta com saldo em conta!" });
    }


    contas.splice(contaExistenteIndex, 1);

    return res.status(200).json({ mensagem: "Conta excluída com sucesso" });

}

const depositar = (req, res) => {
    const { numero_conta, valor } = req.body;


    const contaExistenteIndex = bancoDeDados.contas.findIndex(conta => conta.numero === numero_conta);

    if (contaExistenteIndex === -1) {
        return res.status(404).json({ mensagem: "Conta não encontrada!" });
    }


    if (valor <= 0) {
        return res.status(400).json({ mensagem: "Valor do depósito deve ser maior que zero!" });
    }


    bancoDeDados.contas[contaExistenteIndex].saldo += valor;


    const data = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

    const deposito = {
        data,
        numero_conta,
        valor
    };
    bancoDeDados.depositos.push(deposito);

    return res.status(200).json({ mensagem: "Depósito realizado com sucesso" });
};


const sacar = (req, res) => {

    const { numero_conta, valor, senha } = req.body;


    const contaExistenteIndex = bancoDeDados.contas.findIndex(conta => conta.numero === numero_conta);

    if (contaExistenteIndex === -1) {
        return res.status(404).json({ mensagem: "Conta não encontrada!" });
    }


    if (bancoDeDados.contas[contaExistenteIndex].usuario.senha !== senha) {
        return res.status(401).json({ mensagem: "Senha incorreta!" });
    }


    if (valor <= 0) {
        return res.status(400).json({ mensagem: "Valor do saque deve ser maior que zero!" });
    }


    if (valor > bancoDeDados.contas[contaExistenteIndex].saldo) {
        return res.status(400).json({ mensagem: "Saldo insuficiente para realizar o saque!" });
    }


    bancoDeDados.contas[contaExistenteIndex].saldo -= valor;

    const data = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const saque = {
        data,
        numero_conta,
        valor
    };
    bancoDeDados.saques.push(saque);

    return res.status(200).json({ mensagem: "Saque realizado com sucesso" });

}

const transferir = (req, res) => {
    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;


    const contaOrigemIndex = bancoDeDados.contas.findIndex(conta => conta.numero === numero_conta_origem);

    if (contaOrigemIndex === -1) {
        return res.status(404).json({ mensagem: "Conta de origem não encontrada!" });
    }


    const contaDestinoIndex = bancoDeDados.contas.findIndex(conta => conta.numero === numero_conta_destino);

    if (contaDestinoIndex === -1) {
        return res.status(404).json({ mensagem: "Conta de destino não encontrada!" });
    }


    if (bancoDeDados.contas[contaOrigemIndex].usuario.senha !== senha) {
        return res.status(401).json({ mensagem: "Senha incorreta!" });
    }


    if (valor <= 0) {
        return res.status(400).json({ mensagem: "Valor da transferência deve ser maior que zero!" });
    }


    if (valor > bancoDeDados.contas[contaOrigemIndex].saldo) {
        return res.status(400).json({ mensagem: "Saldo insuficiente para realizar a transferência!" });
    }


    bancoDeDados.contas[contaOrigemIndex].saldo -= valor;


    bancoDeDados.contas[contaDestinoIndex].saldo += valor;


    const data = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const transferencia = {
        data,
        numero_conta_origem,
        numero_conta_destino,
        valor
    };
    bancoDeDados.transferencias.push(transferencia);

    return res.status(200).json({ mensagem: "Transferência realizada com sucesso" });


}

const consultarSaldo = (req, res) => {
    const { numero_conta, senha } = req.query;


    if (!numero_conta || !senha) {
        return res.status(400).json({ mensagem: "Número da conta e senha são obrigatórios!" });
    }


    const contaIndex = bancodedados.contas.findIndex(conta => conta.numero === numero_conta);

    if (contaIndex === -1) {
        return res.status(404).json({ mensagem: "Conta não encontrada!" });
    }


    if (bancoDeDados.contas[contaIndex].usuario.senha !== senha) {
        return res.status(401).json({ mensagem: "Senha incorreta!" });
    }


    const saldo = bancoDeDados.contas[contaIndex].saldo;
    return res.status(200).json({ saldo });

}


const extrato = (req, res) => {
    const { numero_conta, senha } = req.query;


    if (!numero_conta || !senha) {
        return res.status(400).json({ mensagem: 'Número da conta e senha são obrigatórios.' });
    }

    const senhaDoBanco = '123';
    if (senhaDoBanco !== senha) {
        return res.status(400).json({ mensagem: 'A senha está incorreta.' });
    }

    const numeroConta = '123';
    if (numeroConta !== numero_conta) {
        return res.status(400).json({ mensagem: 'O numero da conta está incorreto.' });
    }



    const extrato = {

        depositos,
        saques,
        transferenciasEnviadas: bancoDeDados.transferencias,
        transferenciasRecebidas: bancoDeDados.transferencias
    };


    return res.status(200).json(extrato);


}







module.exports = {
    listarContas,
    criarConta,
    atualizarUsuarioConta,
    excluirConta,
    depositar,
    sacar,
    transferir,
    consultarSaldo,
    extrato
}



