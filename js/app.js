const registros = [];

function actualizarContador() {

    document.getElementById(
        "totalRegistros"
    ).textContent =
    `Total: ${registros.length}`;
}

function agregarRegistro(codigo) {

    const duplicado = registros.some(
        registro => registro.codigo === codigo
    );

    if (duplicado) {

        alert(
            "Este código ya fue registrado."
        );

        return;
    }

    const fecha = new Date();

    const nuevoRegistro = {

        codigo: codigo,

        fecha:
            fecha.toLocaleDateString() +
            " " +
            fecha.toLocaleTimeString()

    };

    registros.push(nuevoRegistro);

    mostrarRegistro(
        nuevoRegistro,
        registros.length
    );

    document.getElementById(
        "codigoActual"
    ).textContent = codigo;

    actualizarContador();

}

function mostrarRegistro(registro, numero) {

    const fila =
    `
    <tr>
        <td>${numero}</td>
        <td>${registro.codigo}</td>
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

function eliminarRegistro(codigo) {

    const indice =
        registros.findIndex(
            r => r.codigo === codigo
        );

    if (indice > -1) {

        registros.splice(indice, 1);

        recargarTabla();
    }

}

function recargarTabla() {

    const tabla =
        document.getElementById(
            "tablaRegistros"
        );

    tabla.innerHTML = "";

    registros.forEach(
        (registro, index) =>
        {
            mostrarRegistro(
                registro,
                index + 1
            );
        }
    );

    actualizarContador();
}

function onScanSuccess(decodedText) {

    agregarRegistro(decodedText);

}

const scanner = new Html5QrcodeScanner(
    "reader",
    {
        fps: 10,
        qrbox: 250
    }
);

scanner.render(
    onScanSuccess
);

document
.getElementById("btnExportar")
.addEventListener("click", () => {

    const datos = {

        cliente:
            document
            .getElementById("cliente")
            .value,

        proyecto:
            document
            .getElementById("proyecto")
            .value,

        registros
    };

    console.log(datos);

    alert(
        `Entrega preparada.\n\n` +
        `Cliente: ${datos.cliente}\n` +
        `Proyecto: ${datos.proyecto}\n` +
        `Registros: ${datos.registros.length}`
    );

});