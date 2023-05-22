import 'dotenv/config'
import fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import { memoriesRoutes } from './routes/memories'
import { authRoutes } from './routes/auth'
import { uploadRoutes } from './routes/upload'
import { resolve } from "node:path";
const app = fastify()

//Config Cors
app.register(cors,  {
  origin: true, //todas urls de front-end poderam acessar o nosso back-end
})

//Config JWT
app.register(jwt,  {
  secret: 'spacetime'
})

//Deixar pasta Estatica
app.register(require('@fastify/static'), {
  root: resolve(__dirname, '../uploads'),
  prefix: '/uploads'
})

//Config MultiForm Data
app.register(multipart)


//Rotas
app.register(authRoutes)
app.register(uploadRoutes);
app.register(memoriesRoutes);


//Listen
app.listen({
    port: 3333,
    host: '0.0.0.0',
})
.then(() => {
    console.log('🚀 HTTP Server Running on http://localhost:3333')
})
