import socket

HOST = "127.0.0.1"
PORT = 7000


def send_response(connection, payload):
    data = "HTTP/1.1 200 OK\r\n"
    data += "Connection: close\r\n"
    data += f"Content-Length: {len(payload)}\r\n"
    data += "Content-Type: text/html\r\n\r\n"
    data += payload
    connection.sendall(str.encode(data))


if __name__ == "__main__":
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((HOST, PORT))
        s.listen()
        conn, addr = s.accept()
        with conn:
            print(f"Connected by {addr}")
            while True:
                data = conn.recv(1024)
                if not data:
                    break
                print(data.decode().split("\r\n"))
                send_response(conn, "Hello world!")
