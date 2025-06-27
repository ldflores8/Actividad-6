// Definición del componente personalizado de calculadora básica

class CalculadoraBasica extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.historial = [];
        
        // Crear la estructura del Shadow DOM
        this.shadowRoot.innerHTML = `
            <style>
                @import "./bootstrap.min.css";
                
                .calculadora-container {
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    background-color:rgb(131, 163, 197);
                }
                
                .resultado {
                    margin-top: 20px;
                    padding: 10px;
                    border-radius: 4px;
                    min-height: 50px;
                }
                
                .error {
                    color:rgb(146, 10, 24);
                    background-color:rgb(230, 86, 98);
                    border-color:rgb(186, 7, 25);
                }
                
                .exito {
                    color: #28a745;
                    background-color: #d4edda;
                    border-color: #c3e6cb;
                }
                
                .historial {
                    margin-top: 20px;
                    max-height: 200px;
                    overflow-y: auto;
                }
                
                .historial-item {
                    padding: 8px;
                    border-bottom: 1px solidrgb(85, 157, 229);
                }
                
                .historial-item:last-child {
                    border-bottom: none;
                }
                
                .historial-title {
                    font-weight: bold;
                    margin-bottom: 10px;
                }
            </style>
            
            <div class="calculadora-container">
                <div class="mb-3">
                    <label for="numero1" class="form-label">Primer número</label>
                    <input type="number" class="form-control" id="numero1" placeholder="Ingrese un número">
                </div>
                
                <div class="mb-3">
                    <label for="numero2" class="form-label">Segundo número</label>
                    <input type="number" class="form-control" id="numero2" placeholder="Ingrese un número">
                </div>
                
                <div class="mb-3">
                    <label for="operacion" class="form-label">Operación</label>
                    <select class="form-select" id="operacion">
                        <option value="suma">Suma</option>
                        <option value="resta">Resta</option>
                        <option value="multiplicacion">Multiplicación</option>
                        <option value="division">División</option>
                    </select>
                </div>
                
                <button id="calcular" class="btn btn-primary w-100">Calcular</button>
                
                <div id="resultado" class="resultado d-none"></div>
                
                <div class="historial mt-4">
                    <div class="historial-title">Historial de operaciones</div>
                    <div id="historial-contenido"></div>
                </div>
            </div>
        `;
        
        // Obtener referencias a los elementos
        this.numero1 = this.shadowRoot.getElementById('numero1');
        this.numero2 = this.shadowRoot.getElementById('numero2');
        this.operacion = this.shadowRoot.getElementById('operacion');
        this.calcularBtn = this.shadowRoot.getElementById('calcular');
        this.resultadoDiv = this.shadowRoot.getElementById('resultado');
        this.historialContenido = this.shadowRoot.getElementById('historial-contenido');
        
        // Agregar evento al botón
        this.calcularBtn.addEventListener('click', () => this.calcular());
    }
    
    calcular() {
        // Validar campos vacíos
        if (!this.numero1.value || !this.numero2.value) {
            this.mostrarResultado('Por favor ingrese ambos números', true);
            return;
        }
        
        // Obtener valores numéricos
        const num1 = parseFloat(this.numero1.value);
        const num2 = parseFloat(this.numero2.value);
        const operacion = this.operacion.value;
        
        let resultado;
        let error = false;
        let mensajeError = '';
        
        // Realizar operación seleccionada
        switch(operacion) {
            case 'suma':
                resultado = num1 + num2;
                break;
            case 'resta':
                resultado = num1 - num2;
                break;
            case 'multiplicacion':
                resultado = num1 * num2;
                break;
            case 'division':
                if (num2 === 0) {
                    mensajeError = 'Error: No se puede dividir por cero';
                    this.mostrarResultado(mensajeError, true);
                    this.emitirEvento(operacion, num1, num2, null, mensajeError);
                    return;
                }
                resultado = num1 / num2;
                break;
            default:
                mensajeError = 'Operación no válida';
                resultado = mensajeError;
                error = true;
        }
        
        // Mostrar resultado
        if (!error) {
            const mensajeExito = `El resultado de la ${operacion} es: ${resultado}`;
            this.mostrarResultado(mensajeExito, false);
            this.agregarAlHistorial(operacion, num1, num2, resultado);
            this.emitirEvento(operacion, num1, num2, resultado);
        } else {
            this.mostrarResultado(resultado, true);
            this.emitirEvento(operacion, num1, num2, null, mensajeError);
        }
    }

    // Mostrar mensaje de resultado
    mostrarResultado(mensaje, esError) {
        this.resultadoDiv.textContent = mensaje;
        this.resultadoDiv.classList.remove('d-none', 'error', 'exito');
        
        if (esError) {
            this.resultadoDiv.classList.add('error');
        } else {
            this.resultadoDiv.classList.add('exito');
        }
    }

    // Agregar operación al historial
    agregarAlHistorial(operacion, num1, num2, resultado) {
        const operacionTexto = {
            'suma': '+',
            'resta': '-',
            'multiplicacion': '×',
            'division': '÷'
        };
        
        const itemHistorial = {
            operacion,
            num1,
            num2,
            resultado,
            timestamp: new Date()
        };
        
        this.historial.unshift(itemHistorial); // Agregar al inicio del array
        
        // Limitar el historial a 10 elementos
        if (this.historial.length > 10) {
            this.historial.pop();
        }
        
        this.actualizarVistaHistorial();
    }
    
    // Actualizar la vista del historial
    actualizarVistaHistorial() {
        this.historialContenido.innerHTML = '';
        
        this.historial.forEach(item => {
            const operacionTexto = {
                'suma': '+',
                'resta': '-',
                'multiplicacion': '×',
                'division': '÷'
            };
            
            const itemElement = document.createElement('div');
            itemElement.className = 'historial-item';
            
            const hora = item.timestamp.toLocaleTimeString();
            const operacionStr = `${item.num1} ${operacionTexto[item.operacion]} ${item.num2} = ${item.resultado}`;
            
            itemElement.innerHTML = `
                <div><small class="text-muted">${hora}</small></div>
                <div>${operacionStr}</div>
            `;
            
            this.historialContenido.appendChild(itemElement);
        });
    }
    
    // Emitir evento personalizado al realizar un cálculo
    emitirEvento(operacion, num1, num2, resultado, error = null) {
        const eventoCalculo = new CustomEvent('calculo-realizado', {
            bubbles: true,
            composed: true,
            detail: {
                operacion,
                numero1: num1,
                numero2: num2,
                resultado,
                error,
                timestamp: new Date()
            }
        });
        
        this.dispatchEvent(eventoCalculo);
    }
}

// Definir el componente personalizado
customElements.define('calculadora-basica', CalculadoraBasica);