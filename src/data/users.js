// ⚠️ 内存数组：进程重启就清空，多进程不共享，这不是数据库！
const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com', createdAt: new Date().toISOString() },
];
let nextId = 2;

function findAll() {
  return users;
}

function findById(id) {
  return users.find((u) => u.id === id);
}

function insert({ name, email }) {
  const user = { id: nextId++, name, email, createdAt: new Date().toISOString() };
  users.push(user);
  return user;
}

module.exports = { findAll, findById, insert };