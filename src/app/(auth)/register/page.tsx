import { RegisterForm } from '@/components/auth/RegisterForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - SocialConnect',
};

export default function RegisterPage() {
  return <RegisterForm />;
}