'use server'

import { auth } from "../better-auth/auth";
import { inngest } from "../inngest/client";
import { headers } from "next/headers";

export const signUpWithEmail = async ({ email, password, fullName, country, investmentGoals, riskTolerance, preferredIndustry }: SignUpFormData) => {
    try {
        const response = await auth.api.signUpEmail({
            body: {
                email: email,
                password: password,
                name: fullName
            }
        });
        
        if(response) {
              await inngest.send({
                name: 'app/user.created',
                data: { email, name: fullName, country, investmentGoals, riskTolerance, preferredIndustry }
            })
        }

        return { success: true, data: response };
    } catch (error) {
        console.log('Sign up failed', error);
        return { success: false, error: 'Sign up failed' };
    }
}

export const signInWithEmail = async ({ email, password }: SignInFormData) => {
    try {
        const response = await auth.api.signInEmail({ body: { email, password } })
        return { success: true, data: response }
    } catch (e) {
        console.log('Sign in failed', e)
        // Attempt to extract an HTTP status code from the thrown error
        const err: any = e;
        const status = err?.status || err?.statusCode || err?.response?.status || err?.response?.statusCode || err?.data?.status;
        const message = err?.message || (err?.response && err.response?.message) || 'Sign in failed';
        return { success: false, error: message, status };
    }
}

export const signOut = async () => {
    try {
        await auth.api.signOut({ headers: await headers() });
    } catch (error) {
        console.log('Sign out failed', error);
        return { success: false, error: 'Sign out failed' };
    }
}