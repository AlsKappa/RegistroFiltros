const registros = [];

let codigoPendiente = "";

let html5QrCode = null;

let scannerActivo = false;

document
.getElementById("fechaEntrega")
.value =
new Date()
.toISOString()
.split("T")[0];

cargarDatos();

function mostrarMensaje(texto,tipo){

    const mensaje =
        document.getElementById("mensaje");

    mensaje.className = tipo;

    mensaje.textContent = texto;

    mensaje.style.display = "block";

    setTimeout(()=>{
        mensaje.style.display="none";
    },3000);
}

function guardarDatos(){

    localStorage.setItem(
        "ecofiltros_actual",
        JSON.stringify(registros)
    );
}

function cargarDatos(){

    const datos =
        localStorage.getItem(
            "ecofiltros_actual"
        );

    if(!datos)return;

    const recuperados =
        JSON.parse(datos);

    recuperados.forEach(
        r => registros.push(r)
    );

    recargarTabla();
}

function actualizarContador(){

    document
    .getElementById("totalRegistros")
    .textContent =
    `Total: ${registros.length}`;
}

function mostrarRegistro(r,index){

    const fila=`
    <tr>

        <td>${index}</td>

        <td>${r.codigo}</td>

        <td>${r.token}</td>

        <td>${r.observacion}</td>

        <td>${r.fecha}</td>

        <td>

            <button
            class="delete-btn"
            onclick="eliminarRegistro('${r.codigo}')">

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

    tabla.innerHTML="";

    registros.forEach(
        (r,i)=>
        mostrarRegistro(
            r,
            i+1
        )
    );

    actualizarContador();
}

function eliminarRegistro(codigo){

    const indice =
        registros.findIndex(
            r => r.codigo === codigo
        );

    if(indice > -1){

        registros.splice(
            indice,
            1
        );

        guardarDatos();

        recargarTabla();
    }
}

async function iniciarScanner(){

    if(scannerActivo){
        return;
    }

    html5QrCode =
    new Html5Qrcode("reader");

    scannerActivo = true;

    try{

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

                scannerActivo=false;

                codigoPendiente =
                    decodedText;

                document
                .getElementById(
                    "codigoActual"
                )
                .textContent =
                decodedText;

                mostrarMensaje(
                    "Código leído correctamente",
                    "success"
                );
            }
        );

    }
    catch(error){

        console.error(error);

        scannerActivo=false;

        mostrarMensaje(
            "No se pudo iniciar la cámara",
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
                "Escanee un filtro primero",
                "error"
            );

            return;
        }

        const existe =
            registros.some(
                r =>
                r.codigo ===
                codigoPendiente
            );

        if(existe){

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
                .value,

            observacion:
                document
                .getElementById(
                    "observacion"
                ).value,

            fecha:
                new Date()
                .toLocaleString()
        };

        registros.push(registro);

        guardarDatos();

        recargarTabla();

        document
        .getElementById("token")
        .value="";

        document
        .getElementById("observacion")
        .value="";

        codigoPendiente="";

        document
        .getElementById("codigoActual")
        .textContent =
        "Sin lectura";

        mostrarMensaje(
            "Filtro guardado",
            "success"
        );
    }
);

document
.getElementById("btnNuevaEntrega")
.addEventListener(
"click",
()=>{

    if(confirm(
        "¿Limpiar todos los registros?"
    )){

        registros.length = 0;

        localStorage.removeItem(
            "ecofiltros_actual"
        );

        recargarTabla();
    }
});

document
.getElementById("btnGenerarPDF")
.addEventListener(
"click",
()=>{

    const { jsPDF } =
        window.jspdf;

    const doc =
        new jsPDF();

    doc.setFontSize(18);

    doc.text(
        "HOJA DE ENTREGA",
        70,
        15
    );

    doc.setFontSize(10);

    doc.text(
        `Cliente: ${
            document.getElementById(
                "cliente"
            ).value
        }`,
        15,
        30
    );

    doc.text(
        `Fecha: ${
            document.getElementById(
                "fechaEntrega"
            ).value
        }`,
        150,
        30
    );

    doc.text(
        `Destino: ${
            document.getElementById(
                "destino"
            ).value
        }`,
        15,
        40
    );

    doc.autoTable({

        startY:50,

        head:[[
            "No.",
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
        "Hoja_Entrega.pdf"
    );
});
