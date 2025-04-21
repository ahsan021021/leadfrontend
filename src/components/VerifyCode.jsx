import { KeyRound } from 'lucide-react';

export default function VerifyCode({
  verificationCode,
  onVerificationCodeChange,
  onSubmit,
  message // Pass the message object with text and type (success or error)
}) {
  return (
    <div className="w-full max-w-md bg-black/90 backdrop-blur-lg rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl shadow-red-500/20">
      <div className="text-center mb-6 md:mb-8">
        <div className="bg-red-500/20 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
          <KeyRound className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Verify Email</h2>
        <p className="text-sm sm:text-base text-gray-400">Enter the verification code sent to your email</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
        <div className="group">
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => onVerificationCodeChange(e.target.value)}
            className="w-full bg-black/50 border border-red-500/20 rounded-lg px-4 py-2.5 sm:py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all duration-200 text-center text-xl sm:text-2xl tracking-wider"
            placeholder="Enter code"
            maxLength={6}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-red-500 text-white rounded-lg py-2.5 sm:py-3 text-sm sm:text-base font-semibold hover:bg-red-600 transform hover:scale-[1.02] transition-all duration-200"
        >
          Verify Code
        </button>

        {message?.text && (
          <p
            className={`text-center text-sm mt-2 ${
              message.type === 'success' ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {message.text}
          </p>
        )}
      </form>
    </div>
  );
}