const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
io.setMaxListeners(20);

app.use(express.static("public"));

let rooms = {};
const ROUND_KILL_GOAL = 8;
const MAX_ROUNDS = 9;

// ===== MAPS =====
const maps = {
  arena: {
    width: 1400,
    height: 800,
    spawnPoints: [
      {x:200, y:650},
      {x:700, y:650},
      {x:1200, y:650}
    ],
    platforms: [
      {x:0, y:720, w:1400, h:80}, // ground
      {x:100, y:600, w:200, h:20},
      {x:400, y:500, w:200, h:20},
      {x:700, y:400, w:200, h:20},
      {x:1000, y:500, w:200, h:20},
      {x:1200, y:600, w:200, h:20},
      {x:300, y:300, w:150, h:20},
      {x:950, y:300, w:150, h:20},
      {x:600, y:200, w:200, h:20}
    ],
    spikes: [
      {x:0, y:700, w:100, h:20},
      {x:1300, y:700, w:100, h:20},
      {x:500, y:480, w:100, h:20},
      {x:800, y:480, w:100, h:20}
    ]
  },
  towers: {
    width: 1400,
    height: 800,
    spawnPoints: [
      {x:150, y:650},
      {x:1250, y:650},
      {x:700, y:450}
    ],
    platforms: [
      {x:0, y:720, w:1400, h:80},
      {x:100, y:650, w:150, h:20},
      {x:1150, y:650, w:150, h:20},
      {x:200, y:550, w:150, h:20},
      {x:1050, y:550, w:150, h:20},
      {x:300, y:450, w:150, h:20},
      {x:950, y:450, w:150, h:20},
      {x:400, y:350, w:150, h:20},
      {x:850, y:350, w:150, h:20},
      {x:550, y:250, w:150, h:20},
      {x:700, y:250, w:150, h:20}
    ],
    spikes: [
      {x:0, y:700, w:1400, h:20}, // bottom spikes
      {x:250, y:530, w:100, h:20},
      {x:1050, y:530, w:100, h:20},
      {x:450, y:330, w:100, h:20},
      {x:850, y:330, w:100, h:20}
    ]
  },
  chaos: {
    width: 1400,
    height: 800,
    spawnPoints: [
      {x:150, y:650},
      {x:700, y:400},
      {x:1250, y:650}
    ],
    platforms: [
      {x:0, y:720, w:1400, h:80},
      {x:50, y:600, w:150, h:20},
      {x:250, y:500, w:150, h:20},
      {x:450, y:400, w:150, h:20},
      {x:650, y:300, w:150, h:20},
      {x:850, y:400, w:150, h:20},
      {x:1050, y:500, w:150, h:20},
      {x:1200, y:600, w:150, h:20},
      {x:300, y:200, w:200, h:20},
      {x:900, y:200, w:200, h:20}
    ],
    spikes: [
      {x:200, y:580, w:100, h:20},
      {x:1100, y:580, w:100, h:20},
      {x:350, y:380, w:100, h:20},
      {x:950, y:380, w:100, h:20},
      {x:550, y:280, w:100, h:20},
      {x:750, y:280, w:100, h:20}
    ]
  },
  sniper: {
    width: 1600,
    height: 900,
    spawnPoints: [
      {x:100, y:750},
      {x:1500, y:750},
      {x:800, y:600}
    ],
    platforms: [
      {x:0, y:800, w:1600, h:100},
      {x:200, y:700, w:300, h:20},
      {x:1100, y:700, w:300, h:20},
      {x:500, y:600, w:200, h:20},
      {x:900, y:600, w:200, h:20},
      {x:700, y:500, w:200, h:20},
      {x:300, y:400, w:150, h:20},
      {x:1150, y:400, w:150, h:20},
      {x:600, y:300, w:150, h:20},
      {x:850, y:300, w:150, h:20}
    ],
    spikes: [
      {x:0, y:780, w:200, h:20},
      {x:1400, y:780, w:200, h:20},
      {x:750, y:480, w:100, h:20}
    ]
  },
  fortress: {
    width: 1400,
    height: 800,
    spawnPoints: [
      {x:200, y:650},
      {x:1200, y:650},
      {x:700, y:450}
    ],
    platforms: [
      {x:0, y:720, w:1400, h:80},
      {x:100, y:650, w:200, h:20},
      {x:1100, y:650, w:200, h:20},
      {x:300, y:550, w:200, h:20},
      {x:900, y:550, w:200, h:20},
      {x:500, y:450, w:200, h:20},
      {x:700, y:450, w:200, h:20},
      {x:400, y:350, w:150, h:20},
      {x:850, y:350, w:150, h:20},
      {x:600, y:250, w:200, h:20}
    ],
    spikes: [
      {x:0, y:700, w:100, h:20},
      {x:1300, y:700, w:100, h:20},
      {x:650, y:230, w:100, h:20}
    ]
  },
  maze: {
    width: 1400,
    height: 800,
    spawnPoints: [
      {x:100, y:650},
      {x:1300, y:650},
      {x:700, y:400}
    ],
    platforms: [
      {x:0, y:720, w:1400, h:80},
      {x:100, y:650, w:150, h:20},
      {x:350, y:650, w:150, h:20},
      {x:600, y:650, w:150, h:20},
      {x:850, y:650, w:150, h:20},
      {x:1100, y:650, w:150, h:20},
      {x:200, y:550, w:150, h:20},
      {x:450, y:550, w:150, h:20},
      {x:700, y:550, w:150, h:20},
      {x:950, y:550, w:150, h:20},
      {x:300, y:450, w:150, h:20},
      {x:550, y:450, w:150, h:20},
      {x:800, y:450, w:150, h:20},
      {x:1050, y:450, w:150, h:20},
      {x:400, y:350, w:150, h:20},
      {x:650, y:350, w:150, h:20},
      {x:900, y:350, w:150, h:20},
      {x:500, y:250, w:150, h:20},
      {x:750, y:250, w:150, h:20}
    ],
    spikes: [
      {x:0, y:700, w:100, h:20},
      {x:1300, y:700, w:100, h:20},
      {x:250, y:530, w:100, h:20},
      {x:1050, y:530, w:100, h:20},
      {x:600, y:230, w:100, h:20}
    ]
  },
  deatharrows: {
    width: 1500,
    height: 850,
    spawnPoints: [
      {x:150, y:650},
      {x:1350, y:650},
      {x:750, y:500}
    ],
    platforms: [
      {x:0, y:750, w:1500, h:100},
      {x:150, y:650, w:250, h:20},
      {x:1100, y:650, w:250, h:20},
      {x:400, y:550, w:200, h:20},
      {x:900, y:550, w:200, h:20},
      {x:600, y:450, w:300, h:20},
      {x:300, y:350, w:200, h:20},
      {x:1000, y:350, w:200, h:20},
      {x:500, y:250, w:200, h:20},
      {x:800, y:250, w:200, h:20},
      {x:650, y:150, w:200, h:20}
    ],
    spikes: [
      {x:0, y:730, w:150, h:20},
      {x:1350, y:730, w:150, h:20},
      {x:700, y:130, w:100, h:20},
      {x:200, y:630, w:100, h:20},
      {x:1200, y:630, w:100, h:20}
    ]
  }
};

function normalize(x, y) {
  const len = Math.hypot(x, y);
  if (len === 0) return {x: 1, y: 0};
  return {x: x / len, y: y / len};
}

function getSpawnPoint(map) {
  if (!map || !map.spawnPoints || map.spawnPoints.length === 0) {
    return {x: 400, y: 200};
  }
  return map.spawnPoints[Math.floor(Math.random() * map.spawnPoints.length)];
}

function isPlayerGrounded(player, map) {
  if (!map) return false;
  const groundY = map.height - 20;
  if (player.y >= groundY - 1 && player.y <= groundY + 5) {
    return true;
  }
  for (const plat of map.platforms) {
    if (
      player.x > plat.x &&
      player.x < plat.x + plat.w &&
      player.y >= plat.y - 22 &&
      player.y <= plat.y - 16
    ) {
      return true;
    }
  }
  return false;
}

function addAiBot(room) {
  const map = maps[room.map];
  const spawn = getSpawnPoint(map);
  room.players['bot_msty'] = {
    x: spawn.x,
    y: spawn.y,
    vx: 0,
    vy: 0,
    name: 'Msty',
    color: '#ff5577',
    input: {dx: 0, dy: 0, shoot: false, aimX: spawn.x + 100, aimY: spawn.y, aimDirX: 0, aimDirY: 0},
    shootCooldown: 0,
    kills: 0,
    deaths: 0,
    ai: true
  };
}

function updateBotInput(bot, room) {
  const map = maps[room.map];
  const targets = Object.values(room.players).filter(p => !p.ai && p !== bot);
  if (targets.length === 0) {
    bot.input.dx = 0;
    bot.input.dy = 0;
    bot.input.shoot = false;
    return;
  }
  let target = targets[0];
  let best = Infinity;
  for (const candidate of targets) {
    const dist = Math.hypot(candidate.x - bot.x, candidate.y - bot.y);
    if (dist < best) {
      best = dist;
      target = candidate;
    }
  }
  const dx = target.x - bot.x;
  bot.input.dx = dx < -10 ? -1 : dx > 10 ? 1 : 0;
  bot.input.aimX = target.x;
  bot.input.aimY = target.y;
  if (isPlayerGrounded(bot, map) && target.y < bot.y - 10 && Math.abs(dx) < 260) {
    bot.input.dy = -1;
  } else {
    bot.input.dy = 0;
  }
  if (bot.shootCooldown <= 0 && Math.abs(dx) < 700 && Math.random() < 0.08) {
    bot.input.shoot = true;
  } else {
    bot.input.shoot = false;
  }
}

function switchRoomMap(room, mapName, actor) {
  if (!maps[mapName]) return;
  room.map = mapName;
  room.projectiles = [];
  room.roundWinner = null;
  room.roundEndAt = 0;
  room.events.push({text: `${actor} switched the map to ${mapName}`, time: Date.now()});
  room.chat.push({name: 'SYSTEM', text: `${actor} changed the match to ${mapName}`});
  room.chat = room.chat.slice(-20);
  const map = maps[mapName];
  for (const id in room.players) {
    const player = room.players[id];
    const spawn = getSpawnPoint(map);
    player.x = spawn.x;
    player.y = spawn.y;
    player.vx = 0;
    player.vy = 0;
    player.input.shoot = false;
  }
}

function listRooms() {
  const result = {};
  for (const roomId in rooms) {
    const room = rooms[roomId];
    result[roomId] = {
      name: room.name,
      map: room.map,
      players: Object.keys(room.players).length
    };
  }
  return result;
}

function getRoom(id) {
  for (const roomId in rooms) {
    if (rooms[roomId].players[id]) return rooms[roomId];
  }
  return null;
}

function getRoomId(id) {
  for (const roomId in rooms) {
    if (rooms[roomId].players[id]) return roomId;
  }
  return null;
}

function respawn(player, room, reason) {
  const map = maps[room.map];
  const spawn = getSpawnPoint(map);
  player.x = spawn.x;
  player.y = spawn.y;
  player.vx = 0;
  player.vy = 0;
  player.input.shoot = false;
  if (reason) {
    room.events.push({text: `${player.name} ${reason}`, time: Date.now()});
  }
}

function createRoomId() {
  return `room_${Math.floor(Math.random() * 9000 + 1000)}`;
}

function joinRoom(socket, id, data) {
  const room = rooms[id];
  if (!room) return;

  socket.join(id);
  const map = maps[room.map];
  const spawn = getSpawnPoint(map);
  room.players[socket.id] = {
    x: spawn.x,
    y: spawn.y,
    vx: 0,
    vy: 0,
    name: data.username || `Player${Math.floor(Math.random() * 1000)}`,
    color: data.color || "#00ffc3",
    input: {dx: 0, dy: 0, shoot: false, aimX: spawn.x + 100, aimY: spawn.y, aimDirX: 0, aimDirY: 0},
    shootCooldown: 0,
    kills: 0,
    deaths: 0
  };

  socket.emit("mapData", {name: room.map, map});
  socket.emit("joinedRoom", {roomId: id});
  io.to(id).emit("roomList", listRooms());
}

function removePlayer(id) {
  for (const roomId in rooms) {
    const room = rooms[roomId];
    if (room.players[id]) {
      delete room.players[id];
      io.to(roomId).emit("roomList", listRooms());
      if (Object.keys(room.players).length === 0) {
        delete rooms[roomId];
      }
      break;
    }
  }
}

io.on("connection", (socket) => {
  socket.on("createRoom", (data) => {
    const id = createRoomId();
    rooms[id] = {
      name: data.roomName || "Pulse Arena",
      map: data.map || "arena",
      players: {},
      projectiles: [],
      events: [],
      chat: [],
      round: 1,
      roundWinner: null,
      roundEndAt: 0,
      matchOver: false,
      matchWinner: null
    };
    joinRoom(socket, id, data);
    if (data.bot) {
      addAiBot(rooms[id]);
    }
  });

  socket.on("joinRoom", (data) => {
    if (rooms[data.roomId]) {
      joinRoom(socket, data.roomId, data);
    }
  });

  socket.on("getRooms", () => {
    socket.emit("roomList", listRooms());
  });

  socket.on("input", (input) => {
    const room = getRoom(socket.id);
    if (!room) return;
    const player = room.players[socket.id];
    if (!player) return;
    player.input.dx = Math.max(-1, Math.min(1, input.dx || 0));
    player.input.dy = input.dy || 0;
    player.input.shoot = input.shoot || false;
    if (typeof input.aimX === "number") player.input.aimX = input.aimX;
    if (typeof input.aimY === "number") player.input.aimY = input.aimY;
    player.input.aimDirX = input.aimDirX || 0;
    player.input.aimDirY = input.aimDirY || 0;
  });

  socket.on("chatMessage", (message) => {
    const room = getRoom(socket.id);
    if (!room) return;
    const player = room.players[socket.id];
    if (!player || typeof message !== 'string') return;
    const text = message.trim().slice(0, 100);
    if (!text) return;
    room.chat.push({name: player.name, text, time: Date.now()});
    room.chat = room.chat.slice(-20);
  });

  socket.on("switchMap", (payload) => {
    const room = getRoom(socket.id);
    if (!room) return;
    const player = room.players[socket.id];
    if (!player) return;
    if (!payload || typeof payload.map !== 'string') return;
    if (!maps[payload.map]) return;
    switchRoomMap(room, payload.map, player.name);
    const roomId = getRoomId(socket.id);
    if (roomId) {
      io.to(roomId).emit("mapData", {name: room.map, map: maps[room.map]});
    }
  });

  socket.on("disconnect", () => removePlayer(socket.id));
});

setInterval(() => {
  for (const roomId in rooms) {
    const room = rooms[roomId];
    const players = room.players;
    const map = maps[room.map];
    const width = map.width || 1200;
    const height = map.height || 720;

    for (const id in players) {
      const p = players[id];
      if (p.ai) {
        updateBotInput(p, room);
      }
      if (p.shootCooldown > 0) p.shootCooldown -= 1;
      p.vx = p.input.dx * 7;
      if (p.input.dy < 0 && p.vy >= -1 && isPlayerGrounded(p, map)) {
        p.vy = -18;
      }

      if (p.input.shoot && p.shootCooldown <= 0) {
        let aimX = p.x + 100;
        let aimY = p.y;
        if (typeof p.input.aimX === "number" && typeof p.input.aimY === "number") {
          aimX = p.input.aimX;
          aimY = p.input.aimY;
        } else if (p.input.aimDirX !== 0 || p.input.aimDirY !== 0) {
          aimX = p.x + p.input.aimDirX * 1000;
          aimY = p.y + p.input.aimDirY * 1000;
        }
        const dir = normalize(aimX - p.x, aimY - p.y);
        room.projectiles.push({
          x: p.x,
          y: p.y,
          vx: dir.x * 16,
          vy: dir.y * 16,
          owner: id,
          bounces: 4,
          life: 200,
          color: p.color
        });
        p.shootCooldown = 20;
      }

      p.vy += 1.1;
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = 0;
      if (p.x > width) p.x = width;

      for (const plat of map.platforms) {
        if (
          p.x > plat.x &&
          p.x < plat.x + plat.w &&
          p.y > plat.y - 30 &&
          p.y < plat.y + 20 &&
          p.vy >= 0
        ) {
          p.y = plat.y - 20;
          p.vy = 0;
        }
      }

      if (p.y > height + 100 || p.y < -100) {
        p.deaths += 1;
        respawn(p, room, "fell out");
      }

      for (const spike of map.spikes) {
        if (
          p.x > spike.x &&
          p.x < spike.x + spike.w &&
          p.y > spike.y - 20 &&
          p.y < spike.y + spike.h
        ) {
          p.deaths += 1;
          respawn(p, room, "was impaled");
        }
      }
    }

    for (const proj of room.projectiles) {
      proj.vy += 0.6; // gravity like Bonk
      proj.x += proj.vx;
      proj.y += proj.vy;
      proj.life -= 1;
      let dead = false;

      if (proj.x < 0 || proj.x > width) {
        proj.vx *= -0.85; // energy loss on bounce
        proj.x = Math.max(0, Math.min(width, proj.x));
        proj.bounces -= 1;
      }
      if (proj.y < 0 || proj.y > height) {
        proj.vy *= -0.85;
        proj.y = Math.max(0, Math.min(height, proj.y));
        proj.bounces -= 1;
      }

      for (const plat of map.platforms) {
        if (proj.x > plat.x && proj.x < plat.x + plat.w && proj.y > plat.y - 8 && proj.y < plat.y + plat.h + 8) {
          proj.vy *= -0.85;
          if (proj.y < plat.y) {
            proj.y = plat.y - 10;
          } else {
            proj.y = plat.y + plat.h + 10;
          }
          proj.bounces -= 1;
        }
      }

      for (const pid in players) {
        if (pid === proj.owner) continue;
        const pl = players[pid];
        const dx = pl.x - proj.x;
        const dy = pl.y - proj.y;
        if (Math.hypot(dx, dy) < 22) {
          const owner = players[proj.owner];
          owner.kills += 1;
          pl.deaths += 1;
          respawn(pl, room, `was shot by ${owner.name}`);
          room.events.push({text: `${owner.name} tagged ${pl.name}`, time: Date.now()});
          if (!room.roundWinner && owner.kills >= ROUND_KILL_GOAL) {
            room.roundWinner = {id: proj.owner, name: owner.name, color: owner.color, round: room.round};
            room.roundEndAt = Date.now() + 5000;
            room.events.push({text: `${owner.name} wins round ${room.round}!`, time: Date.now()});
            room.chat.push({name: 'SYSTEM', text: `${owner.name} won round ${room.round}`});
            room.chat = room.chat.slice(-20);
            if (room.round >= MAX_ROUNDS) {
              room.matchOver = true;
              room.matchWinner = owner.name;
              room.events.push({text: `${owner.name} wins the match!`, time: Date.now()});
              room.chat.push({name: 'SYSTEM', text: `${owner.name} won the match!`});
              room.chat = room.chat.slice(-20);
            }
          }
          dead = true;
          break;
        }
      }

      if (proj.life <= 0 || proj.bounces < 0) dead = true;
      proj.dead = dead;
    }

    room.projectiles = room.projectiles.filter(p => !p.dead);
    room.events = room.events.filter(evt => Date.now() - evt.time < 6000).slice(-200);
    room.chat = room.chat.slice(-20);

    if (room.roundWinner && Date.now() > room.roundEndAt) {
      if (!room.matchOver) {
        room.round += 1;
        room.roundWinner = null;
        room.roundEndAt = 0;
        room.projectiles = [];
        room.events.push({text: `Round ${room.round} begins!`, time: Date.now()});
        room.chat.push({name: 'SYSTEM', text: `Round ${room.round} has started`});
        room.chat = room.chat.slice(-20);
        const nextMap = maps[room.map];
        for (const id in players) {
          const player = players[id];
          const spawn = getSpawnPoint(nextMap);
          player.x = spawn.x;
          player.y = spawn.y;
          player.vx = 0;
          player.vy = 0;
          player.input.shoot = false;
        }
      }
    }

    io.to(roomId).emit("state", {
      players,
      mapName: room.map,
      round: room.round,
      winner: room.roundWinner,
      matchOver: room.matchOver || false,
      matchWinner: room.matchWinner || null,
      projectiles: room.projectiles,
      events: room.events.slice(-5),
      chat: room.chat.slice(-10)
    });
  }
}, 33);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Running on ${PORT}`)).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const alt = Number(PORT) + 1;
    server.listen(alt, () => console.log(`Port ${PORT} busy, running on ${alt}`));
  } else {
    console.error(err);
    process.exit(1);
  }
});
