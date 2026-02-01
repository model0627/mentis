import http from "http";
import { WebSocketServer } from "ws";
import * as Y from "yjs";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";

const host = process.env.HOST || "0.0.0.0";
const port = parseInt(process.env.PORT || "1234", 10);

const docs = new Map();

function getOrCreateDoc(docName) {
  if (docs.has(docName)) return docs.get(docName);
  const doc = new Y.Doc();
  doc.name = docName;
  doc.conns = new Map();
  doc.awareness = new awarenessProtocol.Awareness(doc);
  doc.awareness.setLocalState(null);
  docs.set(docName, doc);
  return doc;
}

function send(conn, message) {
  if (conn.readyState === 1) {
    try {
      conn.send(message, (err) => { if (err) conn.close(); });
    } catch { conn.close(); }
  }
}

const messageSync = 0;
const messageAwareness = 1;

function handleMessage(conn, doc, message) {
  try {
    const decoder = decoding.createDecoder(new Uint8Array(message));
    const messageType = decoding.readVarUint(decoder);

    switch (messageType) {
      case messageSync: {
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, messageSync);
        const syncMessageType = syncProtocol.readSyncMessage(decoder, encoder, doc, conn);
        if (encoding.length(encoder) > 1) {
          send(conn, encoding.toUint8Array(encoder));
        }
        if (syncMessageType === 1 || syncMessageType === 2) {
          // broadcast update to all other clients
          const updateEncoder = encoding.createEncoder();
          encoding.writeVarUint(updateEncoder, messageSync);
          syncProtocol.writeUpdate(updateEncoder, Y.encodeStateAsUpdate(doc));
          const msg = encoding.toUint8Array(updateEncoder);
          doc.conns.forEach((_, c) => {
            if (c !== conn) send(c, msg);
          });
        }
        break;
      }
      case messageAwareness: {
        const update = decoding.readVarUint8Array(decoder);
        awarenessProtocol.applyAwarenessUpdate(doc.awareness, update, conn);
        break;
      }
    }
  } catch (err) {
    console.error("Error handling message:", err);
  }
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("yjs-websocket-server");
});

const wss = new WebSocketServer({ server });

wss.on("connection", (conn, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const docName = url.pathname.slice(1) || "default";
  const doc = getOrCreateDoc(docName);

  doc.conns.set(conn, new Set());

  // send initial sync step 1
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, messageSync);
  syncProtocol.writeSyncStep1(encoder, doc);
  send(conn, encoding.toUint8Array(encoder));

  // send awareness state
  const awarenessStates = doc.awareness.getStates();
  if (awarenessStates.size > 0) {
    const encoder2 = encoding.createEncoder();
    encoding.writeVarUint(encoder2, messageAwareness);
    encoding.writeVarUint8Array(
      encoder2,
      awarenessProtocol.encodeAwarenessUpdate(
        doc.awareness,
        Array.from(awarenessStates.keys())
      )
    );
    send(conn, encoding.toUint8Array(encoder2));
  }

  // listen for updates from Yjs doc
  const onDocUpdate = (update, origin) => {
    if (origin !== conn) {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      syncProtocol.writeUpdate(encoder, update);
      send(conn, encoding.toUint8Array(encoder));
    }
  };
  doc.on("update", onDocUpdate);

  // broadcast awareness changes
  const onAwarenessChange = ({ added, updated, removed }, origin) => {
    const changedClients = added.concat(updated, removed);
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageAwareness);
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(doc.awareness, changedClients)
    );
    const msg = encoding.toUint8Array(encoder);
    doc.conns.forEach((_, c) => send(c, msg));
  };
  doc.awareness.on("update", onAwarenessChange);

  conn.on("message", (message) => handleMessage(conn, doc, message));

  conn.on("close", () => {
    doc.off("update", onDocUpdate);
    doc.awareness.off("update", onAwarenessChange);
    const controlledIds = doc.conns.get(conn);
    doc.conns.delete(conn);
    if (controlledIds) {
      awarenessProtocol.removeAwarenessStates(
        doc.awareness,
        Array.from(controlledIds),
        null
      );
    }
    if (doc.conns.size === 0) {
      doc.destroy();
      docs.delete(doc.name);
    }
  });
});

server.listen(port, host, () => {
  console.log(`Yjs WebSocket server running on ${host}:${port}`);
});
