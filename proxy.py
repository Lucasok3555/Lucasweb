import socket

HOST = '127.0.0.1'
PORT = 1177

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.bind((HOST, PORT))
    s.listen()
    print("Aguardando conexão...")
    conn, addr = s.accept()
    with conn:
        print(f"Conectado por {addr}")
        with open("arquivo_recebido.py", "wb") as f:
            while True:
                data = conn.recv(1024)  # recebe em pedaços de 1024 bytes
                if not data:
                    break
                f.write(data)
        print("Arquivo recebido.")
