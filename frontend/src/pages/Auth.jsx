import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormField from '../components/FormField';
import Panel from '../components/Panel';
import StatusBanner from '../components/StatusBanner';
import { useAuth } from '../context/Auth';

const initialRegisterState = {
  name: '',
  email: '',
  phone: '',
  address: '',
  password: '',
  otp: '',
  otp_jwt_token: '',
};

export default function AuthPage() {
  const navigate = useNavigate();
  const { api, login } = useAuth();
  const googleButtonRef = useRef(null);
  const [activeTab, setActiveTab] = useState('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState(initialRegisterState);
  const [forgotData, setForgotData] = useState({
    email: '',
    otp_jwt_token: '',
    otp: '',
    new_password: '',
  });
  const [feedback, setFeedback] = useState({ type: 'info', message: '' });
  const [otpHint, setOtpHint] = useState('');
  const [loadingAction, setLoadingAction] = useState('');
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const setMessage = (type, message) => setFeedback({ type, message });

  useEffect(() => {
    if (activeTab !== 'login' || !googleClientId || !googleButtonRef.current) {
      return undefined;
    }

    let cancelled = false;

    const loadGoogleScript = () =>
      new Promise((resolve, reject) => {
        if (window.google?.accounts?.id) {
          resolve();
          return;
        }

        const existingScript = document.querySelector('script[data-google-identity="true"]');
        if (existingScript) {
          existingScript.addEventListener('load', resolve, { once: true });
          existingScript.addEventListener('error', reject, { once: true });
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.dataset.googleIdentity = 'true';
        script.addEventListener('load', resolve, { once: true });
        script.addEventListener('error', reject, { once: true });
        document.head.appendChild(script);
      });

    const initializeGoogle = async () => {
      try {
        await loadGoogleScript();

        if (cancelled || !window.google?.accounts?.id || !googleButtonRef.current) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            setLoadingAction('google-login');
            setMessage('info', '');

            try {
              const { data } = await api.post('/auth/google', {
                google_id_token: response.credential,
              });

              login({
                authToken: data.auth_jwt_token,
                refreshToken: data.refresh_token,
                userEmail: '',
              });

              navigate('/dashboard');
            } catch (error) {
              setMessage('error', error.response?.data?.message || 'Google sign-in failed');
            } finally {
              setLoadingAction('');
            }
          },
        });

        googleButtonRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          width: 320,
          text: 'signin_with',
        });
      } catch (error) {
        if (!cancelled) {
          setMessage('error', 'Google sign-in could not be loaded');
        }
      }
    };

    initializeGoogle();

    return () => {
      cancelled = true;
    };
  }, [activeTab, api, googleClientId, login, navigate]);

  const updateLoginField = (event) => {
    setLoginData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const updateRegisterField = (event) => {
    setRegisterData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const updateForgotField = (event) => {
    setForgotData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoadingAction('login');
    setMessage('info', '');

    try {
      const { data } = await api.post('/auth/login', loginData);
      login({
        authToken: data.auth_jwt_token,
        refreshToken: data.refresh_token,
        userEmail: loginData.email,
      });
      navigate('/dashboard');
    } catch (error) {
      setMessage('error', error.response?.data?.message || 'Login failed');
    } finally {
      setLoadingAction('');
    }
  };

  const handleGenerateRegisterOtp = async () => {
    if (!registerData.email) {
      setMessage('error', 'Enter your email before generating OTP');
      return;
    }

    setLoadingAction('register-otp');
    setMessage('info', '');

    try {
      const { data } = await api.post('/auth/generate_otp', { email: registerData.email });
      setRegisterData((current) => ({ ...current, otp_jwt_token: data.otp_jwt_token }));
      setOtpHint('OTP generated. If SMTP is not configured, check the backend terminal.');
      setMessage('success', 'Registration OTP generated successfully');
    } catch (error) {
      setMessage('error', error.response?.data?.message || 'Failed to generate OTP');
    } finally {
      setLoadingAction('');
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setLoadingAction('register');
    setMessage('info', '');

    try {
      const { data } = await api.post('/auth/register', registerData);
      login({
        authToken: data.auth_jwt_token,
        refreshToken: '',
        userEmail: registerData.email,
      });
      navigate('/dashboard');
    } catch (error) {
      setMessage('error', error.response?.data?.message || 'Registration failed');
    } finally {
      setLoadingAction('');
    }
  };

  const handleForgotPasswordOtp = async () => {
    if (!forgotData.email) {
      setMessage('error', 'Enter your email before requesting reset OTP');
      return;
    }

    setLoadingAction('forgot-otp');
    setMessage('info', '');

    try {
      const { data } = await api.post('/auth/forgot_password', { email: forgotData.email });
      setForgotData((current) => ({ ...current, otp_jwt_token: data.otp_jwt_token }));
      setOtpHint('Password reset OTP generated. Check backend logs if email is not configured.');
      setMessage('success', 'Password reset OTP generated successfully');
    } catch (error) {
      setMessage('error', error.response?.data?.message || 'Failed to generate reset OTP');
    } finally {
      setLoadingAction('');
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setLoadingAction('reset-password');
    setMessage('info', '');

    try {
      await api.post('/auth/reset_password', forgotData);
      setActiveTab('login');
      setMessage('success', 'Password reset successful. You can log in now.');
      setForgotData({
        email: forgotData.email,
        otp_jwt_token: '',
        otp: '',
        new_password: '',
      });
    } catch (error) {
      setMessage('error', error.response?.data?.message || 'Password reset failed');
    } finally {
      setLoadingAction('');
    }
  };

  return (
    <main className="auth-shell">
      <section className="hero-card">
        <p className="eyebrow">VendorFlow</p>
        <h1>Keep vendor payments, identity, and wallet activity in one calm place.</h1>
        <p className="hero-copy">
          This frontend is wired to your current backend only: OTP registration, login, profile,
          balance, deposits, withdrawals, budgets, and transaction history.
        </p>
        <div className="hero-grid">
          <div>
            <strong>Auth ready</strong>
            <span>OTP signup, login, and password reset</span>
          </div>
          <div>
            <strong>Profile ready</strong>
            <span>View and update account details with image upload</span>
          </div>
          <div>
            <strong>Wallet ready</strong>
            <span>Balance, budget, deposits, withdrawals, and history</span>
          </div>
        </div>
      </section>

      <section className="auth-card">
        <div className="tab-row">
          <button
            className={activeTab === 'login' ? 'tab-button tab-button--active' : 'tab-button'}
            onClick={() => setActiveTab('login')}
            type="button"
          >
            Login
          </button>
          <button
            className={activeTab === 'register' ? 'tab-button tab-button--active' : 'tab-button'}
            onClick={() => setActiveTab('register')}
            type="button"
          >
            Register
          </button>
          <button
            className={activeTab === 'forgot' ? 'tab-button tab-button--active' : 'tab-button'}
            onClick={() => setActiveTab('forgot')}
            type="button"
          >
            Reset Password
          </button>
        </div>

        <StatusBanner type={feedback.type}>{feedback.message || otpHint}</StatusBanner>

        {activeTab === 'login' ? (
          <Panel title="Sign in" subtitle="Use your backend-issued JWT to enter the dashboard.">
            <form className="form-grid" onSubmit={handleLogin}>
              <FormField
                label="Email"
                name="email"
                type="email"
                value={loginData.email}
                onChange={updateLoginField}
                required
              />
              <FormField
                label="Password"
                name="password"
                type="password"
                value={loginData.password}
                onChange={updateLoginField}
                required
              />
              <button className="primary-button" disabled={loadingAction === 'login'} type="submit">
                {loadingAction === 'login' ? 'Signing in...' : 'Login'}
              </button>
            </form>
            <div className="oauth-divider">
              <span>or continue with Google</span>
            </div>
            {googleClientId ? (
              <div className="google-auth-shell">
                <div ref={googleButtonRef} className="google-auth-button" />
                {loadingAction === 'google-login' ? (
                  <p className="oauth-note">Exchanging Google credential with your backend...</p>
                ) : null}
              </div>
            ) : (
              <p className="oauth-note">
                Add <code>VITE_GOOGLE_CLIENT_ID</code> in <code>frontend/.env</code> to enable Google sign-in.
              </p>
            )}
          </Panel>
        ) : null}

        {activeTab === 'register' ? (
          <Panel
            title="Create account"
            subtitle="Generate OTP first, then complete registration with the token and code."
            actions={
              <button
                className="secondary-button"
                type="button"
                onClick={handleGenerateRegisterOtp}
                disabled={loadingAction === 'register-otp'}
              >
                {loadingAction === 'register-otp' ? 'Generating...' : 'Generate OTP'}
              </button>
            }
          >
            <form className="form-grid" onSubmit={handleRegister}>
              <FormField label="Name" name="name" value={registerData.name} onChange={updateRegisterField} required />
              <FormField label="Email" name="email" type="email" value={registerData.email} onChange={updateRegisterField} required />
              <FormField label="Phone" name="phone" value={registerData.phone} onChange={updateRegisterField} required />
              <FormField label="Address" name="address" value={registerData.address} onChange={updateRegisterField} required />
              <FormField label="Password" name="password" type="password" value={registerData.password} onChange={updateRegisterField} required />
              <FormField label="OTP JWT Token" name="otp_jwt_token" value={registerData.otp_jwt_token} onChange={updateRegisterField} required />
              <FormField label="OTP" name="otp" value={registerData.otp} onChange={updateRegisterField} required />
              <button className="primary-button" disabled={loadingAction === 'register'} type="submit">
                {loadingAction === 'register' ? 'Creating account...' : 'Register'}
              </button>
            </form>
          </Panel>
        ) : null}

        {activeTab === 'forgot' ? (
          <Panel
            title="Reset password"
            subtitle="Request a reset OTP, then submit the OTP and your new password."
            actions={
              <button
                className="secondary-button"
                type="button"
                onClick={handleForgotPasswordOtp}
                disabled={loadingAction === 'forgot-otp'}
              >
                {loadingAction === 'forgot-otp' ? 'Generating...' : 'Generate Reset OTP'}
              </button>
            }
          >
            <form className="form-grid" onSubmit={handleResetPassword}>
              <FormField label="Email" name="email" type="email" value={forgotData.email} onChange={updateForgotField} required />
              <FormField label="OTP JWT Token" name="otp_jwt_token" value={forgotData.otp_jwt_token} onChange={updateForgotField} required />
              <FormField label="OTP" name="otp" value={forgotData.otp} onChange={updateForgotField} required />
              <FormField label="New Password" name="new_password" type="password" value={forgotData.new_password} onChange={updateForgotField} required />
              <button className="primary-button" disabled={loadingAction === 'reset-password'} type="submit">
                {loadingAction === 'reset-password' ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </Panel>
        ) : null}
      </section>
    </main>
  );
}
