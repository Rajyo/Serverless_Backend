import { Hono } from 'hono';
import { userRouter } from './routes/user';
import { postRouter } from './routes/post';

// Create the main Hono app
const app = new Hono();


app.get('/', (c) => {
  return c.text('Hello from Hono Serverless Backend!')
})

app.route("/api/v1/user", userRouter)
app.route("/api/v1/post", postRouter)


export default app;
