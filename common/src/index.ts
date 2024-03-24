import z from "zod"

export const signUpInput = z.object({
    email : z.string().email().max(20),
    name: z.string().min(3).optional(),
    username: z.string().min(3),
    password: z.string().min(6).max(10)
})
export const signInInput = z.object({
    email : z.string().email().max(20),
    password: z.string().min(6).max(10)
})

export const createPostInput = z.object({
    title: z.string().min(3),
    content: z.string().min(10).max(100)
})

export const updatePostInput = z.object({
    title: z.string().min(3).optional(),
    content: z.string().min(10).max(100).optional()
})



export type SignUpInput = z.infer<typeof signUpInput>
export type SignInInput = z.infer<typeof signInInput>
export type CreatePostInput = z.infer<typeof createPostInput>
export type UpdatePostInput = z.infer<typeof updatePostInput>