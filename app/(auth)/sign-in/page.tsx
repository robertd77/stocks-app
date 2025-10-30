'use client'
import FooterLink from '@/components/forms/FooterLink';
import InputField from '@/components/forms/InputField';
import { Button } from '@/components/ui/button';
import React from 'react'
import { useForm } from 'react-hook-form';

const SignIn = () => { 
 
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
              console.log(data);
          } catch (error) {
              console.error(error);
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
                validation={{ required: 'Valid email address is required', pattern: /^\w+@\w+\.\w+$/, }}
            />
            <InputField 
                name="password"
                label="Password"
                type="password"
                placeholder="Enter a strong password"
                register={register}
                error={errors.password}
                validation={{ required: 'Password is required', minLength: 8 }}
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