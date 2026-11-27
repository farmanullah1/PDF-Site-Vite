/* ===== shared tool-page shell ===== */

const HEADER_HTML = `
  <header class="tool-header">
    <a class="back" href="../index.html">Back to tools</a>
    <div class="tool-title">
      <span class="tool-mark"></span>
      <span class="tool-name"></span>
    </div>
  </header>
`;

const UPLOAD_ZONE_HTML = `
  <section class="dropzone">
    <div class="drop-inner">
      <div class="drop-icon">+</div>
      <p>Drop PDF files here, or <button class="choose-btn" type="button">Choose files</button></p>
      <input class="file-input" type="file" accept=".pdf,application/pdf" multiple hidden />
      <p class="drop-note">Your files stay in your browser. Nothing is uploaded.</p>
    </div>
  </section>
`;

const FILE_LIST_HTML = `
  <section class="file-list" aria-live="polite" hidden>
    <div class="file-list-head">
      <h2>Loaded files</h2>
      <button class="clear-btn" type="button">Clear all</button>
    </div>
    <ul class="file-items"></ul>
  </section>
`;

const ACTION_ROW_HTML = `
  <section class="action-row">
    <button class="action-primary" type="button">Do it</button>
    <button class="action-secondary" type="button" hidden>Reset</button>
  </section>
`;

const RESULT_HTML = `
  <section class="result" hidden>
    <p class="result-msg"></p>
    <button class="download-btn" type="button" hidden>Download result</button>
  </section>
`;

const STUB_HTML = `
  <section class="stub">
    <h2>Not available in this demo</h2>
    <p>This tool would normally need a server or a paid service to do the real work. This demo shows the page and explains the limitation, but does not fake a working result.</p>
  </section>
`;

export function toolShell(opts = {}) {
  const {
    mark,
    title,
    summary,
    category,
    preUpload = '',
    postUpload = '',
    stub = false,
  } = opts;

  document.title = `${title} — PDF Toolkit`;

  const head = document.querySelector('head');
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = '../styles/global.css';
  head.appendChild(style);

  const header = document.querySelector('header.tool-header') || document.createElement('header');
  header.className = 'tool-header';
  header.innerHTML = HEADER_HTML;
  document.body.prepend(header);

  const markEl = header.querySelector('.tool-mark');
  const nameEl = header.querySelector('.tool-name');
  markEl.textContent = mark || 'PDF';
  nameEl.textContent = title;

  const main = document.createElement('main');
  main.className = 'tool-main';

  if (stub) {
    main.innerHTML = `<section class="tool-hero"><h2>${title}</h2><p>${summary}</p></section>${STUB_HTML}`;
  } else {
    main.innerHTML = `
      <section class="tool-hero">
        <h2>${title}</h2>
        <p>${summary}</p>
      </section>
      ${preUpload}
      ${UPLOAD_ZONE_HTML}
      ${postUpload}
      ${FILE_LIST_HTML}
      ${ACTION_ROW_HTML}
      ${RESULT_HTML}
    `;
  }

  document.body.appendChild(main);
  document.body.appendChild(document.createElement('footer'));
  document.body.querySelector('footer').className = 'site-footer';
  document.body.querySelector('footer').innerHTML = `
    <p>PDF Toolkit is a client-side demo for learning. It is not affiliated with any real PDF service and does not upload your files anywhere.</p>
    <p>© PDF Toolkit demo</p>
  `;

  wireUploadZone(main);
  wireFileList(main);
  wireActionRow(main);
  wireResult(main);
}

function wireUploadZone(main) {
  const zone = main.querySelector('.dropzone');
  const input = main.querySelector('.file-input');
  const btn = main.querySelector('.choose-btn');
  if (!zone || !input) return;

  btn.addEventListener('click', () => input.click());
  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('dragover');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
}

function addFilesFromInput(input) {
  const main = input.closest('main');
  const files = Array.from(input.files || []);
  if (files.length) addFiles(files);
  input.value = '';
}

function addFiles(files) {
  const main = document.querySelector('main.tool-main');
  if (!main) return;
  const list = main.querySelector('.file-items');
  const metaItems = files.map((file) => {
    const meta = window.pdfSite?.fileMeta?.(file) || file.name;
    return { file, meta: { name: file.name, size: file.size, sizeText: file.size >= 1024 * 1024 ? (file.size / (1024 * 1024)).toFixed(2) + ' MB' : (file.size / 1024).toFixed(1) + ' KB' } };
  });
  metaItems.forEach(({ file, meta }) => {
    list.appendChild(makeFileItem(file, meta));
  });
  const section = main.querySelector('.file-list');
  if (section) {
    section.hidden = false;
  }
}

function makeFileItem(file, meta) {
  const li = document.createElement('li');
  li.className = 'file-item';
  li.dataset.name = file.name;
  li.innerHTML = `
    <span class="file-icon">PDF</span>
    <span class="file-name">${escapeHtml(file.name)}</span>
    <span class="file-size">${meta.sizeText}</span>
    <button class="remove-file" type="button" aria-label="Remove ${escapeHtml(file.name)}">Remove</button>
  `;
  li.querySelector('.remove-file').addEventListener('click', () => {
    li.remove();
    const section = li.closest('.file-list');
    if (section && section.querySelectorAll('.file-item').length === 0) {
      section.hidden = true;
    }
  });
  return li;
}

function wireFileList(main) {
  const clear = main.querySelector('.clear-btn');
  if (!clear) return;
  clear.addEventListener('click', () => {
    const list = main.querySelector('.file-items');
    if (list) list.innerHTML = '';
    const section = main.querySelector('.file-list');
    if (section) section.hidden = true;
  });
}

function wireActionRow(main) {
  const primary = main.querySelector('.action-primary');
  const secondary = main.querySelector('.action-secondary');
  if (!primary) return;
  primary.addEventListener('click', () => {
    primary.disabled = true;
    primary.textContent = 'Working…';
    runToolAction(main)
      .then(() => {
        primary.textContent = 'Do it';
        primary.disabled = false;
      })
      .catch((err) => {
        primary.textContent = 'Do it';
        primary.disabled = false;
        showResult(main, 'error', err?.message || String(err));
      });
  });
  if (secondary) {
    secondary.addEventListener('click', () => {
      const list = main.querySelector('.file-items');
      if (list) list.innerHTML = '';
      const section = main.querySelector('.file-list');
      if (section) section.hidden = true;
      const result = main.querySelector('.result');
      if (result) { result.hidden = true; result.innerHTML = RESULT_HTML; }
    });
  }
}

async function runToolAction(main) {
  if (main.__runToolAction) {
    return await main.__runToolAction();
  }
  throw new Error('Subclass must implement runToolAction');
}

function wireResult(main) {
  const result = main.querySelector('.result');
  if (!result) return;
  const downloadBtn = result.querySelector('.download-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const blob = result.querySelector('a')?.href;
      if (blob) {
        const a = document.createElement('a');
        a.href = blob;
        a.download = downloadBtn.dataset.downloadName || 'result.pdf';
        a.click();
      }
    });
  }
}

export function showResult(main, kind, message, downloadBlob = null, downloadName = 'result.pdf') {
  const result = main.querySelector('.result');
  if (!result) return;
  result.hidden = false;
  result.innerHTML = `
    <p class="result-msg">${escapeHtml(message)}</p>
    ${downloadBlob ? `<a class="download-link" download="${escapeHtml(downloadName)}" href="${URL.createObjectURL(downloadBlob)}">Download result</a>` : ''}
    <button class="download-btn" type="button" ${downloadBlob ? '' : 'hidden'} data-download-name="${escapeHtml(downloadName)}">Download result</button>
  `;
  wireResult(main);
  result.querySelector('.download-btn')?.addEventListener('click', () => {
    if (downloadBlob) {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(downloadBlob);
      a.download = downloadName;
      a.click();
    }
  });
  result.querySelector('.result-msg').className = `result-msg ${kind}`;
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));
}
