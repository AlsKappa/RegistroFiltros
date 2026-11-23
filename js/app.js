const registros = [];

let codigoPendiente = "";

let scannerActivo = false;

let html5QrCode = null;

document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("fechaEntrega").value =
        new Date().toISOString().split("T")[0];

    cargarDatos();

});

function mostrarMensaje(texto, tipo){

    const mensaje =
        document.getElementById("mensaje");

    mensaje.className = tipo;

    mensaje.textContent = texto;

    mensaje.style.display = "block";

    setTimeout(() => {
        mensaje.style.display = "none";
    }, 3000);
}

function guardarDatos(){

    localStorage.setItem(
        "ecofiltros_actual",
        JSON.stringify(registros)
    );
}

function cargarDatos(){

    const datos =
        localStorage.getItem("ecofiltros_actual");

    if(!datos) return;

    registros.push(
        ...JSON.parse(datos)
    );

    recargarTabla();
}

function actualizarContador(){

    document.getElementById(
        "totalRegistros"
    ).textContent =
    `Total: ${registros.length}`;
}

function mostrarRegistro(registro, index){

    const fila = `
    <tr>
        <td>${index}</td>
        <td>${registro.codigo}</td>
        <td>${registro.token}</td>
        <td>${registro.observacion}</td>
        <td>${registro.fecha}</td>
        <td>
            <button
                class="delete-btn"
                onclick="eliminarRegistro('${registro.codigo}')">
                Eliminar
            </button>
        </td>
    </tr>
    `;

    document
        .getElementById("tablaRegistros")
        .insertAdjacentHTML(
            "beforeend",
            fila
        );
}

function recargarTabla(){

    const tabla =
        document.getElementById(
            "tablaRegistros"
        );

    tabla.innerHTML = "";

    registros.forEach(
        (registro, index) => {
            mostrarRegistro(
                registro,
                index + 1
            );
        }
    );

    actualizarContador();
}

function eliminarRegistro(codigo){

    const indice =
        registros.findIndex(
            r => r.codigo === codigo
        );

    if(indice === -1) return;

    registros.splice(indice,1);

    guardarDatos();

    recargarTabla();
}

async function iniciarScanner(){

    if(scannerActivo) return;

    try{

        html5QrCode =
            new Html5Qrcode("reader");

        scannerActivo = true;

        await html5QrCode.start(
            {
                facingMode:"environment"
            },
            {
                fps:10,
                qrbox:250
            },
            async(decodedText)=>{

                await html5QrCode.stop();

                scannerActivo = false;

                codigoPendiente =
                    decodedText;

                document.getElementById(
                    "codigoActual"
                ).textContent =
                decodedText;

                mostrarMensaje(
                    "Código leído correctamente",
                    "success"
                );

            }
        );

    }catch(error){

        console.error(error);

        scannerActivo = false;

        mostrarMensaje(
            "No fue posible abrir la cámara",
            "error"
        );
    }
}

document
.getElementById("btnEscanear")
.addEventListener(
    "click",
    iniciarScanner
);

document
.getElementById("guardarFiltro")
.addEventListener(
    "click",
    ()=>{

        if(!codigoPendiente){

            mostrarMensaje(
                "Primero escanee un filtro",
                "error"
            );

            return;
        }

        const duplicado =
            registros.some(
                r => r.codigo === codigoPendiente
            );

        if(duplicado){

            mostrarMensaje(
                "Código ya registrado",
                "error"
            );

            return;
        }

        const registro = {

            codigo:
                codigoPendiente,

            token:
                document
                .getElementById("token")
                .value
                .trim(),

            observacion:
                document
                .getElementById("observacion")
                .value
                .trim(),

            fecha:
                new Date()
                .toLocaleString()

        };

        registros.push(registro);

        guardarDatos();

        recargarTabla();

        document.getElementById(
            "token"
        ).value = "";

        document.getElementById(
            "observacion"
        ).value = "";

        codigoPendiente = "";

        document.getElementById(
            "codigoActual"
        ).textContent =
        "Sin lectura";

        mostrarMensaje(
            "Filtro guardado correctamente",
            "success"
        );
    }
);

document
.getElementById("btnNuevaEntrega")
.addEventListener(
    "click",
    ()=>{

        if(!confirm(
            "¿Desea limpiar la entrega actual?"
        )){
            return;
        }

        registros.length = 0;

        localStorage.removeItem(
            "ecofiltros_actual"
        );

        recargarTabla();

        mostrarMensaje(
            "Entrega reiniciada",
            "success"
        );
    }
);

document
.getElementById("btnGenerarPDF")
.addEventListener(
    "click",
    ()=>{

        try{

            if(registros.length === 0){

                alert(
                    "No existen registros para exportar."
                );

                return;
            }

            const { jsPDF } =
                window.jspdf;

            const doc =
                new jsPDF();

            const cliente =
                document.getElementById(
                    "cliente"
                ).value || "No especificado";

            const destino =
                document.getElementById(
                    "destino"
                ).value;

            const fecha =
                document.getElementById(
                    "fechaEntrega"
                ).value;

            doc.setFontSize(18);

            doc.text(
                "HOJA DE ENTREGA",
                70,
                15
            );

            doc.setFontSize(11);

            doc.text(
                `Cliente: ${cliente}`,
                15,
                30
            );

            doc.text(
                `Destino: ${destino}`,
                15,
                38
            );

            doc.text(
                `Fecha: ${fecha}`,
                140,
                30
            );

            doc.autoTable({

                startY: 50,

                head:[[
                    "#",
                    "Código",
                    "Token",
                    "Observación"
                ]],

                body:
                registros.map(
                    (r,i)=>[
                        i+1,
                        r.codigo,
                        r.token,
                        r.observacion
                    ]
                )
            });

            doc.save(
                `Entrega_${fecha}.pdf`
            );

        }catch(error){

            console.error(error);

            alert(
                "Error al generar PDF. Revise la consola del navegador."
            );
        }
    }
);