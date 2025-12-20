const clients = new Set();

function addClient(res) {
  clients.add(res);
}

function removeClient(res) {
  clients.delete(res);
}

function send(res, event, data) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function broadcast(event, data) {
  for (const res of clients) {
    try {
      send(res, event, data);
    } catch (e) {
      // if a client is broken, drop it
      clients.delete(res);
    }
  }
}

module.exports = { addClient, removeClient, broadcast, send };
