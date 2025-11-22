import Input from "../ui/Input";
import Button from "../ui/Button";
import SocialButton from "../ui/SocialButton";
import { Mail, Lock } from "lucide-react";

const LoginForm = () => {
  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      <h1 className="text-3xl font-bold text-orange-500 mb-2">Welcome</h1>
      <p className="text-gray-500 mb-6">Login with Email</p>

      <form className="flex flex-col gap-4 w-full">
        <Input type="email" placeholder="thisuix@mail.com" icon={<Mail className="w-5 h-5 text-gray-400" />} />
        <Input type="password" placeholder="************" icon={<Lock className="w-5 h-5 text-gray-400" />} />
        <div className="text-right text-sm text-orange-500 cursor-pointer">Forgot your password?</div>
        <Button type="submit">LOGIN</Button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <span className="w-16 h-[1px] bg-gray-300"></span>
        <span className="text-gray-400">OR</span>
        <span className="w-16 h-[1px] bg-gray-300"></span>
      </div>

      <div className="flex gap-4">
        <SocialButton icon="/google.svg" alt="Google" />
        <SocialButton icon="/facebook.svg" alt="Facebook" />
        <SocialButton icon="/apple.svg" alt="Apple" />
      </div>

      <p className="text-sm text-gray-600 mt-6">
        Don’t have account?{" "}
        <span className="text-orange-500 font-medium cursor-pointer">Register Now</span>
      </p>
    </div>
  );
};

export default LoginForm;
