import { useState, useEffect } from "react";
import { Card } from "../../components/base/Card";
import { Input } from "../../components/base/Input";
import { Button } from "../../components/base/Button";
import api from "../../api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [emailData, setEmailData] = useState({
    currentEmail: "",
    newEmail: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/auth/me");
        const u = res.data?.user;
        setUser(u);

        setEmailData({
          currentEmail: u?.email || "",
          newEmail: "",
        });
      } catch (err) {
        console.error(err);
        setUser(null);
      }
    };
    load();
  }, []);

  const handleEmailChange = (e) => {
    setEmailData({
      ...emailData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setEmailError("");
    setSuccessMessage("");

    if (!emailData.newEmail)
      return setEmailError("Please enter a new email address");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.newEmail))
      return setEmailError("Please enter a valid email address");

    if (emailData.newEmail === emailData.currentEmail)
      return setEmailError("New email must be different from current email");

    setIsUpdatingEmail(true);

    try {
      await api.put("/auth/me/email", { newEmail: emailData.newEmail });

      const me = await api.get("/auth/me");
      const updatedUser = me.data?.user;

      setUser(updatedUser);
      setEmailData({
        currentEmail: updatedUser.email,
        newEmail: "",
      });

      setSuccessMessage("Email updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setEmailError(err?.response?.data?.message || "Failed to update email");
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setSuccessMessage("");

    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword)
      return setPasswordError("Please fill in all fields");

    if (newPassword.length < 8)
      return setPasswordError(
        "New password must be at least 8 characters long"
      );

    if (newPassword !== confirmPassword)
      return setPasswordError("New passwords do not match");

    setIsUpdatingPassword(true);

    try {
      await api.put("/auth/me/password", { currentPassword, newPassword });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setSuccessMessage("Password updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setPasswordError(
        err?.response?.data?.message || "Failed to update password"
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          Profile Settings
        </h1>
        <p className="text-gray-600 mt-1">Update your email and password</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <i className="ri-check-line text-green-500 mr-2"></i>
            <span className="text-green-700 text-sm">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Update Email */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Update Email
        </h2>

        <form onSubmit={handleUpdateEmail} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Email
            </label>
            <Input
              name="currentEmail"
              type="email"
              value={emailData.currentEmail}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Email Address
            </label>
            <Input
              name="newEmail"
              type="email"
              value={emailData.newEmail}
              onChange={handleEmailChange}
              placeholder="Enter new email address"
            />
          </div>

          {emailError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <i className="ri-error-warning-line text-red-500 mr-2"></i>
                <span className="text-red-700 text-sm">{emailError}</span>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={isUpdatingEmail}
            className="whitespace-nowrap"
          >
            {isUpdatingEmail ? (
              <>
                <i className="ri-loader-4-line animate-spin mr-2"></i>
                Updating...
              </>
            ) : (
              <>
                <i className="ri-mail-line mr-2"></i>
                Update Email
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Update Password */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Update Password
        </h2>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <Input
              name="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <Input
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              placeholder="Enter new password (min. 8 characters)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <Input
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Confirm new password"
            />
          </div>

          {passwordError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <i className="ri-error-warning-line text-red-500 mr-2"></i>
                <span className="text-red-700 text-sm">{passwordError}</span>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={isUpdatingPassword}
            className="whitespace-nowrap"
          >
            {isUpdatingPassword ? (
              <>
                <i className="ri-loader-4-line animate-spin mr-2"></i>
                Updating...
              </>
            ) : (
              <>
                <i className="ri-lock-line mr-2"></i>
                Update Password
              </>
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Profile;
