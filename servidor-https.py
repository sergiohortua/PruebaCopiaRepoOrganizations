#!/usr/bin/env python3
"""Sirve View-apto en HTTPS para probar el giroscopio en el celular."""

from __future__ import annotations

import ipaddress
import socket
import ssl
import subprocess
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

PUERTO = 8443
RAIZ = Path(__file__).resolve().parent
CERT_DIR = RAIZ / ".cert"
CERT = CERT_DIR / "local.pem"
KEY = CERT_DIR / "local-key.pem"


def ips_locales() -> list[str]:
    encontradas = ["127.0.0.1"]
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
            sock.connect(("8.8.8.8", 80))
            encontradas.append(sock.getsockname()[0])
    except OSError:
        pass
    return list(dict.fromkeys(encontradas))


def asegurar_certificado(ips: list[str]) -> None:
    CERT_DIR.mkdir(exist_ok=True)
    if CERT.exists() and KEY.exists():
        return

    san = ["DNS:localhost", "IP:127.0.0.1"]
    for ip in ips:
        if ip == "127.0.0.1":
            continue
        try:
            ipaddress.ip_address(ip)
            san.append(f"IP:{ip}")
        except ValueError:
            san.append(f"DNS:{ip}")

    subprocess.check_call(
        [
            "openssl",
            "req",
            "-x509",
            "-newkey",
            "rsa:2048",
            "-sha256",
            "-days",
            "365",
            "-nodes",
            "-subj",
            "/CN=View-apto",
            "-addext",
            "subjectAltName=" + ",".join(san),
            "-keyout",
            str(KEY),
            "-out",
            str(CERT),
        ],
        cwd=RAIZ,
    )


def main() -> None:
    ips = ips_locales()
    asegurar_certificado(ips)

    contexto = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    contexto.load_cert_chain(certfile=str(CERT), keyfile=str(KEY))

    servidor = ThreadingHTTPServer(("0.0.0.0", PUERTO), SimpleHTTPRequestHandler)
    servidor.socket = contexto.wrap_socket(servidor.socket, server_side=True)

    print("View-apto en HTTPS (el giroscopio del celular lo necesita).", flush=True)
    print("El certificado es local: en el teléfono acepta el aviso de seguridad.", flush=True)
    print(flush=True)
    print(f"  Computador:  https://localhost:{PUERTO}/", flush=True)
    for ip in ips:
        if ip != "127.0.0.1":
            print(f"  Celular:     https://{ip}:{PUERTO}/", flush=True)
    print(flush=True)
    servidor.serve_forever()


if __name__ == "__main__":
    main()
