
async function carregarParametrizacao()
{
    const URl = 'http://localhost:8080/Parametrizacao/home';
    try{
        const response = await fetch(URl);
        const data = await response.json();
        console.log(data); // aqui to exibindo o objeto para fins de teste futuramente retirar
    }
    catch (error) {
        console.log("Erro fetching parametrizacao: ", error);
    }
}

function CadBeneficiario()
{
    const form = document.forms.Beneficiarios
    const Beneficiarios = new Object();
    Beneficiarios.cpf = form.cpf.value;
    Beneficiarios.nome= form.nome.value;
    Beneficiarios.endereco = form.endereco.value;
    Beneficiarios.email= form.email.value;
    Beneficiarios.data_cadastro = Beneficiarios.data_cadastro.value;
    Beneficiarios.bairro = Beneficiarios.bairro.value;
    Beneficiarios.cidade = Beneficiarios.cidade.value;
    Beneficiarios.uf = Beneficiarios.uf.value;
    Beneficiarios.cep = Beneficiarios.cep.value;
    Beneficiarios.telefone = Beneficiarios.telefone.value;


}