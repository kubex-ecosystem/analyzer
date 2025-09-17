// Package websocket implements a WebSocket manager to handle real-time communication with clients.
package websocket

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/kubex-ecosystem/analyzer/internal/types"
)

// ===== WEBSOCKET MANAGER =====

type WebSocketManager struct {
	clients    map[*websocket.Conn]bool
	broadcast  chan []byte
	register   chan *websocket.Conn
	unregister chan *websocket.Conn
	mutex      sync.Mutex
}

func NewWebSocketManager() *WebSocketManager {
	return &WebSocketManager{
		clients:    make(map[*websocket.Conn]bool),
		broadcast:  make(chan []byte),
		register:   make(chan *websocket.Conn),
		unregister: make(chan *websocket.Conn),
	}
}

func (wsm *WebSocketManager) Run() {
	for {
		select {
		case client := <-wsm.register:
			wsm.mutex.Lock()
			wsm.clients[client] = true
			wsm.mutex.Unlock()
			log.Println("Cliente WebSocket conectado")

		case client := <-wsm.unregister:
			wsm.mutex.Lock()
			if _, ok := wsm.clients[client]; ok {
				delete(wsm.clients, client)
				client.Close()
			}
			wsm.mutex.Unlock()
			log.Println("Cliente WebSocket desconectado")

		case message := <-wsm.broadcast:
			wsm.mutex.Lock()
			for client := range wsm.clients {
				if err := client.WriteMessage(websocket.TextMessage, message); err != nil {
					delete(wsm.clients, client)
					client.Close()
				}
			}
			wsm.mutex.Unlock()
		}
	}
}

func (wsm *WebSocketManager) BroadcastChange(event types.ChangeEvent) {
	data, err := json.Marshal(event)
	if err != nil {
		log.Printf("Erro ao serializar evento: %v", err)
		return
	}

	select {
	case wsm.broadcast <- data:
	default:
		log.Println("Canal de broadcast cheio, pulando mensagem")
	}
}
