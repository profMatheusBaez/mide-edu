/* ============================================================
 * pybricks_ble.js — MIDE EDU, placa LEGO Technic (Pybricks)
 * ------------------------------------------------------------
 * Conexão direta do navegador com um hub que roda o firmware
 * Pybricks, por Web Bluetooth (Chrome/Edge). Sem ponte, sem pip.
 * Implementa o "Pybricks BLE Profile" — NÃO o protocolo LEGO
 * Wireless (LWP3): o hub com Pybricks não fala mais LWP3.
 *
 * Referências conferidas: pybricksdev (ble/pybricks.py e
 * connections/pybricks.py) e a documentação do perfil.
 *
 *   Serviço            c5f50001-8280-46da-89f4-6d8051e4aeef
 *   Comando/evento     c5f50002-...  (write com resposta + notify)
 *   Capacidades        c5f50003-...  (read)
 *   Device Information 0x180A: firmware 0x2A26, perfil 0x2A28
 *
 *   Comandos (byte 0; inteiros little-endian):
 *     0 STOP · 1 START (+1 byte de slot só se o hub informa slots)
 *     3 META(uint32 tamanho) · 4 RAM(uint32 offset + dados)
 *     6 STDIN(dados)
 *   Eventos (mesma característica):
 *     0 STATUS(uint32 flags [+ bytes extras]) · 1 STDOUT(bytes UTF-8)
 *
 * Todas as escritas passam por UMA fila serial (writeValueWithResponse):
 * escrita em paralelo gera "GATT operation already in progress".
 * O tamanho máximo de cada escrita vem do hub (capacidades) — nunca
 * fixo no código.
 *
 * Funciona no navegador (global PybricksHub) e no Node, onde os
 * testes injetam um GATT falso (PybricksHub.criar({bluetooth})).
 * ============================================================ */
(function (raiz, fabrica) {
  'use strict';
  const api = fabrica(raiz);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else raiz.PybricksHub = api;
})(typeof self !== 'undefined' ? self : globalThis, function (raiz) {
  'use strict';

  const UUID = {
    servico: 'c5f50001-8280-46da-89f4-6d8051e4aeef',
    comando: 'c5f50002-8280-46da-89f4-6d8051e4aeef',
    capacidades: 'c5f50003-8280-46da-89f4-6d8051e4aeef',
    infoDispositivo: 0x180a,
    firmware: 0x2a26,
    perfil: 0x2a28,
  };
  const CMD = { PARAR: 0, INICIAR: 1, META: 3, RAM: 4, STDIN: 6 };
  const EVT = { STATUS: 0, STDOUT: 1 };
  const FLAG_STATUS = {
    bateriaFraca: 1 << 0, bateriaDesligando: 1 << 1, botao: 1 << 5,
    rodando: 1 << 6, desligando: 1 << 7,
  };
  const CAP_MULTI_MPY6 = 1 << 1;
  const PERFIL_MIN = [1, 2, 0];      // comandos de programa (META/RAM/START)
  const PERFIL_STDOUT = [1, 3, 0];   // WRITE_STDOUT / WRITE_STDIN

  class ErroHub extends Error {
    constructor(codigo, mensagem, causa) {
      super(mensagem);
      this.name = 'ErroHub';
      this.codigo = codigo;
      this.causa = causa;
    }
  }

  const versaoMaiorOuIgual = (v, minimo) => {
    for (let i = 0; i < 3; i++) {
      if ((v[i] || 0) > minimo[i]) return true;
      if ((v[i] || 0) < minimo[i]) return false;
    }
    return true;
  };
  const lerVersao = (texto) => {
    const m = /(\d+)\.(\d+)(?:\.(\d+))?/.exec(String(texto || ''));
    return m ? [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3] || '0', 10)] : null;
  };

  /* Junta os pedaços de texto do stdout em linhas completas.
   * O hub manda "print" fragmentado e termina linhas com \r\n. */
  function criarBufferLinhas(aoLinha) {
    let resto = '';
    return {
      adicionar(texto) {
        resto += String(texto);
        let i;
        while ((i = resto.indexOf('\n')) >= 0) {
          aoLinha(resto.slice(0, i).replace(/\r$/, ''));
          resto = resto.slice(i + 1);
        }
      },
      /* Solta o que ficou sem \n (prompts de input(), por exemplo). */
      descarregar() {
        if (resto) { const t = resto.replace(/\r$/, ''); resto = ''; if (t) aoLinha(t); }
      },
      pendente() { return resto; },
    };
  }

  function criar(opcoes) {
    opcoes = opcoes || {};
    const obterBluetooth = () => opcoes.bluetooth ||
      (raiz.navigator && raiz.navigator.bluetooth) || null;

    const ouvintes = { status: [], stdout: [], desconectou: [], conectou: [] };
    const emitir = (nome, ...args) => {
      for (const f of ouvintes[nome].slice()) {
        try { f(...args); } catch (e) { /* um ouvinte com defeito não derruba o protocolo */ }
      }
    };

    let dispositivo = null;
    let servidor = null;
    let carComando = null;
    let fila = Promise.resolve();
    let decodificador = new TextDecoder('utf-8');
    let aguardandoStatus = [];

    const hub = {
      info: null,
      flags: 0,
      get conectado() { return !!(servidor && servidor.connected !== false && carComando); },
      get rodando() { return !!(hub.flags & FLAG_STATUS.rodando); },
      on(nome, fn) {
        if (!ouvintes[nome]) throw new Error('evento desconhecido: ' + nome);
        ouvintes[nome].push(fn);
        return () => { const i = ouvintes[nome].indexOf(fn); if (i >= 0) ouvintes[nome].splice(i, 1); };
      },
    };

    /* ---------- fila serial de escritas ---------- */
    function escrever(bytes) {
      const dados = bytes instanceof Uint8Array ? bytes : Uint8Array.from(bytes);
      const p = fila.then(async () => {
        if (!hub.conectado) throw new ErroHub('DESCONECTADO', 'O hub não está conectado.');
        try {
          await carComando.writeValueWithResponse(dados);
        } catch (e) {
          if (!hub.conectado || (e && e.name === 'NetworkError')) {
            throw new ErroHub('DESCONECTADO', 'A conexão com o hub caiu durante o envio.', e);
          }
          throw new ErroHub('ESCRITA', 'O hub recusou o envio: ' + (e && e.message ? e.message : e), e);
        }
      });
      fila = p.catch(() => {});
      return p;
    }

    const u32 = (n) => [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255];

    /* ---------- eventos vindos do hub ---------- */
    function aoNotificar(ev) {
      const v = ev.target.value;
      if (!v || v.byteLength < 1) return;
      const tipo = v.getUint8(0);
      if (tipo === EVT.STATUS && v.byteLength >= 5) {
        const flags = v.getUint32(1, true);
        const antes = hub.flags;
        hub.flags = flags;
        const st = {
          flags,
          rodando: !!(flags & FLAG_STATUS.rodando),
          bateriaFraca: !!(flags & FLAG_STATUS.bateriaFraca),
          bateriaDesligando: !!(flags & FLAG_STATUS.bateriaDesligando),
          botao: !!(flags & FLAG_STATUS.botao),
          desligando: !!(flags & FLAG_STATUS.desligando),
          mudouRodando: !!((flags ^ antes) & FLAG_STATUS.rodando),
        };
        aguardandoStatus = aguardandoStatus.filter((a) => {
          if (a.pred(st)) { clearTimeout(a.timer); a.resolve(st); return false; }
          return true;
        });
        emitir('status', st);
      } else if (tipo === EVT.STDOUT && v.byteLength > 1) {
        const bytes = new Uint8Array(v.buffer, v.byteOffset + 1, v.byteLength - 1);
        /* stream:true guarda o pedaço de caractere UTF-8 partido entre dois eventos */
        const texto = decodificador.decode(bytes, { stream: true });
        if (texto) emitir('stdout', texto);
      }
    }

    function esperarStatus(pred, ms) {
      return new Promise((resolve, reject) => {
        const item = { pred, resolve };
        item.timer = setTimeout(() => {
          aguardandoStatus = aguardandoStatus.filter((a) => a !== item);
          reject(new ErroHub('TEMPO', 'O hub não respondeu a tempo.'));
        }, ms);
        aguardandoStatus.push(item);
      });
    }

    function aoDesconectar() {
      const tinha = !!(dispositivo || servidor);
      if (carComando) {
        try { carComando.removeEventListener('characteristicvaluechanged', aoNotificar); } catch (e) { /* ignora */ }
      }
      carComando = null;
      servidor = null;
      hub.flags = 0;
      hub.info = null;
      decodificador = new TextDecoder('utf-8');
      for (const a of aguardandoStatus) { clearTimeout(a.timer); }
      aguardandoStatus = [];
      const d = dispositivo;
      dispositivo = null;
      if (d) { try { d.removeEventListener('gattserverdisconnected', aoDesconectar); } catch (e) { /* ignora */ } }
      if (tinha) emitir('desconectou');
    }

    /* ---------- conectar ---------- */
    async function lerTexto(servicoDI, uuid) {
      try {
        const c = await servicoDI.getCharacteristic(uuid);
        const v = await c.readValue();
        return new TextDecoder('utf-8').decode(v);
      } catch (e) { return null; }
    }

    hub.conectar = async function conectar() {
      if (hub.conectado) return hub.info;
      const bt = obterBluetooth();
      if (!bt) {
        throw new ErroHub('SEM_BLUETOOTH',
          'Use o Google Chrome ou o Microsoft Edge para conectar o hub (este navegador não tem Web Bluetooth).');
      }

      /* requestDevice PRECISA ser a primeira coisa: a "ativação do usuário"
         (o clique) expira depois de awaits longos e vira SecurityError. */
      let dev;
      try {
        dev = await bt.requestDevice({
          filters: [{ services: [UUID.servico] }],
          optionalServices: [UUID.infoDispositivo],
        });
      } catch (e) {
        if (e && e.name === 'NotFoundError') {
          throw new ErroHub('CANCELADO',
            'Nenhum hub foi escolhido. Se ele não aparece na lista: ligue o hub (luz piscando), feche o Pybricks Code ' +
            'e remova o pareamento do hub nas configurações do Windows.', e);
        }
        if (e && e.name === 'SecurityError') {
          throw new ErroHub('SEGURANCA', 'O navegador bloqueou o Bluetooth. Clique de novo em “Conectar hub”.', e);
        }
        throw new ErroHub('BLUETOOTH', 'Não foi possível abrir o Bluetooth: ' + (e && e.message ? e.message : e), e);
      }

      dispositivo = dev;
      dev.addEventListener('gattserverdisconnected', aoDesconectar);
      try {
        servidor = await dev.gatt.connect();
        const servico = await servidor.getPrimaryService(UUID.servico);
        carComando = await servico.getCharacteristic(UUID.comando);
        const carCap = await servico.getCharacteristic(UUID.capacidades);

        /* versões (Device Information) */
        let firmware = null, perfilTxt = null;
        try {
          const di = await servidor.getPrimaryService(UUID.infoDispositivo);
          firmware = await lerTexto(di, UUID.firmware);
          perfilTxt = await lerTexto(di, UUID.perfil);
        } catch (e) { /* hub sem 0x180A liberado: segue e decide pelas capacidades */ }
        const perfil = lerVersao(perfilTxt);
        if (perfil && !versaoMaiorOuIgual(perfil, PERFIL_MIN)) {
          throw new ErroHub('FIRMWARE',
            'O firmware Pybricks deste hub é antigo demais (perfil ' + perfilTxt + '). Atualize o firmware em code.pybricks.com.');
        }

        /* capacidades: max_char_size (u16), flags (u32), max_program (u32) [, slots (u8)] */
        let cap;
        try { cap = await carCap.readValue(); } catch (e) {
          throw new ErroHub('FIRMWARE', 'Não consegui ler as capacidades do hub. Atualize o firmware Pybricks do hub.', e);
        }
        if (cap.byteLength < 10) {
          throw new ErroHub('FIRMWARE', 'Resposta inesperada do hub. Atualize o firmware Pybricks do hub.');
        }
        const maxChar = cap.getUint16(0, true);
        const capFlags = cap.getUint32(2, true);
        const maxPrograma = cap.getUint32(6, true);
        const slots = cap.byteLength >= 11 ? cap.getUint8(10) : 0;
        if (!(capFlags & CAP_MULTI_MPY6)) {
          throw new ErroHub('FIRMWARE', 'Este hub não aceita programas .mpy versão 6. Atualize o firmware Pybricks do hub.');
        }
        if (maxChar < 6) {
          throw new ErroHub('FIRMWARE', 'O hub informou um tamanho de pacote inválido (' + maxChar + ').');
        }

        const temStdout = !perfil || versaoMaiorOuIgual(perfil, PERFIL_STDOUT);
        hub.info = {
          nome: dev.name || 'Hub Pybricks',
          firmware, perfil: perfilTxt,
          maxChar, maxPrograma, flags: capFlags, slots,
          temStdout,
          avisos: temStdout ? [] : ['O firmware deste hub é antigo: o Monitor Serial não recebe o que o programa escreve com print().'],
        };

        decodificador = new TextDecoder('utf-8');
        carComando.addEventListener('characteristicvaluechanged', aoNotificar);
        await carComando.startNotifications();
      } catch (e) {
        try { if (servidor && servidor.disconnect) servidor.disconnect(); } catch (e2) { /* ignora */ }
        const foi = dispositivo;
        carComando = null; servidor = null; dispositivo = null; hub.info = null;
        if (foi) { try { foi.removeEventListener('gattserverdisconnected', aoDesconectar); } catch (e2) { /* ignora */ } }
        if (e instanceof ErroHub) throw e;
        throw new ErroHub('GATT',
          'Não consegui conectar ao hub (' + (e && e.message ? e.message : e) + '). Confirme que ele está ligado com a luz piscando ' +
          'e que nenhum outro programa (como o Pybricks Code) está conectado a ele.', e);
      }
      emitir('conectou', hub.info);
      return hub.info;
    };

    hub.desconectar = async function desconectar() {
      if (servidor && servidor.disconnect) { try { servidor.disconnect(); } catch (e) { /* ignora */ } }
      aoDesconectar();
    };

    /* ---------- comandos ---------- */
    hub.parar = () => escrever([CMD.PARAR]);

    hub.escreverStdin = async function escreverStdin(texto) {
      if (!hub.info) throw new ErroHub('DESCONECTADO', 'O hub não está conectado.');
      const bytes = new TextEncoder().encode(String(texto));
      const tam = hub.info.maxChar - 1;
      for (let i = 0; i < bytes.length; i += tam) {
        const pedaco = bytes.subarray(i, i + tam);
        await escrever([CMD.STDIN, ...pedaco]);
      }
    };

    /* Envia o blob multi-mpy6 e inicia o programa.
     * Sequência (igual à do pybricksdev): [STOP se rodando] → META(0) →
     * RAM(offset, pedaço) × N → META(tamanho) → START. */
    hub.enviarERodar = async function enviarERodar(blob, aoProgresso) {
      if (!hub.conectado || !hub.info) throw new ErroHub('DESCONECTADO', 'O hub não está conectado.');
      const { maxChar, maxPrograma, slots } = hub.info;
      if (blob.length > maxPrograma) {
        throw new ErroHub('PROGRAMA_GRANDE',
          'O programa ficou grande demais para o hub (' + blob.length + ' bytes; o limite é ' + maxPrograma + ').');
      }
      const avisa = (n) => { if (aoProgresso) aoProgresso(blob.length ? n / blob.length : 1, n, blob.length); };

      if (hub.rodando) {
        await hub.parar();
        await esperarStatus((s) => !s.rodando, 4000).catch(() => {
          throw new ErroHub('TEMPO', 'O programa que estava rodando no hub não parou. Aperte o botão do hub e tente de novo.');
        });
      }

      await escrever([CMD.META, ...u32(0)]);
      const tamPedaco = maxChar - 5;
      for (let deslocamento = 0; deslocamento < blob.length; deslocamento += tamPedaco) {
        const pedaco = blob.subarray(deslocamento, deslocamento + tamPedaco);
        await escrever([CMD.RAM, ...u32(deslocamento), ...pedaco]);
        avisa(deslocamento + pedaco.length);
      }
      await escrever([CMD.META, ...u32(blob.length)]);
      await escrever(slots > 0 ? [CMD.INICIAR, 0] : [CMD.INICIAR]);
    };

    return hub;
  }

  const padrao = criar();
  padrao.criar = criar;
  padrao.criarBufferLinhas = criarBufferLinhas;
  padrao.ErroHub = ErroHub;
  padrao.UUID = UUID;
  padrao.CMD = CMD;
  padrao.suportado = () => !!(raiz.navigator && raiz.navigator.bluetooth);
  return padrao;
});
