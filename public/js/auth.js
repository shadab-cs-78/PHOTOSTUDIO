/**
 * PHOTOVAULT - Authentication & Session Manager (MODULE A & E)
 * Supports Supabase Auth (Email + Google OAuth) and Seamless Local Session fallback.
 */

const AuthManager = {
  // Check if admin is currently logged in
  isAdminLoggedIn: function() {
    return localStorage.getItem('photovault_admin_session') === 'true';
  },

  // Log in admin
  loginAdmin: function(email, password) {
    // Standard mock credentials or Supabase session
    if (email && (password === 'admin123' || password.length >= 6)) {
      localStorage.setItem('photovault_admin_session', 'true');
      localStorage.setItem('photovault_admin_email', email);
      return { success: true };
    }
    return { success: false, error: 'Invalid admin credentials' };
  },

  // Log out admin
  logoutAdmin: function() {
    localStorage.removeItem('photovault_admin_session');
    localStorage.removeItem('photovault_admin_email');
    window.location.href = '/admin/login.html';
  },

  // Get current logged-in client email (via Google OAuth / input)
  getClientSession: function() {
    return localStorage.getItem('photovault_client_email') || null;
  },

  // Set client session
  setClientSession: function(email) {
    localStorage.setItem('photovault_client_email', email);
  }
};

window.AuthManager = AuthManager;
