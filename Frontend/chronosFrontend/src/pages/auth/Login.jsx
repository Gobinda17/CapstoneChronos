import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../../components/base/Input";
import { Button } from "../../components/base/Button";
import { Card } from "../../components/base/Card";
import { UseAuth } from "../../context/AuthContext.jsx";

const Login = () => {
  const { login } = UseAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
      await login(formData);
      navigate("/dashboard", { replace: true });
      setIsLoading(false);
    } catch (err) {
      setError(`Error: ${err.response?.data?.message || err.message}`);
      setIsLoading(false);
    }
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

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
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
    </div>
  );
};

export default Login;
