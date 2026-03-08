// 1. CONEXIÓN AL NODO TELEMÁTICO (MQTT)
const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

// 2. CONFIGURACIÓN DE GRÁFICA TÉCNICA
const ctx = document.getElementById('sismografo').getContext('2d');
let sismoChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: Array(30).fill(''),
        datasets: [{
            label: 'Frecuencia de Resonancia',
            data: Array(30).fill(1.1),
            borderColor: '#3498db',
            borderWidth: 2,
            tension: 0.3,
            pointRadius: 0,
            fill: true,
            backgroundColor: 'rgba(52, 152, 219, 0.1)'
        }]
    },
    options: {
        scales: { y: { min: 1, max: 10, grid: { color: '#333' } }, x: { display: false } },
        animation: false,
        responsive: true,
        maintainAspectRatio: false
    }
});

// 3. PROCESAMIENTO DE DATOS
client.on('connect', () => {
    document.getElementById('status-dot').style.background = "#2ecc71";
    document.getElementById('status-dot').style.boxShadow = "0 0 10px #2ecc71";
    client.subscribe('vzla/zulia/zenit');
});

client.on('message', (topic, message) => {
    const data = JSON.parse(message.toString());
    const valor = parseFloat(data.escala);
    actualizarPanel(valor);
});

function actualizarPanel(valor) {
    const display = document.getElementById('valor-escala');
    const banner = document.getElementById('alerta-banner');
    
    // Actualizar valor numérico
    display.innerText = valor.toFixed(1);
    
    // Actualizar Gráfica
    sismoChart.data.datasets[0].data.shift();
    sismoChart.data.datasets[0].data.push(valor);
    sismoChart.update();

    // Lógica de Estados (Normas COVENIN)
    if (valor > 4.5) {
        display.style.color = "#e74c3c"; // Rojo
        banner.innerText = "⚠️ ALERTA: RESONANCIA CRÍTICA ⚠️";
        banner.style.borderLeftColor = "#e74c3c";
        document.body.classList.add("pantalla-alerta");
    } else {
        display.style.color = "#2ecc71"; // Verde
        banner.innerText = "SISTEMA OPERATIVO: ESTABLE ✅";
        banner.style.borderLeftColor = "#2ecc71";
        document.body.classList.remove("pantalla-alerta");
    }
}

// 4. ACCIONES DE BOTONES
function abrirDocumento() { window.open("Geonode-VZ.pdf", "_blank"); }
function irAMapa() { window.open("https://www.google.com/maps", "_blank"); }
function llamarEmergencia() { if(confirm("¿Llamar a Emergencias?")) window.location.href = "tel:911"; }