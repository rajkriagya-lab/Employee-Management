import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, UserPlus, ShieldCheck, User, AlertCircle, CheckCircle } from 'lucide-react'
import Loading from "../../components/layout/loading"

const register = () => {
  const navigate = useNavigate();

  const [fromData, setFromData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /**
   * CHECK CURRENT USERS
   */

  useEffect(() => {
    try {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      const storedUser =
        localStorage.getItem("user") ||
        sessionStorage.getItem("user");

      if (!token || !storedUser) {
        navigate("/login", {
          replace: true,
        });
        return;
      }

      const user = JSON.parse(storedUser);

      setCurrentUser(user);

      // ONLY OWNER AND MANAGER

      if (
        user.role !== "OWNER" &&
        user.role !== "MANAGER"
      ) {
        navigate("/member/dashboard", {
          replace: true,
        });
        return;
      }
    } catch (error) {
      console.error("Authentication check error:", err);

      navigate("/login", {
        replace: true,
      });
    } finally {
      setCheckingAuth(false);
    }
  }, [navigate]);

  // HANDEL INPUT

  const handelChange = (e) => {
    const { name, value } = e.target;

    setFromData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  //SUBMIT

  const handelSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const {
      name,
      email,
      password,
      confirmPassword,
      role,
    } = fromData;

    //VALIDATION

    if (!name.trim()) {
      setError("Please enter the user's name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter the user's email.");
      return;
    }

    if (!password.trim()) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (!confirmPassword.trim()) {
      setError("Password Do not match.");
      return;
    }

    if (!role.trim()) {
      setError("Please select role.");
      return;
    }

    //MANAGER RESTRICTION

    if (
      currentUser?.role === "MANAGER" &&
      role === "OWNER"
    ) {
      setError("Manager cannot create an Owner account.");
      return;
    }

    try {
      setLoading(true);

      //SEND TO BACKEND

      const response = await createUser({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });

      console.log("create user response:", response);

      if (!response?.success) {
        setError(response?.message ||
          "Unable to create user."
        );
        return;
      }

      //SUCCESS

      setSuccess(response.message || "User created successfully.");

      //RESET FORM

      setFromData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
      });
    } catch (error) {
      console.error("Create user error:", error);

      //BACKEND ERROR

      if (error.response?.status === 401) {
        setError("Your session has expired. Please login again.");

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setTimeout(() => {
          navigate("/login", {
            replace: true,
          });
        }, 1000);
        return;
      }

      if (error.response?.status === 403) {
        setError("You don't have permission to create users.");
        return;
      }

      if (error.response?.status === 409) {
        setError(error.response?.data.message || "This email is already registered.");
        return;
      }

      setError(err.response?.data?.message || "Unable to create user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auth Checking Loading

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col item-center gap-1">
          <loading />

          <p className="text-sm text-muted">
            Checking permission...
          </p>
        </div>
      </div>
    )
  }

  //Login Page
  return (
    <div className='min-h-screen bg-background py-0 px-4'>
      <div className="max-w-2xl mx-auto">
        {/**HEADER*/}
        <div className="mb-7">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-btn rounded-lg flex items-center justify-center">
              <UserPlus size={21}
                className='text-white'
              />
            </div>

            <div>
              <h1 className="text-2x1 font-bold text-text">
                Create User
              </h1>

              <p className="text-2x1 font-bold text-text">
                Add a new user to your orgnization
              </p>
            </div>
          </div>
        </div>

        {/**CREATOR INFORMATION */}

        <div className="bg-surface boeder border-boder rounded-xl p-4 mb-5">
          <div className="flex items-center gap-5">
            <div className="w-9 h-9 rounded-lg bg-btn/10 flex items-center justify-center">
              <ShieldCheck size={19}
                className='text-btn'
              />
            </div>

            <div>
              <p className="text-xs text-muted">
                Create account as
              </p>

              <p className="text-sm font-semibold text-text">
                {currentUser?.name}{""}
                <span className="text-btn">
                  ({currentUser?.role})
                </span>
              </p>
            </div>
          </div>
        </div>

        {/**\
         * FROM DATA
         */}

        <div className="bg-surface border border-border rounded-2xl shadow-sm p-6 sm:p-8">
          <form
            onSubmit={handelSubmit}
            className='space-y-5'
          >
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text mb-2">
                Full Name
              </label>

              <div className="relative">

                <User
                  size={18}
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-muted'
                />

                <input
                  id='name'
                  name='name'
                  type='text'
                  value={fromData.name}
                  onChange={handelChange}
                  placeholder='Enter your full name'
                  disabled={loading}
                  className='w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg outline-none text-text placeholder:text-muted focus:border-btn focus:ring-2 focus:ring-btn/10 transition disabled:opacity-60 '
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text mb-2">Email Address</label>
              <div className="relative">
                <Mail size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  id='email'
                  type='email'
                  value={fromData.email}
                  onChange={handelChange}
                  placeholder='user@example.com'
                  disabled={loading}
                  className='w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg outline-none text-text placeholder:text-muted focus:border-btn focus:ring-2 focus:ring-btn/10 transition disabled:opacity-60'
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-text mb-2">User Role</label>
              <select
                id='role'
                name='role'
                value={fromData.role}
                onChange={handelChange}
                disabled={loading}
                className='w-full bg-background border border-border rounded-lg outline-none text-text focus:border-btn focus:ring-2 focus:ring-btn/10 transition disabled:opacity-60'>
                <option value="">
                  Select user role
                </option>

                {currentUser?.role === "OWNER" && (<>
                  <option value="MANAGER">
                    Manager
                  </option>

                  <option value="EMPLOYEE">
                    Employee / Member
                  </option>
                </>
                )}

                {currentUser?.role === "MANAGER" && (
                  <>
                    <option value="EMPLOYEE">
                      Employee / Member
                    </option>
                  </>
                )}
              </select>

              <p className="text-xs text-muted mt-2">
                Available roles are controlled by your account permissions.
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text mb-2"> Temporary Password</label>
              <div className="relative">
                <lock size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  id='password'
                  name='password'
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={fromData.password}
                  onChange={handelChange}
                  placeholder='Create temporary password'
                  disabled={loading}
                  className="w-full pl-10 pr-12 py-3 bg-background border border-border rounded-lg outlinr-none text-text placeholder:text-muted focus:border-btn focus:ring-2 focus:ring-btn/10 transition disabled:opacity-60"
                />

                <button type='button'
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  disabled={loading}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text'>
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text:sm font-medium text-text mb-2">Confirm password</label>
              <div className="relative">
                <Lock size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />

                <input
                  id='confirmPassword'
                  name='confirmPassword'
                  type={showConfirmPassword
                    ? "text"
                    : "password"
                  }
                  value={fromData.confirmPassword}
                  onChange={handelChange}
                  placeholder='Confirm password'
                  disabled={loading}
                  className="w-full pl-10 pr-12 py-3 bg-background border border-border rounded-lg outlinr-none text-text placeholder:text-muted focus:border-btn focus:ring-2 focus:ring-btn/10 transition disabled:opacity-60"
                />

                <button type='button'
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  disabled={loading}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text'>
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex gap-3 items-start p-3 rounded-lg bg-danger/10 border border-danger/20">
                <AlertCircle
                  size={18}
                  className='text-danger mt-0.5 shrink-0'
                />
                <p className="text-sm text-danger">
                  {error}
                </p>
              </div>
            )}

            {success && (
              <div className="flex gap-3 items-start p-3 rounded-lg bg-success/10 border border-success/20">
                <CheckCircle
                size={18}
                className='text-success mt-0.5 shrink-0'
                />
                <p className="text-sm text-success">
                  {success}
                </p>
              </div>
            )}

            <button
            type='submit'
            disabled={loading}
            className="w-full py-3 px-4 bg-btn hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                <Loading
                size={18}
                 />
                 Creating User...
                </>
              ): (
                <>
                <UserPlus size={19} />
                Create User
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default register
