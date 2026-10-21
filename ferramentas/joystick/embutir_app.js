// Gera js/joystick_app.js com os arquivos de app-joystick/ embutidos (para a IDE montar o
// .zip do app até aberta do disco, sem internet). Rode depois de mudar o app:
//   node ferramentas/joystick/embutir_app.js        (--verificar só confere)
const fs = require('fs'), path = require('path');
const raiz = path.join(__dirname, '../..');
const pasta = path.join(raiz, 'app-joystick');
const arquivos = ['MIDE Joystick.pyw', 'Abrir MIDE Joystick.bat', 'LEIA-ME.txt'];
const dados = arquivos.map((nome) => ({ nome, texto: fs.readFileSync(path.join(pasta, nome), 'utf8') }));
const versao = (/^VERSAO = (\d+)/m.exec(dados[0].texto) || [])[1];
const saida = `/* GERADO por ferramentas/joystick/embutir_app.js a partir de app-joystick/ — não edite à mão. */
const JOYSTICK_APP = ${JSON.stringify({ versao: +versao, arquivos: dados })};
`;
const alvo = path.join(raiz, 'js/joystick_app.js');
if (process.argv.includes('--verificar')) {
  const ok = fs.existsSync(alvo) && fs.readFileSync(alvo, 'utf8') === saida;
  console.log(ok ? 'js/joystick_app.js em dia' : 'js/joystick_app.js DESATUALIZADO — rode embutir_app.js');
  process.exit(ok ? 0 : 1);
}
fs.writeFileSync(alvo, saida);
console.log('js/joystick_app.js gerado:', dados.map((d) => `${d.nome} (${d.texto.length})`).join(', '), '— versão', versao);
