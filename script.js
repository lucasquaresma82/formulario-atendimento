document.getElementById("cep").addEventListener("blur", buscarCEP);

// Toast
function toast(msg) {
  const t = document.getElementById("toast");
  t.innerText = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3000);
}

// CEP com loading skeleton
function buscarCEP() {
  const cep = document.getElementById("cep").value.replace(/\D/g, "");
  if (cep.length !== 8) return;

  const campos = ["logradouro", "bairro", "cidade", "uf"];
  campos.forEach(id => {
    const c = document.getElementById(id);
    c.value = "Carregando...";
    c.classList.add("loading");
  });

  fetch(`https://viacep.com.br/ws/${cep}/json/`)
    .then(r => r.json())
    .then(d => {
      if (d.erro) {
        toast("CEP não encontrado");
        return;
      }
      document.getElementById("logradouro").value = d.logradouro || "";
      document.getElementById("bairro").value = d.bairro || "";
      document.getElementById("cidade").value = d.localidade || "";
      document.getElementById("uf").value = d.uf || "";
    })
    .catch(() => toast("Erro ao buscar CEP"))
    .finally(() => {
      campos.forEach(id => document.getElementById(id).classList.remove("loading"));
    });
}

// Envio
async function enviar() {
  const progress = document.getElementById("progress");
  progress.style.width = "30%";

  const fotos = document.getElementById("fotos").files;
  const fotosBase64 = [];

  for (let foto of fotos) {
    const base64 = await converterBase64(foto);
    fotosBase64.push(base64.split(",")[1]);
    progress.style.width = "60%";
  }

  const payload = {
    cep: document.getElementById("cep").value,
    logradouro: document.getElementById("logradouro").value,
    bairro: document.getElementById("bairro").value,
    cidade: document.getElementById("cidade").value,
    uf: document.getElementById("uf").value,
    animais: document.getElementById("animais").value,
    motivo: document.getElementById("motivo").value,
    veterinaria: document.getElementById("veterinaria").value,
    gerente: document.getElementById("gerente").value,
    fotos: fotosBase64
  };

  try {
    await fetch("https://script.google.com/macros/s/AKfycbz8d2-0unKNW3-c8TmUb8f6xdLsI6cP_2zDkZV408TW/dev", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    progress.style.width = "100%";
    toast("Atendimento registrado com sucesso!");
    limparFormulario();
  } catch {
    toast("Erro ao enviar atendimento");
  } finally {
    setTimeout(() => (progress.style.width = "0"), 600);
  }
}

function converterBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function limparFormulario() {
  document.querySelectorAll("input, textarea, select").forEach(c => {
    if (c.type !== "file") c.value = "";
  });
}