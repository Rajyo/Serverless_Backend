import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { verify } from "hono/jwt";
import {createPostInput, updatePostInput} from "@prajyot_khadse/blog-common"


export const postRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string
    },
    Variables: {
        userId: string
    }
}>();



postRouter.use("/*", async (c, next) => {
    const header = c.req.header('Authorization')
    if (!header) {
        return c.text("Unauthorized", 401)
    }

    const token = header.split(" ")[1]
    const payload = await verify(token, c.env.JWT_SECRET)
    if (!payload) {
        return c.text("Unauthorized", 401)
    }

    c.set('userId', payload.id)
    await next()
})



postRouter.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
        const blogs = await prisma.post.findMany()
        return c.json({ blogs }, 200)
    } 
    catch(error: any) {
        console.log("error", error);
        return c.json({error: error?.meta?.cause}, 500)
    }
})


postRouter.get('/:id', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate())
    const postId = c.req.param('id')

    try {
        const blog = await prisma.post.findFirst({
            where: {
                id: postId
            }
        })
        return c.json({ blog }, 200)
    } 
    catch(error: any) {
        console.log("error", error);
        return c.json({error: error?.meta?.cause}, 500)
    }
})


postRouter.post('/create', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate())
    const body = await c.req.json()
    const userId = c.get('userId')
    const {success} = createPostInput.safeParse(body)
    if(!success){
        return c.json({ message: "Incorrect Input" }, 411)
    }

    try {
        const post = await prisma.post.create({
            data: {
                title: body.title,
                content: body.content,
                authorId: userId
            }
        })

        return c.json({ id: post.id })
    }
    catch(error: any) {
        console.log("error", error);
        return c.json({error: error?.meta?.cause}, 500)
    }
})


postRouter.put('/update/:id', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate())
    const body = await c.req.json()
    const postId = c.req.param('id')
    const {success} = updatePostInput.safeParse(body)
    if(!success){
        return c.json({ message: "Incorrect Input" }, 411)
    }

    try {
        const updatedPost = await prisma.post.update({
            where: {
                id: postId,
            },
            data: {
                title: body.title,
                content: body.content,
            }
        })

        return c.json({ updatedPost })
    }
    catch(error: any) {
        console.log("error", error);
        return c.json({error: error?.meta?.cause}, 500)
    }
})


postRouter.delete('/delete/:id', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate())
    const postId = c.req.param('id')

    try {
        await prisma.post.delete({
            where: {
                id: postId,
            }
        })
        return c.text("Post Deleted", 200)
    }
    catch(error: any) {
        console.log("error", error);
        return c.json({error: error?.meta?.cause || error}, 500)
    }
})
