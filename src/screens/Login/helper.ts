import { z } from 'zod'

const getSchema = (t: (key: string) => string) => {
  const formSchema = z.object({
    email: z.string().email(t('LoginForm.emailInvalid')),
    password: z.string().min(8, t('LoginForm.passwordRequired')),
  })

  return formSchema
}

export { getSchema }
