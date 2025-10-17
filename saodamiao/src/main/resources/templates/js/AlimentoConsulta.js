document.addEventListener('DOMContentLoaded',()=>{
    const link = document.getElementById('consultar-alimento');
    const main = document.getElementById('app-content');



    const telaConsulta= `
        
        <section class="container py-4 min-vh-100 d-flex align-items-center">
  <div class="row justify-content-center w-100">
    <div class="col-12 col-lg-8 col-xl-6">
      <div class="card shadow-sm">
        <div class="card-header bg-body-tertiary">
          <h3 class="h5 mb-0"><i class="fas fa-users me-2"></i>Cesta • Alimentos • Consultar</h3>
        </div>

        <div class="card-body">
          <form id="formAlimento" class="row g-3 needs-validation" novalidate>
            <div class="col-12">
              <label for="nome" class="form-label">Nome do Alimento</label>
              <input type="text" class="form-control form-control-lg" id="nome-alim" name="nome" maxlength="40" placeholder="Ex.: Arroz" required>
              <div class="invalid-feedback">Informe o nome do alimento.</div>
            </div>

           
            <div class="col-12 col-md-6">
              <label for="tipo_alimento" class="form-label">Tipo de Alimento</label>
             
             <select id ="tipos-list" class="form-select" aria-label="Selecione um item" required>
              <option value="" selected disabled>Escolha um item…</option>
            </select>
              <div class="invalid-feedback">Escolha um tipo válido.</div>
            </div>

            <div class="col-12 d-grid d-sm-flex gap-2 justify-content-sm-end mt-2">
              <button type="reset" class="btn btn-outline-secondary">Limpar</button>
              <button type="submit" class="btn btn-success"><i class="fas fa-save me-2"></i>Salvar</button>
            </div>
          </form>
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