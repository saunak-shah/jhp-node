async function createUser(username, email, password) {
  const client = await pool.connect();
  try {
    const query = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *';
    const result = await client.query(query, [username, email, password]);
    return result.rows[0];
  } finally {
    client.release();
  }
}

async function findUserByUsername(username) {
  const client = await pool.connect();
  try {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await client.query(query, [username]);
    return result.rows[0];
  } finally {
    client.release();
  }
}

module.exports = {
  createUser,
  findUserByUsername,
};
