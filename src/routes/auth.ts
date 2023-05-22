import { FastifyInstance } from "fastify";
import { z } from "zod";
import axios from 'axios';
import { prisma } from "../lib/prisma";

export async function authRoutes(app: FastifyInstance) {
    app.post('/register', async (request) => {
       
        //Schema do Body Request para validar
        const bodySchema = z.object({
            code: z.string(),
        })

        const {code} = bodySchema.parse(request.body)

        //Buscando o Access Token no Github pelo codigo recebido no front End
        const accessTokenResponse = await axios.post(
            'https://github.com/login/oauth/access_token',
            null,
            {
                params: {
                    client_id: process.env.GITHUB_CLIENT_ID,
                    client_secret: process.env.GITHUB_CLIENT_SECRET,
                    code,
                },
                headers: {
                    Accept: 'application/json'
                }
            }
        )

        //Pegando o Access Token
        const {access_token} = accessTokenResponse.data;

        //Buscando os dados do usuario com o access token obtido
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        })

        //Schema para validar os dados do usuario 
        const userSchema = z.object({
          id: z.number(),
          login: z.string(),
          name: z.string(),
          avatar_url: z.string().url()  
        })

        //validando o usuario com zod
        const userInfo = userSchema.parse(userResponse.data);

        //Verifica se existe o usuario no banco de dados pelo githubID.
        let user = await prisma.user.findUnique({
            where: {
                githubId: userInfo.id, 
            }
        })

        // Se não existe o usuario ele cria no BD
        if(!user){
            user = await prisma.user.create({
                data: {
                   githubId: userInfo.id,
                   login: userInfo.login,
                   name: userInfo.name,
                   avatarUrl: userInfo.avatar_url 
                }
            })
        }

        //Criação de Token JWT para retornar ao Front End
        const token = app.jwt.sign({
            name: user.name,
            avatarUrl: user.avatarUrl,
        }, 
        {
         sub: user.id,
         expiresIn: '30 days',

        })
            

        //Retornando o usuario recebido.
        return {token};


    })
}