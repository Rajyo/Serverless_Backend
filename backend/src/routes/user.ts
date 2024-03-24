import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from "hono/jwt"
import { hash, compare } from "bcryptjs"
import { signUpInput, signInInput } from "@prajyot_khadse/blog-common";



export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string
    }
}>();


userRouter.post('/signup', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate())
    
    const body = await c.req.json()
    const {success} = signUpInput.safeParse(body)
    if(!success){
        return c.json({ message: "Incorrect Input" }, 411)
    }

    try {
        const hashedPassword = await hash(body.password, 12)
        const user = await prisma.user.create({
            data: {
                email: body.email,
                name: body.name,
                username: body.username,
                password: hashedPassword
            }
        })
        const jwt = await sign({ id: user.id }, c.env.JWT_SECRET)

        // console.log(user);
        return c.json({ jwt }, 201)

    } catch (error) {
        console.log(error);
        c.status(411)
        return c.text("Invalid")
    }

})


userRouter.post('/signin', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate())
    
    const body = await c.req.json()
    const {success} = signInInput.safeParse(body)
    if(!success){
        return c.json({ message: "Incorrect Input" }, 411)
    }

    try {
        const user = await prisma.user.findFirst({
            where: { email: body.email }
        })
        if (!user) {
            return c.json({ message: "Incorrect email" }, 403)
        }

        const passMatch = await compare(body.password, user.password)
        if (!passMatch) {
            return c.json({ message: "Incorrect Password" }, 403)
        }

        const jwt = await sign({ id: user.id }, c.env.JWT_SECRET)

        // console.log(user);
        return c.json({ jwt }, 200)

    } catch (error) {
        console.log(error);
        c.status(411)
        return c.text("Invalid")
    }
})