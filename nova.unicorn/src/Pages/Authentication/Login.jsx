import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../Store/hooks";
import { handleGoogleLogin, handleLogin, handleSignup } from "../../Store/thunk";
import Alert from "../../components/Alert";
import { resetNotify } from "../../Store/auth/AuthSlice";
import MiniLoader from "../../components/preloader/MiniLoader";
import { useForm } from "react-hook-form";
import { HiEye, HiEyeOff } from "react-icons/hi";
import CountryPhoneField from "../../components/CountryPhoneField";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth as firebaseAuth } from "../../firebaseConfig";

const googleErrorMessages = {
  "auth/popup-closed-by-user": "Google sign-in was cancelled",
  "auth/popup-blocked": "Your browser blocked the Google sign-in popup. Allow popups and try again.",
  "auth/unauthorized-domain": "This website is not authorized for Google sign-in in Firebase.",
  "auth/operation-not-allowed": "Google sign-in is not enabled in Firebase Authentication.",
  "auth/invalid-api-key": "The Firebase API key is invalid. Check REACT_APP_FIREBASE_KEY.",
};

const vendorTypes = [
  { value: "retailshopvendor", label: "Retail shop vendor" },
  { value: "cardealer", label: "Car dealer" },
  { value: "realestate", label: "Real estate" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "agrovet", label: "Agrovet" },
];

const LoginPage = () => {
  const { auth, error, notify, status, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { role: "", vendorType: "" },
  });
  const selectedRole = watch("role", "customer");
  const selectedVendorType = watch("vendorType", "");
  const selectedPlatforms = watch("advertSocials", {});
  const advertPlatforms = ["Instagram", "TikTok", "YouTube", "Facebook", "X"];
  useEffect(() => {
    if (notify) {
      setTimeout(() => {
        dispatch(resetNotify());
        navigate(user?.role === "vendor" ? `/vendor/${user.vendorType || "retailshopvendor"}` : user?.role === "blackmarket" ? "/blackmarket" : `/${user?.role || "customer"}`);
      }, 1000); 
    }
  }, [notify, dispatch, navigate, user]);

  const normalizeEmailValue = (value) => {
    if (typeof value !== "string") return "";
    return value.trim().toLowerCase();
  };

  const onSubmit = async (data) => {
    const normalizedData = {
      ...data,
      email: normalizeEmailValue(data?.email),
    };

    if (isLogin) {
      loginHandler({ data: normalizedData });
    } else {
      signupHandler({ data: normalizedData });
    }
  };

  const loginHandler = async (data) => {
    await dispatch(handleLogin({ data }))
      .then((res) => {
        if (res.meta.requestStatus === "fulfilled") {
          console.log(res, "User logged in successfully");
        
        } else {
          console.log(res.payload, "Login failed");
        }
      });
  };

  const signupHandler = async (data) => {
    await dispatch(handleSignup({ data })).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        console.log(res, "User created successfully");  
      } else {
        console.log(res.payload, "Login failed");
      }
    });
  };

  const handleGoogleSignIn = () => {
    setGoogleError("");
    if (selectedRole === "vendor" && !selectedVendorType) {
      setGoogleError("Select a vendor type before continuing with Google");
      return;
    }

    const provider = new GoogleAuthProvider();
    const signInPromise = signInWithPopup(firebaseAuth, provider);

    signInPromise
      .then(async ({ user: firebaseUser }) => {
        const idToken = await firebaseUser.getIdToken();
        const response = await dispatch(handleGoogleLogin({ idToken, role: selectedRole, vendorType: selectedVendorType }));
        if (handleGoogleLogin.rejected.match(response)) {
          setGoogleError(response.payload || "Unable to log in with Google");
        }
      })
      .catch((googleError) => {
        setGoogleError(googleErrorMessages[googleError.code] || `Unable to sign in with Google (${googleError.code || "unknown error"})`);
      });
  };


  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff1f2_0%,#f8fafc_35%,#eef2ff_100%)] px-4 py-8 md:px-8 lg:px-12">
      {notify && <Alert message={auth} />}

      <div className="mx-auto max-w-6xl overflow-hidden rounded-[32px] border border-white/60 bg-white/80 shadow-[0_30px_80px_rgba(76,29,149,0.12)] backdrop-blur-xl">
        <div className="grid items-stretch lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#4f46e5] via-[#7c3aed] to-[#ec4899] p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.35),transparent_28%)]" />
            <div className="relative z-10">
              <Link to="/" className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 backdrop-blur-md">
                <img src="images/unicorn-horn-black.svg" alt="Unicorn horn" className="h-8 w-8 rounded-full bg-white p-1" />
                <span className="text-sm font-semibold tracking-[0.24em] uppercase text-white/90">Nova Unicorn</span>
              </Link>
            </div>

            <div className="relative z-10 space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/80">Marketplace</p>
                <h1 className="max-w-sm text-4xl font-black leading-tight">Everything your customers want, in one place.</h1>
              </div>

              <p className="max-w-md text-base text-white/80">
                Discover trusted vendors, exclusive deals, and seamless selling tools built for modern commerce.
              </p>

              <div className="grid gap-3 text-sm text-white/85 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
                  <div className="text-xl font-bold">500+</div>
                  <div>Products</div>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
                  <div className="text-xl font-bold">24/7</div>
                  <div>Access</div>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
                  <div className="text-xl font-bold">100%</div>
                  <div>Secure</div>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex items-center gap-3 text-sm text-white/80">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_15px_rgba(110,231,183,0.9)]" />
              Built for fast shopping and trusted selling
            </div>
          </div>

          <div className="flex items-center justify-center bg-slate-50/80 p-6 sm:p-8 lg:p-10">
            <div className="w-full max-w-xl">
              <div className="mb-6 text-center lg:text-left">
                <div className="mb-3 flex items-center justify-center lg:justify-start">
                  <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200">
                    <img src="images/unicorn-horn-black.svg" alt="Unicorn horn" className="h-6 w-6" />
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">Nova</span>
                  </Link>
                </div>
                <h2 className="text-3xl font-black text-slate-900">{isLogin ? "Welcome back" : "Create your account"}</h2>
                <p className="mt-2 text-sm text-slate-600">
                  {isLogin
                    ? "Sign in to continue to your Nova Unicorn dashboard."
                    : "Join Nova Unicorn and start selling or shopping securely."}
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {isLogin && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Account type</label>
                    <select
                      {...register("role", { required: "Please select an account type" })}
                      className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-slate-800 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Select account type</option>
                      <option value="customer">Customer</option>
                      <option value="vendor">Vendor</option>
                      <option value="advert">Advert</option>
                      <option value="logistic">Logistic</option>
                      <option value="blackmarket">Black market</option>
                    </select>
                    {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>}
                  </div>
                )}

                {selectedRole === "vendor" && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Vendor type</label>
                    <select
                      {...register("vendorType", { required: "Vendor type is required" })}
                      className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-slate-800 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Select vendor type</option>
                      {vendorTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                    </select>
                    {errors.vendorType && <p className="mt-1 text-xs text-red-500">{errors.vendorType.message}</p>}
                  </div>
                )}

                {!isLogin && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <label className="mb-3 block text-sm font-medium text-slate-700">Create account as</label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
                        <input type="radio" value="customer" {...register("role")} />
                        Customer
                      </label>
                      <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
                        <input type="radio" value="vendor" {...register("role")} />
                        Vendor
                      </label>
                      <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
                        <input type="radio" value="advert" {...register("role")} />
                        Advert
                      </label>
                      <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
                        <input type="radio" value="logistic" {...register("role")} />
                        Logistic
                      </label>
                      <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 sm:col-span-2">
                        <input type="radio" value="blackmarket" {...register("role")} />
                        Black market
                      </label>
                    </div>
                  </div>
                )}

                {!isLogin && (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <input
                          type="text"
                          placeholder="First name"
                          {...register("firstName", { required: "First name is required" })}
                          className={`w-full rounded-2xl border bg-white p-4 text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.firstName ? "border-red-300" : "border-slate-200"}`}
                        />
                        {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>}
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Second name"
                          {...register("secondName", { required: "Second name is required" })}
                          className={`w-full rounded-2xl border bg-white p-4 text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.secondName ? "border-red-300" : "border-slate-200"}`}
                        />
                        {errors.secondName && <p className="mt-1 text-xs text-red-500">{errors.secondName.message}</p>}
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="Username"
                      {...register("username", { required: "Username is required" })}
                      className={`w-full rounded-2xl border bg-white p-4 text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.username ? "border-red-300" : "border-slate-200"}`}
                    />
                    {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
                  </>
                )}

                <input
                  type="email"
                  placeholder="Email address"
                  {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email format" } })}
                  className={`w-full rounded-2xl border bg-white p-4 text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.email ? "border-red-300" : "border-slate-200"}`}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}

                {!isLogin && selectedRole === "vendor" && (
                  <>
                    <input
                      type="text"
                      placeholder="Business Name"
                      {...register("businessName")}
                      className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />

                    <input
                      type="text"
                      placeholder="Shop Name"
                      {...register("shopName", { required: isLogin ? false : "Shop name is required for vendors" })}
                      className={`w-full rounded-2xl border bg-white p-4 text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.shopName ? "border-red-300" : "border-slate-200"}`}
                    />
                    {errors.shopName && <p className="text-xs text-red-500">{errors.shopName.message}</p>}

                    <CountryPhoneField register={register} errors={errors} />

                    <input
                      type="text"
                      placeholder="Shop address"
                      {...register("shopAddress", { required: "Shop address is required for vendors" })}
                      className={`w-full rounded-2xl border bg-white p-4 text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.shopAddress ? "border-red-300" : "border-slate-200"}`}
                    />
                    {errors.shopAddress && <p className="text-xs text-red-500">{errors.shopAddress.message}</p>}
                  </>
                )}

                {!isLogin && selectedRole === "customer" && (
                  <>
                    <input
                      type="text"
                      placeholder="Delivery address"
                      {...register("deliveryAddress", { required: "Delivery address is required for customers" })}
                      className={`w-full rounded-2xl border bg-white p-4 text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.deliveryAddress ? "border-red-300" : "border-slate-200"}`}
                    />
                    {errors.deliveryAddress && <p className="text-xs text-red-500">{errors.deliveryAddress.message}</p>}
                  </>
                )}

                {!isLogin && selectedRole === "advert" && (
                  <>
                    <CountryPhoneField register={register} errors={errors} />

                    <fieldset className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <legend className="mb-2 text-sm font-medium text-slate-700">Advertising platforms</legend>
                      <div className="space-y-3">
                        {advertPlatforms.map((platform) => {
                          const fieldName = `advertSocials.${platform.toLowerCase()}`;
                          const isSelected = Boolean(selectedPlatforms?.[platform.toLowerCase()]);
                          return (
                            <div key={platform}>
                              <label className="flex items-center gap-2 text-sm text-slate-700">
                                <input type="checkbox" {...register(fieldName)} />
                                {platform}
                              </label>
                              {isSelected && (
                                <input
                                  type="text"
                                  placeholder={`${platform} username`}
                                  {...register(`advertUsernames.${platform.toLowerCase()}`, { required: `${platform} username is required` })}
                                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </fieldset>
                  </>
                )}

                {!isLogin && selectedRole === "logistic" && <CountryPhoneField register={register} errors={errors} />}
                {!isLogin && ["customer", "blackmarket"].includes(selectedRole) && <CountryPhoneField register={register} errors={errors} />}

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })}
                    className={`w-full rounded-2xl border bg-white p-4 pr-12 text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.password ? "border-red-300" : "border-slate-200"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary"
                  >
                    {showPassword ? <HiEyeOff className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-gradient-to-r from-[#4f46e5] via-[#7c3aed] to-[#ec4899] p-4 text-base font-semibold text-white shadow-lg shadow-violet-200 transition hover:brightness-110"
                >
                  {status === "loading" ? <MiniLoader /> : (isLogin ? "Log in" : "Create Account")}
                </button>
              </form>

              {error && error !== "nil" && <p className="mt-3 text-center text-xs text-red-500">{error}</p>}
              {googleError && <p className="mt-3 text-center text-xs text-red-500">{googleError}</p>}

              <div className="mt-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[11px] uppercase tracking-[0.24em] text-slate-400">or</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="mt-5 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                {isLogin ? "Create Account" : "Log in"}
              </button>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={status === "loading"}
                className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <img src="images/Google_Icons.webp" alt="google" className="h-6 w-6" />
                Log in with Google
              </button>

              <p className="mt-5 text-center text-xs text-slate-500">
                By continuing you agree to Nova Unicorn’s <span className="font-semibold text-primary underline">Terms and Conditions</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
