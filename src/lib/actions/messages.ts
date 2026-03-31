"use server";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string | null;
  lastMessage: string;
  lastMessageAt: string; // ISO
  unreadCount: number;
  online: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string; // ISO
  read: boolean;
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-001",
    participantId: "usr-employer-001",
    participantName: "Carlos Martinez",
    participantAvatar: null,
    lastMessage: "Perfecto, entonces nos vemos el lunes a las 9:00 AM para la entrevista presencial.",
    lastMessageAt: "2026-03-30T10:15:00Z",
    unreadCount: 2,
    online: true,
  },
  {
    id: "conv-002",
    participantId: "usr-employer-002",
    participantName: "Maria Lopez",
    participantAvatar: null,
    lastMessage: "Te envio el contrato por correo. Revisalo y me confirmas.",
    lastMessageAt: "2026-03-29T16:30:00Z",
    unreadCount: 0,
    online: false,
  },
  {
    id: "conv-003",
    participantId: "usr-employer-003",
    participantName: "Pedro Sanchez",
    participantAvatar: null,
    lastMessage: "Necesitamos que traigas tu certificacion de soldadura actualizada.",
    lastMessageAt: "2026-03-28T09:45:00Z",
    unreadCount: 1,
    online: true,
  },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  "conv-001": [
    {
      id: "msg-001",
      conversationId: "conv-001",
      senderId: "usr-employer-001",
      receiverId: "usr_001",
      content: "Hola Ana, hemos revisado tu perfil y nos interesa mucho tu experiencia en construccion.",
      createdAt: "2026-03-29T14:00:00Z",
      read: true,
    },
    {
      id: "msg-002",
      conversationId: "conv-001",
      senderId: "usr_001",
      receiverId: "usr-employer-001",
      content: "Muchas gracias! Estoy muy interesada en la posicion. Cuando podriamos coordinar una entrevista?",
      createdAt: "2026-03-29T14:15:00Z",
      read: true,
    },
    {
      id: "msg-003",
      conversationId: "conv-001",
      senderId: "usr-employer-001",
      receiverId: "usr_001",
      content: "Podemos agendar para el proximo lunes a las 9:00 AM, te parece bien?",
      createdAt: "2026-03-29T14:30:00Z",
      read: true,
    },
    {
      id: "msg-004",
      conversationId: "conv-001",
      senderId: "usr_001",
      receiverId: "usr-employer-001",
      content: "Si, perfecto! Sera presencial o por videollamada?",
      createdAt: "2026-03-29T15:00:00Z",
      read: true,
    },
    {
      id: "msg-005",
      conversationId: "conv-001",
      senderId: "usr-employer-001",
      receiverId: "usr_001",
      content: "Sera presencial en nuestras oficinas en Santiago. Te envio la direccion exacta.",
      createdAt: "2026-03-30T09:00:00Z",
      read: true,
    },
    {
      id: "msg-006",
      conversationId: "conv-001",
      senderId: "usr-employer-001",
      receiverId: "usr_001",
      content: "Perfecto, entonces nos vemos el lunes a las 9:00 AM para la entrevista presencial.",
      createdAt: "2026-03-30T10:15:00Z",
      read: false,
    },
  ],
  "conv-002": [
    {
      id: "msg-010",
      conversationId: "conv-002",
      senderId: "usr-employer-002",
      receiverId: "usr_001",
      content: "Buenos dias Ana. Queria informarte que tu aplicacion ha sido aceptada para el puesto de recepcionista.",
      createdAt: "2026-03-28T10:00:00Z",
      read: true,
    },
    {
      id: "msg-011",
      conversationId: "conv-002",
      senderId: "usr_001",
      receiverId: "usr-employer-002",
      content: "Que excelente noticia! Muchas gracias. Cual seria el siguiente paso?",
      createdAt: "2026-03-28T10:30:00Z",
      read: true,
    },
    {
      id: "msg-012",
      conversationId: "conv-002",
      senderId: "usr-employer-002",
      receiverId: "usr_001",
      content: "Necesitamos que completes algunos documentos. El salario acordado es de $2,200/mes con alojamiento incluido.",
      createdAt: "2026-03-28T11:00:00Z",
      read: true,
    },
    {
      id: "msg-013",
      conversationId: "conv-002",
      senderId: "usr_001",
      receiverId: "usr-employer-002",
      content: "Entendido. Tengo todos mis documentos al dia. Cuando puedo empezar?",
      createdAt: "2026-03-29T09:00:00Z",
      read: true,
    },
    {
      id: "msg-014",
      conversationId: "conv-002",
      senderId: "usr-employer-002",
      receiverId: "usr_001",
      content: "Te envio el contrato por correo. Revisalo y me confirmas.",
      createdAt: "2026-03-29T16:30:00Z",
      read: true,
    },
  ],
  "conv-003": [
    {
      id: "msg-020",
      conversationId: "conv-003",
      senderId: "usr-employer-003",
      receiverId: "usr_001",
      content: "Hola Ana, vimos que tienes experiencia en soldadura. Tenemos una vacante disponible.",
      createdAt: "2026-03-27T08:00:00Z",
      read: true,
    },
    {
      id: "msg-021",
      conversationId: "conv-003",
      senderId: "usr_001",
      receiverId: "usr-employer-003",
      content: "Hola Pedro! Si, tengo certificacion TIG y MIG. Me interesa saber mas sobre la posicion.",
      createdAt: "2026-03-27T08:30:00Z",
      read: true,
    },
    {
      id: "msg-022",
      conversationId: "conv-003",
      senderId: "usr-employer-003",
      receiverId: "usr_001",
      content: "Es un puesto en Bogota, salario de $3,200/mes. Incluye seguro medico y transporte.",
      createdAt: "2026-03-27T09:00:00Z",
      read: true,
    },
    {
      id: "msg-023",
      conversationId: "conv-003",
      senderId: "usr_001",
      receiverId: "usr-employer-003",
      content: "Las condiciones me parecen muy bien. Que documentacion necesitan de mi parte?",
      createdAt: "2026-03-27T14:00:00Z",
      read: true,
    },
    {
      id: "msg-024",
      conversationId: "conv-003",
      senderId: "usr-employer-003",
      receiverId: "usr_001",
      content: "Necesitamos que traigas tu certificacion de soldadura actualizada.",
      createdAt: "2026-03-28T09:45:00Z",
      read: false,
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  In-memory stores (mock)                                            */
/* ------------------------------------------------------------------ */

let _conversations = [...MOCK_CONVERSATIONS];
let _messages = { ...MOCK_MESSAGES };

/* ------------------------------------------------------------------ */
/*  Server actions                                                     */
/* ------------------------------------------------------------------ */

export async function getConversations(
  _userId?: string
): Promise<Conversation[]> {
  return _conversations.sort(
    (a, b) =>
      new Date(b.lastMessageAt).getTime() -
      new Date(a.lastMessageAt).getTime()
  );
}

export async function getMessages(
  conversationId: string
): Promise<Message[]> {
  return _messages[conversationId] ?? [];
}

export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string
): Promise<Message> {
  // Find or create conversation
  let conversation = _conversations.find(
    (c) =>
      c.participantId === receiverId || c.participantId === senderId
  );

  if (!conversation) {
    conversation = {
      id: `conv-${Date.now()}`,
      participantId: receiverId,
      participantName: "Nuevo contacto",
      participantAvatar: null,
      lastMessage: content,
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      online: false,
    };
    _conversations = [conversation, ..._conversations];
    _messages[conversation.id] = [];
  }

  const newMessage: Message = {
    id: `msg-${Date.now()}`,
    conversationId: conversation.id,
    senderId,
    receiverId,
    content,
    createdAt: new Date().toISOString(),
    read: false,
  };

  _messages[conversation.id] = [
    ...(_messages[conversation.id] ?? []),
    newMessage,
  ];

  // Update conversation
  _conversations = _conversations.map((c) =>
    c.id === conversation!.id
      ? { ...c, lastMessage: content, lastMessageAt: newMessage.createdAt }
      : c
  );

  return newMessage;
}

export async function markAsRead(
  messageIds: string[]
): Promise<void> {
  for (const convId of Object.keys(_messages)) {
    _messages[convId] = _messages[convId].map((m) =>
      messageIds.includes(m.id) ? { ...m, read: true } : m
    );
  }

  // Update unread counts
  _conversations = _conversations.map((c) => ({
    ...c,
    unreadCount: (_messages[c.id] ?? []).filter(
      (m) => !m.read && m.senderId === c.participantId
    ).length,
  }));
}
