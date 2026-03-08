let grafico=null
let editandoId=null

function dataHoje(){
const hoje=new Date()
return hoje.toISOString().split('T')[0]
}

async function carregar(){

const res=await fetch('http://localhost:3000/gastos')
const dados=await res.json()

const lista=document.getElementById('lista')
lista.innerHTML=''

let entradas=0
let saidas=0
const meses={}

dados.forEach(g=>{

if(g.tipo==='entrada') entradas+=Number(g.valor)
else saidas+=Number(g.valor)

const dataObj=new Date(g.data)
const mes=dataObj.getMonth()+1
const ano=dataObj.getFullYear()

const chave=`${mes}/${ano}`

if(!meses[chave]) meses[chave]=0
meses[chave]+=Number(g.valor)

const card=document.createElement('div')
card.className='card-gasto'

card.innerHTML=`
<div class="info">
<span class="nome">${g.descricao}</span>

<span class="valor" style="color:${g.tipo==='entrada'?'#16a34a':'#ef4444'}">
${g.tipo==='entrada'?'+':'-'} R$ ${g.valor}
</span>

<span class="data">${g.data}</span>
</div>

<div>
<button class="btn-editar" onclick="abrirModal(${g.id},'${g.descricao}',${g.valor},'${g.tipo}','${g.data}')">Editar</button>
<button class="btn-excluir" onclick="deletar(${g.id})">Excluir</button>
</div>
`

lista.appendChild(card)

})

const saldo=entradas-saidas

animarSaldo(saldo)

criarGrafico(meses)

}

function animarSaldo(valorFinal){

const total=document.getElementById('total')
const seta=document.getElementById('seta')

let atual=0
const passos=40
const incremento=valorFinal/passos
let contador=0

const animacao=setInterval(()=>{

atual+=incremento
contador++

total.innerText=atual.toFixed(2)

if(contador>=passos){
total.innerText=valorFinal.toFixed(2)
clearInterval(animacao)
}

},20)

total.classList.remove('positivo','negativo')

if(valorFinal>=0){

total.classList.add('positivo')
seta.style.color='#22c55e'
seta.innerText='▲'

}else{

total.classList.add('negativo')
seta.style.color='#ef4444'
seta.innerText='▼'

}

}

function criarGrafico(meses){

const ctx=document.getElementById('graficoMensal')

if(grafico) grafico.destroy()

grafico=new Chart(ctx,{
type:'line',
data:{
labels:Object.keys(meses),
datasets:[{
label:'Movimentação por mês',
data:Object.values(meses),
tension:0.4,
fill:true
}]
}
})

}

async function adicionar(){

const descricao=document.getElementById('descricao').value
const valor=document.getElementById('valor').value
const tipo=document.getElementById('tipo').value

let data=document.getElementById('data').value
if(!data) data=dataHoje()

await fetch('http://localhost:3000/gastos',{
method:'POST',
headers:{'Content-Type':'application/json'},
body:JSON.stringify({descricao,valor,tipo,data})
})

limparCampos()
carregar()

}

function abrirModal(id,descricao,valor,tipo,data){

editandoId=id

document.getElementById('editDescricao').value=descricao
document.getElementById('editValor').value=valor
document.getElementById('editTipo').value=tipo
document.getElementById('editData').value=data

document.getElementById('modal').style.display='flex'

}

function fecharModal(){
document.getElementById('modal').style.display='none'
}

async function salvarEdicao(){

const descricao=document.getElementById('editDescricao').value
const valor=document.getElementById('editValor').value
const tipo=document.getElementById('editTipo').value
const data=document.getElementById('editData').value

await fetch(`http://localhost:3000/gastos/${editandoId}`,{
method:'PUT',
headers:{'Content-Type':'application/json'},
body:JSON.stringify({descricao,valor,tipo,data})
})

fecharModal()
carregar()

}

async function deletar(id){

await fetch(`http://localhost:3000/gastos/${id}`,{method:'DELETE'})
carregar()

}

function limparCampos(){

document.getElementById('descricao').value=''
document.getElementById('valor').value=''
document.getElementById('data').value=''

}

carregar()

// REGISTRAR SERVICE WORKER (APP)
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js")
    .then(() => console.log("Service Worker registrado"))
    .catch(err => console.log("Erro SW:", err));
}