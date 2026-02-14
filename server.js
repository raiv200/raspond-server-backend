require('dotenv').config();
require('./src/config/env');

const app = require('./src/app');
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`

  ┌──────────────────────────────────────────────────┐
  │   Raspond API Server v2.0                        |
  │   Port: ${PORT}                                  |
  │   Env: ${process.env.NODE_ENV }                  |
  │   API:  http://localhost:${PORT}/api             |
  └──────────────────────────────────────────────────┘

  `);
});
