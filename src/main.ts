import './style.css'
//import typescriptLogo from './typescript.svg'
//import viteLogo from '/vite.svg'
//import { setupCounter } from './counter.ts'
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>SUBASTAS P2P</title>
    <style>
        .container {
            margin-bottom: 10px; /* Espacio entre cada sección */
        }

    </style>
</head>
<body>
<button id="iniciar"  onclick="iniciar()">INICIAR</button>
    <div class="container">
        <label for="usuarioChoice">Usuario :</label>
        <input type="text" id="txtNombre" name="txtNombre">
        <button onclick="validar()">Logear</button>
        <div>
            <button id="btnRealizarOferta" style="display:none"   onclick="evento()">Realizar Oferta</button>
            <button id="btnInfoSubasta" style="display:none" onclick="evento1()">Info Subasta</button>
        </div>
    </div>
    <script src="main.ts"></script>
    
</body>
</html>

`

const storedServerState = localStorage.getItem('serverState');

class Servidor {
  public precio: number;
  public segundos: number;
  public user: string;
  public activo: boolean;
  private channel: BroadcastChannel;

  constructor(precio: number, segundos: number, user: string = '') {
    this.precio = precio;
    this.segundos = segundos;
    this.user = user;
    this.activo=true;
    this.iniciarSubasta();
    this.channel = new BroadcastChannel('subasta_channel');
  }

  iniciarSubasta() {
    let self = this;
    let intervalo = setInterval(function () {
      self.segundos--;
      updateServerState()
      if (self.segundos === 0) {
        self.activo = false;
        updateServerState()
        clearInterval(intervalo);
      }
    }, 1000);
  }

  getVActual() {
    if (this.segundos === 0) {
      if (this.user !== '') {
        return `El ganador fue ${this.user} con un precio de ${this.precio}`;
      } else {
        return `Nadie ofrecio un precio para la subasta`;
      }
    } else {  
      if(this.segundos<0){
        this.segundos = 0;
        this.activo = false;
        updateServerState();
        if (this.user !== '') {
          return `El ganador fue ${this.user} con un precio de ${this.precio}`;
        } else {
          return `Nadie ofrecio un precio para la subasta`;
        }
        
      }else{

        return `segundos faltantes:${this.segundos}  Valor actual: ${this.precio} ${ (this.user !== '') ? `Por usuario: ${this.user}` : "por ningun usuario" } `;
      }
    }
  }

  editarP(p: number, u: string) {
    this.precio = p;
    this.user = u;
    updateServerState();
    this.channel.postMessage({ type: 'precio', precio: this.precio, user: this.user });
  }

  resetTimer() {
    this.segundos = 50;
    updateServerState();
  }
}

let initialServerState: { precio: number; segundos: number; user: string } = { precio: 100000, segundos: 50, user: '' };

if (storedServerState) {
  initialServerState = JSON.parse(storedServerState);
}

let server = new Servidor(initialServerState.precio, initialServerState.segundos, initialServerState.user);

// Actualizar el estado del servidor en localStorage cuando cambie
function updateServerState() {
  localStorage.setItem('serverState', JSON.stringify({ precio: server.precio, segundos: server.segundos, user: server.user }));
}

//const usuarioChoiceElement = document.querySelector<HTMLSelectElement>('#usuarioChoice')!.value;
function validar() {
  const nombre = document.querySelector<HTMLInputElement>('#txtNombre')!.value;
  if (nombre.length < 1) {
      return false;
  }

  // Mostrar los botones si el nombre es válido
  const btnRealizarOferta = document.querySelector<HTMLButtonElement>('#btnRealizarOferta');
  const btnInfoSubasta = document.querySelector<HTMLButtonElement>('#btnInfoSubasta');

  if (btnRealizarOferta && btnInfoSubasta) {
      btnRealizarOferta.style.display = 'inline-block';
      btnInfoSubasta.style.display = 'inline-block';
  }
  console.log(nombre);

  return true;
}
window.validar = validar;

function inciar(){
   server = new Servidor(100000, 50);
   updateServerState();
}
window.iniciar = inciar; 



function evento() {
  
    const nombre = document.querySelector<HTMLInputElement>('#txtNombre')!.value;
    if(server.activo){
        let valor = prompt("Ingrese su oferta","oferta");
        if (valor === null) {
            // El usuario hizo clic en "Cancelar" o cerró el cuadro de diálogo
            alert("Operación cancelada");
            return;
        }
            if (!isNaN( Number(valor))) {
                comparar( Number(valor), server.precio,nombre);
            }

    }else{
        alert("la subasta finalizo");
    }
    return;
}
window.evento = evento;

function evento1(){
  
    alert(server.getVActual());
}
window.evento1 = evento1;

function comparar(vc:number, vs:number,input:string) {
    
    if (vc > vs) {
        console.log(input);
        server.editarP(vc,input);
        server.resetTimer();  
        
    }else{
        alert("Precio no supera al actual")
    }
}

if (typeof server === 'undefined') {
  let server = new Servidor(100000, 50);
}


