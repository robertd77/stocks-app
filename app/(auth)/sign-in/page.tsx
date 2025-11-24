'use client'
import FooterLink from '@/components/forms/FooterLink';
import InputField from '@/components/forms/InputField';
import { Button } from '@/components/ui/button';
import { signInWithEmail } from '@/lib/actions/auth.actions';
import { useRouter } from 'next/navigation';
import React from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const SignIn = () => { 
    const router = useRouter();
    const {
          register,
          handleSubmit,
          control,
          formState: { errors, isSubmitting },
      } = useForm<SignInFormData>({
          defaultValues: {
              email: '',
              password: '',
          },
          mode: 'onBlur'
      }, );
  
            const onSubmit = async (data: SignInFormData) => {
                    try {
                            const result = await signInWithEmail(data);
                            if (result.success) {
                                router.push('/');
                            } else {
                                // show a specific message for 401 responses (incorrect credentials)
                                const isAuthError = result.status === 401;
                                const message = isAuthError
                                    ? 'Username or password incorrect.'
                                    : (typeof result.error === 'string' ? result.error : 'An unknown error has occurred.');

                                toast.error(isAuthError ? 'Sign in failed' : 'Sign in failed', {
                                    description: message,
                                });
                            }
                    } catch (error) {
                            console.error(error);
                            toast.error('Sign in failed', {
                                description: error instanceof Error ? error.message : 'Failed to sign in.'
                            });
                    }
            }

  return (
     <>
        <h1 className="form-title">Sign In to your account</h1>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
            <InputField 
                name="email"
                label="Email"
                placeholder="johndoe@email.com"
                register={register}
                error={errors.email}
                validation={{
                    required: 'Email is required',
                    pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid email address'
  }
}}
            />
            <InputField 
                name="password"
                label="Password"
                type="password"
                placeholder="Enter your password"
                register={register}
                error={errors.password}
                validation={{ required: 'Password is required'}}
            />
            <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full mt-5">
                    {isSubmitting ? 'Signing In' : 'Sign In'}
            </Button>
             <FooterLink text="Don't have an account?" linkText='Sign up' href='/sign-up' />
            </form>
            </>
  )
}


export default SignIn;