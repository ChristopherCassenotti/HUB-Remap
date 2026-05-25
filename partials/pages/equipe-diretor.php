<!-- ── PAGE: EQUIPE (DIRETOR) ── -->
    <div id="page-team" class="page">
      <div class="page-header">
        <h2>Equipe</h2>
        <p>Visão individual de horas, custos e produtividade de cada colaborador.</p>
      </div>
      <div class="section-header">
        <div></div>
        <button class="btn-primary btn-sm" onclick="openCollabModal()">+ Cadastrar colaborador</button>
      </div>
      <div class="collab-grid" id="collabGrid"></div>

      <div class="card" style="margin-top:20px">
        <div class="section-header">
          <h3>Comparativo de horas por colaborador (mês atual)</h3>
        </div>
        <div class="chart-box" style="background:transparent;border:0;padding:0">
          <canvas id="teamChart" style="max-height:260px"></canvas>
        </div>
      </div>
    </div>
