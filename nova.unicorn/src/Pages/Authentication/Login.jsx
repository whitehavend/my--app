import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../Store/hooks";
import { handleLogin, handleSignup } from "../../Store/thunk";
import Alert from "../../components/Alert";
import { resetNotify } from "../../Store/auth/AuthSlice";
import MiniLoader from "../../components/preloader/MiniLoader";
import { useForm } from "react-hook-form";
import { HiEye, HiEyeOff } from "react-icons/hi";

const LoginPage = () => {
  const { auth, error, notify, status } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      role: "customer",
    },
  });
  const selectedRole = watch("role", "customer");
  const selectedPlatforms = watch("advertSocials", {});
  const advertPlatforms = ["Instagram", "TikTok", "YouTube", "Facebook", "X"];
  useEffect(() => {
    if (notify) {
      setTimeout(() => {
        dispatch(resetNotify());
        navigate("/");
      }, 1000); 
    }
  }, [notify, dispatch, navigate]);

  const onSubmit = async (data) => {
    if (isLogin) {
      loginHandler({data})
    } else {
      signupHandler({data});
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

  // const handleGoogleLogin = async () => {
  //   try {
  //     const provider = new GoogleAuthProvider(); 
  //     const result = await signInWithPopup(auth, provider);
  //     console.log("User logged in with Google successfully:", result.user);
  //   } catch (error) {
  //     console.error("Google login error:", error.message);
  //   }
  // };


  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-16">
      {notify && <Alert message={auth} />}
      <div className="w-full md:w-3/5 lg:w-[35%] xl:w-[30%]">
        <div className="flex items-center justify-center px-4 lg:px-0 flex-col">
          <Link to="/">
            <img src="images/unicorn-horn-black.svg" alt="Unicorn horn" className="w-20 h-20" />
          </Link>
          <h1 className="font-mono text-xl font-semibold">Welcome to Nova-Unicorn</h1>
          <p className="text-sm text-gray-600 pb-4 text-center">
            Type your email to log in to your Nova-Unicorn account.
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="w-full">
            {!isLogin && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Create account as</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        value="customer"
                        {...register("role")}
                      />
                      Customer
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        value="vendor"
                        {...register("role")}
                      />
                      Vendor
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="radio" value="advert" {...register("role")} />
                      Advert
                    </label>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Full Name"
                  {...register("fullName", { required: "Full name is required" })}
                  className={`p-4 border border-gray-400 focus:border-primary w-full my-4 outline-none rounded-md placeholder:text-gray-500 ${
                    errors.fullName && "border-red-500"
                  }`}
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-[-0.75rem] mb-4">{errors.fullName.message}</p>}
              </>
            )}

            <input
              type="email"
              placeholder="Email"
              {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email format" } })}
              className={`p-4 border border-gray-400 focus:border-primary w-full my-4 outline-none rounded-md placeholder:text-gray-500 ${
                errors.email && "border-red-500 "
              }`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-[-0.75rem] mb-4">{errors.email.message}</p>}

            {!isLogin && selectedRole === "vendor" && (
              <>
                <input
                  type="text"
                  placeholder="Business Name"
                  {...register("businessName")}
                  className="p-4 border border-gray-400 focus:border-primary w-full my-4 outline-none rounded-md placeholder:text-gray-500"
                />

                <input
                  type="text"
                  placeholder="Shop Name"
                  {...register("shopName", { required: isLogin ? false : "Shop name is required for vendors" })}
                  className={`p-4 border border-gray-400 focus:border-primary w-full my-4 outline-none rounded-md placeholder:text-gray-500 ${
                    errors.shopName && "border-red-500"
                  }`}
                />
                {errors.shopName && <p className="text-red-500 text-xs mt-[-0.75rem] mb-4">{errors.shopName.message}</p>}

                <input
                  type="tel"
                  placeholder="Phone Number"
                  {...register("phoneNumber", { required: isLogin ? false : "Phone number is required for vendors" })}
                  className={`p-4 border border-gray-400 focus:border-primary w-full my-4 outline-none rounded-md placeholder:text-gray-500 ${
                    errors.phoneNumber && "border-red-500"
                  }`}
                />
                {errors.phoneNumber && <p className="text-red-500 text-xs mt-[-0.75rem] mb-4">{errors.phoneNumber.message}</p>}
              </>
            )}

            {!isLogin && selectedRole === "advert" && (
              <>
                <div className="my-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Phone number</label>
                  <div className="flex gap-2">
                    <select
                      aria-label="Country code"
                      {...register("countryCode", { required: "Country code is required" })}
                      className="w-28 rounded-md border border-gray-400 bg-white p-4 outline-none focus:border-primary"
                    >
                      <option value="">Code</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+234">+234</option>
                      <option value="+254">+254</option>
                      <option value="+27">+27</option>
                      <option value="+91">+91</option>
                    </select>
                    <input
                      type="tel"
                      placeholder="Phone number"
                      {...register("phoneNumber", { required: "Phone number is required" })}
                      className="min-w-0 flex-1 rounded-md border border-gray-400 p-4 outline-none focus:border-primary"
                    />
                  </div>
                  {errors.countryCode && <p className="mt-1 text-xs text-red-500">{errors.countryCode.message}</p>}
                  {errors.phoneNumber && <p className="mt-1 text-xs text-red-500">{errors.phoneNumber.message}</p>}
                </div>

                <fieldset className="my-5">
                  <legend className="mb-2 text-sm font-medium text-gray-700">Advertising platforms</legend>
                  <div className="space-y-3">
                    {advertPlatforms.map((platform) => {
                      const fieldName = `advertSocials.${platform.toLowerCase()}`;
                      const isSelected = Boolean(selectedPlatforms?.[platform.toLowerCase()]);
                      return (
                        <div key={platform}>
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" {...register(fieldName)} />
                            {platform}
                          </label>
                          {isSelected && (
                            <input
                              type="text"
                              placeholder={`${platform} username`}
                              {...register(`advertUsernames.${platform.toLowerCase()}`, { required: `${platform} username is required` })}
                              className="mt-2 w-full rounded-md border border-gray-400 p-3 outline-none focus:border-primary"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </fieldset>
              </>
            )}

            <div className="relative my-4">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })}
                className={`p-4 pr-12 border border-gray-400 focus:border-primary w-full outline-none rounded-md placeholder:text-gray-500 ${
                  errors.password && "border-red-500 "
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary"
              >
                {showPassword ? <HiEyeOff className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-[-0.75rem] mb-4">{errors.password.message}</p>}

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary100 text-white p-4 rounded-md shadow-md mt-4 mb-2"
            >
              {status === "loading" ? <MiniLoader /> : (isLogin ? "Log in" : "Create Account")}
            </button>
          </form>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <p className="text-xs w-[60%] text-center">
            By continuing you agree to Unicorn’s <br />
            <span className="underline text-primary">Terms and Conditions</span>
          </p>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="w-full bg-primary hover:bg-primary100 text-white p-4 rounded-md shadow-md mt-4 mb-2"
          >
            {isLogin ? "Create Account" : "Log in"}
          </button>
          <button className="w-full border flex items-center justify-center border-gray-500 hover:border-gray-600  p-4 rounded-md shadow-md mt-4 mb-2">
            Log in with Google{" "}
            <img
              src="images/Google_Icons.webp"
              alt="google"
              className="w-7 h-7"
            />
          </button>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
