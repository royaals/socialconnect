'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);

    try {
     
      const isEmail = data.emailOrUsername.includes('@');
      
      let email = data.emailOrUsername;
      
     
      if (!isEmail) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', data.emailOrUsername)
          .single();

        if (profileError || !profile) {
          toast({
            title: 'Error',
            description: 'Invalid username or password',
          });
          setIsLoading(false);
          return;
        }
        
        email = profile.email;
      }

      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password: data.password,
      });

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
        });
        return;
      }

     
      if (authData.user) {
        await supabase
          .from('profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('id', authData.user.id);
      }

      toast({
        title: 'Success',
        description: 'Logged in successfully',
      });

      
      window.location.href = '/home';
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong',
      });
    } finally {
      setIsLoading(false);
    }
  };

return (
    <div className="w-full max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          to continue to Social Connect
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="emailOrUsername"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Email address or username
          </label>
          <Input
            id="emailOrUsername"
            type="text"
            {...register('emailOrUsername')}
            disabled={isLoading}
          />
          {errors.emailOrUsername && (
            <p className="mt-1 text-sm text-red-600">
              {errors.emailOrUsername.message}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-[#F59E0B] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            {...register('password')}
            disabled={isLoading}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'SIGNING IN...' : 'CONTINUE'}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        No account?{' '}
        <Link
          href="/register"
          className="font-medium text-[#F59E0B] hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}