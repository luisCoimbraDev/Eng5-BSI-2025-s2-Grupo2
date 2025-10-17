document.addEventListener('DOMContentLoaded',()=>{
    const link = document.getElementById('consultar-alimento');
    const main = document.getElementById('app-content');



    const telaConsulta = `
<section class="container py-4 min-vh-100 d-flex align-items-center">
  <div class="row justify-content-center w-100">
    <div class="col-12 col-lg-10 col-xl-9">
      <div class="card shadow-sm w-100">
        <div class="card-header bg-body-tertiary d-flex align-items-center justify-content-between">
          <h3 class="h5 mb-0"><i class="fas fa-users me-2"></i>Cesta • Alimentos • Consultar</h3>
          <!-- espaço para ações futuras (ex.: adicionar) -->
        </div>

        <div class="card-body">
          <!-- Filtro -->
          <form id="formFiltro" class="row g-3 align-items-end">
            <div class="col-12 col-md-8">
              <label for="filtro-nome" class="form-label">Filtrar por nome ou tipo</label>
              <input type="text" id="filtro-nome" class="form-control form-control-lg" 
                     placeholder="Digite para filtrar… (ex.: Arroz, Grão, Laticínio)">
            </div>
            <div class="col-12 col-md-4 d-grid">
              <button type="button" id="btn-limpar-filtro" class="btn btn-outline-secondary">
                Limpar filtro
              </button>
            </div>
          </form>

          <!-- Tabela -->
          <div class="table-responsive mt-4">
            <table id="tabela-alimentos" class="table table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th scope="col" style="width: 45%">Nome</th>
                  <th scope="col" style="width: 45%">Tipo de Alimento</th>
                  <th scope="col" class="text-end" style="width: 10%">Ações</th>
                </tr>
              </thead>
              <tbody id="lista-alimentos">
                <!-- Exemplo de linha vazia/estado inicial -->
                <tr class="text-muted">
                  <td colspan="3" class="text-center py-4">
                    Nenhum item encontrado.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Rodapé opcional (paginação futura) -->
          <div id="paginacao-alimentos" class="d-flex justify-content-end gap-2 mt-2 d-none">
            <button class="btn btn-sm btn-outline-secondary" data-pagina="prev">Anterior</button>
            <button class="btn btn-sm btn-outline-secondary" data-pagina="next">Próxima</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
`;



    link.addEventListener('click', (e)=>{
        e.preventDefault();
        main.innerHTML = telaConsulta;
    })
});