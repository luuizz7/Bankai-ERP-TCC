import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const user = ref(JSON.parse(localStorage.getItem('user')) || null);
const token = ref(localStorage.getItem('token') || null);
const errorMessage = ref('');

export function useAuth() {
  const router = useRouter();

  const isAuthenticated = computed(() => !!token.value && !!user.value);

  const login = async (email, password) => {
    errorMessage.value = '';
    try {
      // A CORREÇÃO ESTÁ NESTA LINHA:
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro de autenticação');
      }

      token.value = data.token;
      user.value = data.user;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      router.push('/');

    } catch (err) {
      errorMessage.value = err.message;
    }
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    errorMessage
  };
}