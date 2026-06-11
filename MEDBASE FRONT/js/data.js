/* ============================================================
   MedBase — Mock data (conteúdo ilustrativo, não é aconselhamento médico)
   ============================================================ */

/* β-D-glicopiranose — projeção de Haworth (esquemático) */
const GLUCOSE_SVG = `
<svg viewBox="0 0 300 244" xmlns="http://www.w3.org/2000/svg" role="img"
     aria-label="Estrutura molecular da glicose (projeção de Haworth)">
  <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <path d="M150 66 L98 94" stroke-width="2.4"/>
    <path d="M98 94 L98 150" stroke-width="2.4"/>
    <path d="M202 94 L150 66" stroke-width="2.4"/>
    <path d="M202 94 L202 150" stroke-width="2.4"/>
    <path d="M98 150 L150 178" stroke-width="5.2"/>
    <path d="M150 178 L202 150" stroke-width="5.2"/>
    <path d="M98 94 L70 62" stroke-width="2.4"/>
    <path d="M98 150 L98 188" stroke-width="2.4"/>
    <path d="M150 178 L150 214" stroke-width="2.4"/>
    <path d="M202 150 L202 188" stroke-width="2.4"/>
    <path d="M202 94 L236 70" stroke-width="2.4"/>
  </g>
  <g fill="currentColor" stroke="none" font-family="'JetBrains Mono', monospace" font-weight="600" font-size="14">
    <rect x="140" y="54" width="20" height="18" fill="var(--bg)"/>
    <text x="150" y="68" text-anchor="middle">O</text>
    <text x="64" y="56" text-anchor="end">CH₂OH</text>
    <text x="98" y="206" text-anchor="middle">OH</text>
    <text x="150" y="232" text-anchor="middle">OH</text>
    <text x="202" y="206" text-anchor="middle">OH</text>
    <text x="242" y="66" text-anchor="start">OH</text>
  </g>
</svg>`;

const DATA = {
  formula: {
    id: 'glicose',
    type: 'formula',
    aliases: ['c6h12o6', 'glicose', 'glucose', 'dextrose', 'd-glicose'],
    query: 'C6H12O6',
    name: 'Glicose',
    formulaPretty: 'C₆H₁₂O₆',
    structureSvg: GLUCOSE_SVG,
    structTag: 'Projeção de Haworth',
    props: [
      { label: 'Fórmula molecular', value: 'C₆H₁₂O₆', mono: true },
      { label: 'Nome IUPAC', value: '(2R,3S,4R,5R)-2,3,4,5,6-pentaidroxi-hexanal', mono: true },
      { label: 'Massa molar', value: '180,16 g/mol', mono: true },
      { label: 'Nº CAS', value: '50-99-7', mono: true },
      { label: 'Classe', value: 'Monossacarídeo (aldo-hexose)' }
    ],
    synonyms: ['Dextrose', 'D-Glicose', 'Açúcar do sangue', 'Glicopiranose', 'Açúcar de uva']
  },

  medication: {
    id: 'aspirina',
    type: 'medication',
    aliases: ['aspirina', 'aas', 'acido acetilsalicilico', 'ácido acetilsalicílico', 'aspirin'],
    query: 'Aspirina',
    name: 'Ácido acetilsalicílico',
    brand: 'Aspirina®',
    meta: [
      { label: 'Nome genérico', value: 'Ácido acetilsalicílico (AAS)' },
      { label: 'Fabricante', value: 'Bayer S.A.' },
      { label: 'Classe terapêutica', value: 'Anti-inflamatório não esteroide (AINE) · Antiagregante plaquetário' },
      { label: 'Via', value: 'Oral' }
    ],
    sections: [
      {
        id: 'indicacoes', title: 'Indicações', icon: 'clipboard-list', tone: 'ok',
        html: `<p>Alívio sintomático de <strong>dor leve a moderada</strong> — cefaleia, dor muscular, dor dental e dismenorreia — e redução da <strong>febre</strong>.</p>
               <p>Em doses baixas, é indicado como <strong>antiagregante plaquetário</strong> na prevenção secundária de eventos cardiovasculares (infarto do miocárdio e acidente vascular cerebral isquêmico).</p>`
      },
      {
        id: 'posologia', title: 'Posologia', icon: 'pill', tone: 'ok',
        html: `<ul>
                 <li><strong>Adultos (dor/febre):</strong> 500–1000 mg a cada 4–6 horas, sem exceder 4 g/dia.</li>
                 <li><strong>Cardioproteção:</strong> 75–100 mg uma vez ao dia, em uso contínuo.</li>
                 <li>Ingerir preferencialmente <strong>após as refeições</strong>, com água, para reduzir a irritação gástrica.</li>
               </ul>`
      },
      {
        id: 'advertencias', title: 'Advertências e precauções', icon: 'triangle-alert', tone: 'warn',
        html: `<p>Usar com cautela em pacientes com <strong>asma</strong>, pólipos nasais ou histórico de úlcera. O uso prolongado aumenta o risco de sangramento gastrointestinal.</p>
               <p><strong>Síndrome de Reye:</strong> não administrar a crianças e adolescentes com quadros virais (gripe, varicela) pelo risco desta complicação rara e grave.</p>
               <p>Evitar o consumo de <strong>álcool</strong> e suspender o uso cerca de 7 dias antes de procedimentos cirúrgicos.</p>`
      },
      {
        id: 'contraindicacoes', title: 'Contraindicações', icon: 'ban', tone: 'danger',
        html: `<ul>
                 <li>Hipersensibilidade aos salicilatos ou a outros AINEs.</li>
                 <li>Úlcera péptica ativa ou sangramento gastrointestinal.</li>
                 <li>Distúrbios da coagulação, como a hemofilia.</li>
                 <li>Insuficiência hepática ou renal grave.</li>
                 <li>Terceiro trimestre da gravidez.</li>
               </ul>`
      },
      {
        id: 'reacoes', title: 'Reações adversas', icon: 'activity', tone: 'danger',
        html: `<p><strong>Comuns:</strong> dispepsia, náuseas e desconforto epigástrico.</p>
               <p><strong>Menos comuns / graves:</strong> sangramento gastrointestinal, reações de hipersensibilidade (urticária, broncoespasmo) e zumbido associado a doses elevadas.</p>`
      }
    ]
  },

  disease: {
    id: 'diabetes',
    type: 'disease',
    aliases: ['diabetes', 'diabetes mellitus', 'diabete'],
    query: 'Diabetes',
    title: 'Diabetes mellitus',
    badge: 'Doença',
    meta: ['Endocrinologia', 'Doença crônica', 'Fonte: Wikipédia'],
    figureCaption: 'Cristais de insulina sob luz polarizada — hormônio central no controle da glicemia.',
    imageSlotId: 'doenca-hero',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Diabetes_mellitus',
    body: [
      { type: 'lead', html: `A <strong>diabetes mellitus</strong> é um grupo de doenças metabólicas caracterizadas por níveis persistentemente elevados de glicose no sangue (hiperglicemia), decorrentes de falhas na produção ou na ação da insulina.` },
      { type: 'p', html: `A insulina, hormônio produzido pelo pâncreas, permite que a glicose entre nas células e seja convertida em energia. Quando esse mecanismo falha, a glicose acumula-se na corrente sanguínea, podendo causar danos a longo prazo aos vasos, nervos, rins, olhos e coração.` },
      { type: 'h2', html: 'Principais tipos' },
      { type: 'p', html: `Na <strong>diabetes tipo 1</strong>, de origem autoimune, o organismo destrói as células produtoras de insulina, exigindo reposição diária do hormônio. Já a <strong>diabetes tipo 2</strong>, a forma mais prevalente, está associada à resistência à insulina e relaciona-se a fatores como obesidade e sedentarismo. A <strong>diabetes gestacional</strong> surge durante a gravidez e costuma regredir após o parto.` },
      { type: 'h2', html: 'Sintomas e manejo' },
      { type: 'p', html: `Os sintomas clássicos incluem sede excessiva, micção frequente, fome intensa e perda de peso inexplicada. O controle envolve alimentação equilibrada, atividade física regular, monitorização da glicemia e, quando necessário, medicamentos orais ou insulina.` }
    ],
    more: [
      { type: 'h2', html: 'Diagnóstico' },
      { type: 'p', html: `O diagnóstico apoia-se em exames laboratoriais: glicemia de jejum, hemoglobina glicada (HbA1c) e teste oral de tolerância à glicose. Uma glicemia de jejum igual ou superior a 126 mg/dL, confirmada em duas ocasiões, é indicativa de diabetes.` },
      { type: 'h2', html: 'Complicações' },
      { type: 'p', html: `A hiperglicemia mantida ao longo do tempo pode causar complicações crônicas, como retinopatia (com risco de cegueira), nefropatia (insuficiência renal), neuropatia e doenças cardiovasculares. O bom controle glicêmico reduz significativamente esses riscos.` },
      { type: 'h2', html: 'Prevenção' },
      { type: 'p', html: `A diabetes tipo 2 pode, em muitos casos, ser prevenida ou adiada com a manutenção de um peso saudável, a prática regular de exercícios e uma alimentação equilibrada, com redução de açúcares e carboidratos refinados.` }
    ]
  },

  history: {
    id: 'hipocrates',
    type: 'history',
    aliases: ['hipocrates', 'hipócrates', 'hippocrates'],
    query: 'Hipócrates',
    title: 'Hipócrates',
    badge: 'História da Medicina',
    meta: ['c. 460 – 370 a.C.', 'Grécia Antiga', 'Fonte: Wikipédia'],
    figureCaption: 'Busto de Hipócrates de Cós, tradicionalmente reconhecido como o "pai da medicina".',
    imageSlotId: 'historia-hero',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Hip%C3%B3crates',
    body: [
      { type: 'lead', html: `<strong>Hipócrates de Cós</strong> foi um médico da Grécia Antiga, frequentemente reconhecido como o "pai da medicina" por estabelecer a prática médica como uma disciplina racional, separada da superstição e da religião.` },
      { type: 'p', html: `Antes de Hipócrates, a doença era frequentemente atribuída a castigos divinos. Ele propôs que as enfermidades tinham causas naturais, podendo ser observadas, registradas e tratadas — um princípio que fundou o método clínico.` },
      { type: 'h2', html: 'A teoria dos humores' },
      { type: 'p', html: `A escola hipocrática defendia que o corpo era composto por quatro humores — sangue, fleuma, bile amarela e bile negra. A saúde resultaria do equilíbrio entre eles, e a doença, de seu desequilíbrio. Embora superada, essa teoria influenciou a medicina ocidental por mais de dois mil anos.` },
      { type: 'h2', html: 'O Juramento de Hipócrates' },
      { type: 'p', html: `Atribui-se a ele o <strong>Juramento de Hipócrates</strong>, texto que estabelece princípios éticos da prática médica, como o sigilo profissional e o compromisso de não causar dano. Versões adaptadas do juramento ainda são recitadas por formandos em medicina em todo o mundo.` }
    ],
    more: [
      { type: 'h2', html: 'O Corpus Hippocraticum' },
      { type: 'p', html: `Atribui-se à escola hipocrática um conjunto de cerca de setenta textos médicos conhecido como <em>Corpus Hippocraticum</em>. Embora provavelmente redigidos por diversos autores, esses tratados abordam temas como prognóstico, dietética, cirurgia e ética médica.` },
      { type: 'h2', html: 'Método clínico' },
      { type: 'p', html: `Hipócrates valorizava a observação cuidadosa do paciente, o registro detalhado dos sintomas e o acompanhamento da evolução das doenças ao longo do tempo. Essa abordagem empírica é considerada uma das bases do método clínico moderno.` },
      { type: 'h2', html: 'Legado' },
      { type: 'p', html: `Sua influência atravessou séculos. Expressões como “fácies hipocrática” permanecem em uso, e o princípio do <strong>primum non nocere</strong> (“primeiro, não causar dano”) continua sendo um pilar da ética médica contemporânea.` }
    ]
  }
};

/* flat index for lookup */
const ENTRIES = Object.values(DATA);

function normalize(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[®©™]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function findEntry(query) {
  const q = normalize(query);
  if (!q) return null;
  for (const e of ENTRIES) {
    if (e.aliases.some(a => normalize(a) === q)) return e;
  }
  // partial fallback
  for (const e of ENTRIES) {
    if (e.aliases.some(a => normalize(a).includes(q) || q.includes(normalize(a)))) return e;
  }
  return null;
}

const PAGE_FOR_TYPE = {
  formula:    (q) => `resultado.html?type=formula&q=${encodeURIComponent(q)}`,
  medication: (q) => `resultado.html?type=medication&q=${encodeURIComponent(q)}`,
  disease:    (q) => `doenca.html?q=${encodeURIComponent(q)}`,
  history:    (q) => `historia.html?q=${encodeURIComponent(q)}`
};

const TIPO_PARA_TYPE = {
  formula:     'formula',
  medicamento: 'medication',
  doenca:      'disease',
  historia:    'history',
};

const TYPE_LABEL = {
  formula: 'Fórmula',
  medication: 'Medicamento',
  disease: 'Doença',
  history: 'História'
};
const TYPE_ICON = {
  formula: 'flask-conical',
  medication: 'pill',
  disease: 'stethoscope',
  history: 'scroll-text'
};
