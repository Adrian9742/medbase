/* ============================================================
   MedBase — Skeleton loading templates
   ============================================================ */

function skeletonFormula() {
  return `
  <div class="skeleton sk-line" style="width:160px;height:12px;margin-bottom:22px"></div>
  <div style="margin-bottom:28px">
    <div class="skeleton" style="width:96px;height:24px;border-radius:999px;margin-bottom:14px"></div>
    <div class="skeleton sk-line" style="width:50%;height:30px"></div>
    <div class="skeleton sk-line" style="width:160px;height:16px;margin-top:8px"></div>
  </div>
  <div class="formula-grid">
    <div class="skeleton sk-block" style="height:280px"></div>
    <div>
      ${Array.from({length:5}).map(() => `
        <div style="display:flex;gap:16px;padding:15px 0;border-bottom:1px solid var(--border)">
          <div class="skeleton sk-line" style="width:150px;height:13px;margin:0"></div>
          <div class="skeleton sk-line" style="flex:1;height:13px;margin:0"></div>
        </div>`).join('')}
    </div>
  </div>`;
}

function skeletonMedication() {
  return `
  <div class="skeleton sk-line" style="width:140px;height:12px;margin-bottom:22px"></div>
  <div style="margin-bottom:28px">
    <div class="skeleton" style="width:120px;height:24px;border-radius:999px;margin-bottom:14px"></div>
    <div class="skeleton sk-line" style="width:55%;height:30px"></div>
    <div class="skeleton sk-line" style="width:240px;height:16px;margin-top:8px"></div>
  </div>
  <div class="skeleton sk-block" style="height:160px;margin-bottom:28px"></div>
  <div style="display:flex;flex-direction:column;gap:12px">
    ${Array.from({length:4}).map(() => `<div class="skeleton sk-block" style="height:62px"></div>`).join('')}
  </div>`;
}

function skeletonArticle() {
  return `
  <div class="article">
    <div class="skeleton sk-line" style="width:180px;height:12px;margin-bottom:22px"></div>
    <div class="skeleton" style="width:90px;height:22px;border-radius:999px;margin-bottom:14px"></div>
    <div class="skeleton sk-line" style="width:60%;height:38px;margin-bottom:14px"></div>
    <div class="skeleton sk-line" style="width:300px;height:14px;margin-bottom:26px"></div>
    <div class="skeleton sk-block" style="height:300px;margin-bottom:30px"></div>
    ${Array.from({length:6}).map((_, i) => `
      <div class="skeleton sk-line" style="width:${i % 3 === 2 ? '70%' : '100%'};height:15px;margin-bottom:14px"></div>`).join('')}
  </div>`;
}
