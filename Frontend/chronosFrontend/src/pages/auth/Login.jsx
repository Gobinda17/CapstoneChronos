import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../../components/base/Input";
import { Button } from "../../components/base/Button";
import { Card } from "../../components/base/Card";
import { UseAuth } from "../../context/AuthContext.jsx";

const Login = () => {
  const { login, resetUserPassword } = UseAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const success = await login(formData);
      if (success && success.success) {
        setIsLoading(false);
        navigate("/dashboard", { replace: true });
      } else {
        setIsLoading(false);
        setError(success.message || "Login failed. Please try again.");
      }
    } catch (err) {
      setError(`Error: ${err.response?.data?.message || err.message}`);
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetError("");

    if (!resetPassword || !confirmPassword) {
      setResetError("Please fill in all fields");
      return;
    }

    if (resetPassword.length < 6) {
      setResetError("Password must be at least 6 characters long");
      return;
    }

    if (resetPassword !== confirmPassword) {
      setResetError("Passwords do not match");
      return;
    }

    try {
      const response = await resetUserPassword(formData.email, resetPassword);

      if(response.success === false) {
        setResetError(response.message || "Password reset failed. Please try again.");
        return;
      }

      setTimeout(() => {
        setResetSuccess(true);
        setTimeout(() => {
          setShowForgotPassword(false);
          setResetSuccess(false);
          setResetPassword("");
          setConfirmPassword("");
        }, 3000);
      }, 1000);
    } catch (err) {
      setResetError(`Error: ${err.response?.data?.message || err.message}`);
    }
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPassword(false);
    setResetPassword("");
    setConfirmPassword("");
    setResetError("");
    setResetSuccess(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <i className="ri-time-line text-2xl text-white"></i>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            CronManager
          </h1>
          <p className="text-gray-600">Sign in to manage your cron jobs</p>
        </div>

        <Card className="p-6 lg:p-8">
          <form className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <i className="ri-error-warning-line text-red-500 mr-2"></i>
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="w-full"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full whitespace-nowrap"
              onClick={handleSubmit}
            >
              {isLoading ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Signing in...
                </>
              ) : (
                <>
                  <i className="ri-login-box-line mr-2"></i>
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                Demo Credentials
              </h3>
              <div className="text-xs text-blue-700 space-y-1">
                <p>
                  <strong>Email:</strong> admin@example.com
                </p>
                <p>
                  <strong>Password:</strong> password
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
            >
              Register an Account
            </button>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={closeForgotPasswordModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Reset Password
              </h2>
              <button
                onClick={closeForgotPasswordModal}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            {resetSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 flex items-center justify-center bg-green-100 rounded-full mx-auto mb-4">
                  <i className="ri-check-line text-3xl text-green-600"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Password Reset Successfully!
                </h3>
                <p className="text-gray-600">
                  Your password has been updated. You can now sign in with your
                  new password.
                </p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-6">
                  Enter your new password below. Make sure it's at least 6
                  characters long.
                </p>

                <form onSubmit={handleForgotPassword} className="space-y-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="ri-lock-line text-gray-400"></i>
                      </div>
                      <input
                        type="password"
                        value={resetPassword}
                        onChange={(e) => setResetPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                        placeholder="Enter new password"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="ri-lock-line text-gray-400"></i>
                      </div>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>

                  {resetError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
                      <i className="ri-error-warning-line"></i>
                      <span>{resetError}</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={closeForgotPasswordModal}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer whitespace-nowrap"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer whitespace-nowrap"
                    >
                      Reset Password
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
