import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

// MUDANÇA AQUI: Trocado localStorage por sessionStorage
const user = ref(JSON.parse(sessionStorage.getItem('user')) || null);
const token = ref(sessionStorage.getItem('token') || null);
const errorMessage = ref('');

export function useAuth() {
  const router = useRouter();

  const isAuthenticated = computed(() => !!token.value && !!user.value);

  const login = async (email, password) => {
    errorMessage.value = '';
    try {
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
      
      // MUDANÇA AQUI: Trocado localStorage por sessionStorage
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      
      router.push('/');

    } catch (err) {
      errorMessage.value = err.message;
    }
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    
    // MUDANÇA AQUI: Trocado localStorage por sessionStorage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    
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