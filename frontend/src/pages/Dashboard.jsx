import { useEffect, useState } from 'react';
import Panel from '../components/Panel';
import StatusBanner from '../components/StatusBanner';
import FormField from '../components/FormField';
import { useAuth } from '../context/Auth';

const emptyProfileForm = {
  name: '',
  phone: '',
  address: '',
  business: '',
};

export default function DashboardPage() {
  const { api, logout, userEmail } = useAuth();
  const [profile, setProfile] = useState(null);
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [profileForm, setProfileForm] = useState(emptyProfileForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [budgetForm, setBudgetForm] = useState({
    overall_limit: '',
    vendor_id: '',
    vendor_limit: '',
  });
  const [moneyForm, setMoneyForm] = useState({
    deposit: '',
    withdraw: '',
  });
  const [status, setStatus] = useState({ type: 'info', message: '' });
  const [loading, setLoading] = useState(true);

  const showStatus = (type, message) => setStatus({ type, message });

  const loadDashboard = async () => {
    setLoading(true);

    try {
      const [profileResponse, balanceResponse, transactionsResponse] = await Promise.all([
        api.get('/get_user'),
        api.get('/get_balance'),
        api.get('/get_transaction_history?limit=8'),
      ]);

      setProfile(profileResponse.data);
      setBalance(balanceResponse.data);
      setTransactions(transactionsResponse.data.transactions || []);
      setProfileForm({
        name: profileResponse.data.name || '',
        phone: profileResponse.data.phone || '',
        address: profileResponse.data.address || '',
        business: profileResponse.data.business || '',
      });
      showStatus('success', 'Dashboard synced with the backend.');
    } catch (error) {
      showStatus('error', error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const updateProfileField = (event) => {
    setProfileForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const updateBudgetField = (event) => {
    setBudgetForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const updateMoneyField = (event) => {
    setMoneyForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submitProfile = async (event) => {
    event.preventDefault();
    const formData = new FormData();

    Object.entries(profileForm).forEach(([key, value]) => {
      if (typeof value === 'string' && value.trim() !== '') {
        formData.append(key, value.trim());
      }
    });

    if (selectedFile) {
      formData.append('profile_pic', selectedFile);
    }

    if (![...formData.keys()].length) {
      showStatus('error', 'Add at least one profile change or choose a picture to upload');
      return;
    }

    try {
      await api.patch('/update_user', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      showStatus('success', 'Profile updated successfully');
      await loadDashboard();
    } catch (error) {
      showStatus('error', error.response?.data?.message || 'Profile update failed');
    }
  };

  const runWalletAction = async (type) => {
    const amount = Number(moneyForm[type]);

    if (!amount || amount <= 0) {
      showStatus('error', `Enter a valid ${type} amount`);
      return;
    }

    try {
      await api.post(`/${type}`, { amount });
      setMoneyForm((current) => ({ ...current, [type]: '' }));
      showStatus('success', `${type === 'deposit' ? 'Deposit' : 'Withdrawal'} completed`);
      await loadDashboard();
    } catch (error) {
      showStatus('error', error.response?.data?.message || `Failed to ${type}`);
    }
  };

  const submitBudget = async (event) => {
    event.preventDefault();

    const payload = {};

    if (budgetForm.overall_limit !== '') {
      payload.overall_limit = Number(budgetForm.overall_limit);
    }

    if (budgetForm.vendor_id && budgetForm.vendor_limit !== '') {
      payload.vendor_limits = [
        {
          vendor_id: budgetForm.vendor_id,
          limit: Number(budgetForm.vendor_limit),
        },
      ];
    }

    try {
      await api.post('/set_budget', payload);
      showStatus('success', 'Budget updated successfully');
      await loadDashboard();
    } catch (error) {
      showStatus('error', error.response?.data?.message || 'Budget update failed');
    }
  };

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">VendorFlow Workspace</p>
          <h1>Account and wallet console</h1>
          <p className="topbar__copy">
            Signed in as {profile?.email || userEmail || 'current user'}
          </p>
        </div>
        <div className="topbar__actions">
          <button className="secondary-button" type="button" onClick={loadDashboard}>
            Refresh Data
          </button>
          <button className="ghost-button" type="button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <StatusBanner type={status.type}>{status.message}</StatusBanner>

      {loading ? <div className="loading-card">Loading your dashboard...</div> : null}

      {!loading && profile && balance ? (
        <div className="dashboard-grid">
          <Panel title="Profile Snapshot" subtitle="Live data from `GET /api/get_user`.">
            <div className="profile-summary">
              <div className="avatar-shell">
                {profile.profile_pic ? (
                  <img
                    src={`${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '')}${profile.profile_pic}`}
                    alt={profile.name}
                  />
                ) : (
                  <div className="avatar-placeholder">{profile.name?.slice(0, 1) || 'U'}</div>
                )}
              </div>
              <div className="summary-copy">
                <h3>{profile.name}</h3>
                <p>{profile.business || 'No business set yet'}</p>
                <span>{profile.address || 'No address on file'}</span>
              </div>
            </div>
            <div className="stats-row">
              <article>
                <span>Rating</span>
                <strong>{profile.rating ?? 0}</strong>
              </article>
              <article>
                <span>Ratings Count</span>
                <strong>{profile.no_rating ?? 0}</strong>
              </article>
              <article>
                <span>QR Link</span>
                <a href={profile.qr_code_url} target="_blank" rel="noreferrer">
                  Open QR
                </a>
              </article>
            </div>
          </Panel>

          <Panel title="Wallet Overview" subtitle="Pulled from your balance and history endpoints.">
            <div className="wallet-cards">
              <article>
                <span>Current Balance</span>
                <strong>Rs. {Number(balance.balance || 0).toFixed(2)}</strong>
              </article>
              <article>
                <span>Monthly Budget</span>
                <strong>
                  {balance.budget_overall === null ? 'Not set' : `Rs. ${Number(balance.budget_overall).toFixed(2)}`}
                </strong>
              </article>
              <article>
                <span>Spent This Month</span>
                <strong>Rs. {Number(balance.budget_spent_this_month || 0).toFixed(2)}</strong>
              </article>
            </div>
          </Panel>

          <Panel title="Update Profile" subtitle="Uses `PATCH /api/update_user` with multipart upload support.">
            <form className="form-grid" onSubmit={submitProfile}>
              <FormField label="Name" name="name" value={profileForm.name} onChange={updateProfileField} />
              <FormField label="Phone" name="phone" value={profileForm.phone} onChange={updateProfileField} />
              <FormField label="Address" name="address" value={profileForm.address} onChange={updateProfileField} />
              <FormField label="Business" name="business" value={profileForm.business} onChange={updateProfileField} />
              <FormField
                label="Profile Picture"
                name="profile_pic"
                type="file"
                accept="image/*"
                onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
              />
              <button className="primary-button" type="submit">
                Save Profile
              </button>
            </form>
          </Panel>

          <Panel title="Deposit and Withdraw" subtitle="Uses the wallet transaction endpoints.">
            <div className="action-split">
              <div className="mini-form">
                <FormField
                  label="Deposit Amount"
                  name="deposit"
                  type="number"
                  value={moneyForm.deposit}
                  onChange={updateMoneyField}
                />
                <button className="primary-button" type="button" onClick={() => runWalletAction('deposit')}>
                  Deposit Funds
                </button>
              </div>
              <div className="mini-form">
                <FormField
                  label="Withdraw Amount"
                  name="withdraw"
                  type="number"
                  value={moneyForm.withdraw}
                  onChange={updateMoneyField}
                />
                <button className="secondary-button" type="button" onClick={() => runWalletAction('withdraw')}>
                  Withdraw Funds
                </button>
              </div>
            </div>
          </Panel>

          <Panel title="Set Budget" subtitle="Supports overall limit and a single vendor limit entry for now.">
            <form className="form-grid" onSubmit={submitBudget}>
              <FormField
                label="Overall Monthly Limit"
                name="overall_limit"
                type="number"
                value={budgetForm.overall_limit}
                onChange={updateBudgetField}
              />
              <FormField
                label="Vendor ID"
                name="vendor_id"
                value={budgetForm.vendor_id}
                onChange={updateBudgetField}
              />
              <FormField
                label="Vendor Limit"
                name="vendor_limit"
                type="number"
                value={budgetForm.vendor_limit}
                onChange={updateBudgetField}
              />
              <button className="primary-button" type="submit">
                Save Budget
              </button>
            </form>
          </Panel>

          <Panel title="Recent Transactions" subtitle="Latest results from `GET /api/get_transaction_history`.">
            <div className="transaction-list">
              {transactions.length ? (
                transactions.map((transaction, index) => (
                  <article className="transaction-item" key={`${transaction.timestamp}-${index}`}>
                    <div>
                      <strong>{transaction.type}</strong>
                      <span>{new Date(transaction.timestamp).toLocaleString()}</span>
                    </div>
                    <p>Rs. {Number(transaction.amount || 0).toFixed(2)}</p>
                  </article>
                ))
              ) : (
                <p className="empty-state">No transactions yet.</p>
              )}
            </div>
          </Panel>
        </div>
      ) : null}
    </main>
  );
}
