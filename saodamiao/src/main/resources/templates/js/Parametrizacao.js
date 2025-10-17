class Parametrizacao {

    constructor(data) {

        this.cnpj = data.par_cnpj;
        this.social = data.par_razao_social;
        this.fantasia = data.par_nome_fantasia;
        this.site = data.par_site;
        this.email = data.par_email;
        this.tel = data.par_telefone;
        this.contato = data.par_contato;
        this.rua = data.par_rua;
        this.bairro = data.par_bairro;
        this.cidade = data.par_cidade;
        this.uf = data.par_uf;
        this.cep = data.par_cep;
        this.logo_grande = data.par_logo_grande;
        this.logo_peq = data.par_logo_pequeno;
    }
}
async function carregarParametrizacao()
{
    const URl = 'http://localhost:8080/Parametrizacao/home';
    try{
        const response = await fetch(URl);
        const data = await response.json();
        console.log(data); // aqui to exibindo o objeto para fins de teste futuramente retirar

        if(response.status === 404 || response.status === 204){
            abrirCadastro();
            return;
        }
        let Parametros = new Parametrizacao(data);
        CarregarEmpresa(Parametros);
    }
    catch (error) {
        console.log("Erro fetching parametrizacao: ", error);
        abrirCadastro();
    }
}

function CarregarEmpresa(Parametros)
{
    document.getElementById('img-logo').src = Parametros.logo_grande;
    document.getElementById('nome-ong').textContent = Parametros.fantasia;

}

function abrirCadastro()
{
    const CONTENT_ID = 'app-content';

    // cria o container caso não exista
    let host = document.getElementById(CONTENT_ID);
    if (!host) {
        host = document.createElement('div');
        host.id = CONTENT_ID;
        document.body.appendChild(host);
    }

    const TEMPLATE = `
  <div class="form-shell">
    <div class="mb-3">
      <h3 class="mb-0"><i class="fas fa-users me-2"></i>Cadastro da ONG</h3>
    </div>

    <div id="formErrors" class="form-errors"></div>

    <div class="card shadow-sm">
      <div class="card-body">
        <form id="formParametrizacao" class="needs-validation" novalidate>
          <div class="mb-3">
            <label for="cnpj" class="form-label">CNPJ</label>
            <input type="text" class="form-control form-control-lg" id="cnpj" name="cnpj" maxlength="18" required placeholder="00.000.000/0000-00">
            <div class="invalid-feedback">Informe o CNPJ (18 caracteres).</div>
          </div>

          <div class="mb-3">
            <label for="social" class="form-label">Razão Social</label>
            <input type="text" class="form-control form-control-lg" id="social" name="social" maxlength="60" required>
            <div class="invalid-feedback">Informe entre 3 e 60 caracteres.</div>
          </div>

          <div class="mb-3">
            <label for="fantasia" class="form-label">Nome Fantasia</label>
            <input type="text" class="form-control form-control-lg" id="fantasia" name="fantasia" maxlength="45" required>
            <div class="invalid-feedback">Informe entre 3 e 45 caracteres.</div>
          </div>

          <div class="mb-3">
            <label for="email" class="form-label">E-mail</label>
            <input type="email" class="form-control form-control-lg" id="email" name="email" maxlength="60" required>
            <div class="invalid-feedback">Informe um e-mail válido.</div>
          </div>

          <div class="mb-3">
            <label for="telefone" class="form-label">Telefone</label>
            <input type="text" class="form-control form-control-lg" id="telefone" name="telefone" maxlength="15" required placeholder="(00) 00000-0000">
            <div class="invalid-feedback">Formato (00) 00000-0000.</div>
          </div>

          <div class="mb-3">
            <label for="contato" class="form-label">Outro Contato</label>
            <input type="text" class="form-control form-control-lg" id="contato" name="contato" maxlength="15" placeholder="(00) 00000-0000">
            <div class="invalid-feedback">Formato (00) 00000-0000.</div>
          </div>

          <div class="mb-3">
            <label for="rua" class="form-label">Rua</label>
            <input type="text" class="form-control form-control-lg" id="rua" name="rua" maxlength="45" required>
            <div class="invalid-feedback">Informe entre 3 e 45 caracteres.</div>
          </div>

          <div class="mb-3">
            <label for="bairro" class="form-label">Bairro</label>
            <input type="text" class="form-control form-control-lg" id="bairro" name="bairro" maxlength="45" required>
            <div class="invalid-feedback">Informe entre 3 e 45 caracteres.</div>
          </div>

          <div class="mb-3">
            <label for="cidade" class="form-label">Cidade</label>
            <input type="text" class="form-control form-control-lg" id="cidade" name="cidade" maxlength="45" required>
            <div class="invalid-feedback">Informe entre 3 e 45 caracteres.</div>
          </div>

          <div class="mb-3">
            <label for="uf" class="form-label">UF</label>
            <input type="text" class="form-control form-control-lg" id="uf" name="uf" maxlength="2" required pattern="^[A-Za-z]{2}$">
            <div class="invalid-feedback">Informe a UF com 2 letras (ex.: SP).</div>
          </div>

          <div class="mb-3">
            <label for="cep" class="form-label">CEP</label>
            <input type="text" class="form-control form-control-lg" id="cep" name="cep" maxlength="9" required inputmode="numeric" pattern="^\\d{5}-\\d{3}$">
            <div class="invalid-feedback">Formato 00000-000.</div>
          </div>

          <div class="mb-3">
            <label for="logo_grande" class="form-label">Logo (URL ou caminho)</label>
            <input type="text" class="form-control form-control-lg" id="logo_grande" name="logo_grande" maxlength="255" required placeholder="/uploads/logo-ong.png ou https://meusite.com/logo.png" pattern="^(https?:\\/\\/\\S+|\\/\\S+)$">
            <div class="invalid-feedback">Use http/https ou caminho começando com “/”.</div>
          </div>

          <div class="d-flex gap-2 mt-4 justify-content-center">
            <button type="submit" class="btn btn-success">Salvar</button>
            <button type="reset" class="btn btn-outline-secondary">Limpar</button>
          </div>
        </form>
      </div>
    </div>
  </div>`;

    host.innerHTML = TEMPLATE;

    // ===== máscaras simples (sem inline oninput) =====
    const uf = document.getElementById('uf');
    uf.addEventListener('input', () => {
        uf.value = uf.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
    });

    const cep = document.getElementById('cep');
    cep.addEventListener('input', () => {
        let v = cep.value.replace(/\D/g, '').slice(0, 8);
        cep.value = v.length > 5 ? v.slice(0, 5) + '-' + v.slice(5) : v;
    });

    const tel = document.getElementById('telefone');
    [tel, document.getElementById('contato')].forEach(function (el) {
        el.addEventListener('input', () => {
            let v = el.value.replace(/\D/g, '').slice(0, 11);
            if (v.length > 10) el.value = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
            else if (v.length > 6) el.value = `(${v.slice(0,2)}) ${v.slice(2,6)}-${v.slice(6)}`;
            else if (v.length > 2) el.value = `(${v.slice(0,2)}) ${v.slice(2)}`;
            else el.value = v;
        });
    });

    // ===== submit (PUT /api/parametrizacao) =====
    const form = document.getElementById('formParametrizacao');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const dto = {
            par_cnpj:          document.getElementById('cnpj').value,
            par_razao_social:  document.getElementById('social').value,
            par_nome_fantasia: document.getElementById('fantasia').value,
            par_email:         document.getElementById('email').value,
            par_telefone:      document.getElementById('telefone').value,
            par_contato:       document.getElementById('contato').value,
            par_rua:           document.getElementById('rua').value,
            par_bairro:        document.getElementById('bairro').value,
            par_cidade:        document.getElementById('cidade').value,
            par_uf:            document.getElementById('uf').value,
            par_cep:           document.getElementById('cep').value,
            par_logo_grande:   document.getElementById('logo_grande').value
        };

        // validações mínimas
        const erros = [];
        if (!/^[A-Za-z]{2}$/.test(dto.par_uf)) erros.push('UF inválida.');
        if (!/^\d{5}-\d{3}$/.test(dto.par_cep)) erros.push('CEP inválido.');
        if (dto.par_razao_social.trim().length < 3) erros.push('Razão Social muito curta.');
        if (dto.par_nome_fantasia.trim().length < 3) erros.push('Nome Fantasia muito curto.');
        if (erros.length) { mostraErros(erros); return; }

        try {
            const r = await fetch('/api/parametrizacao', {
                method: 'PUT',
                headers: { 'Content-Type':'application/json', 'Accept':'application/json' },
                body: JSON.stringify(dto)
            });
            if (!r.ok) {
                const msg = await r.text().catch(()=>'');
                alert('Erro ao salvar: ' + r.status + ' ' + msg);
                return;
            }
            const saved = await r.json().catch(()=>dto);

            // atualiza topo (logo + nome)
            const img = document.getElementById('img-logo');
            if (img) {
                img.onerror = function(){ img.src = '/img/kaiadmin/logo_light.svg'; };
                img.src = saved.par_logo_grande || '/img/kaiadmin/logo_light.svg';
            }
            const nome = document.getElementById('nome-ong');
            if (nome) nome.textContent = saved.par_nome_fantasia || '';

            alert('Parametrização salva!');
        } catch (err) {
            alert('Falha de rede: ' + err.message);
        }
    });

    function mostraErros(lista) {
        const box = document.getElementById('formErrors');
        if (!box) { alert(lista.join('\n')); return; }
        box.innerHTML = lista.map(m => `<div class="alert alert-danger mb-2" role="alert">${m}</div>`).join('');
    }


}