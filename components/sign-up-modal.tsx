"use client";

import { useEffect, useState } from "react";
import { IoCloseOutline } from "react-icons/io5";

interface ModalProps {
  show: boolean;
  close: () => void;
}

const Modal: React.FC<ModalProps> = ({ show, close }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Reset state when modal is closed.
  useEffect(() => {
    if (!show) {
      setFirstName("");
      setLastName("");
      setEmail("");
      setFeedback(null);
      setSubmitted(false);
    }
  }, [show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    // Validate: email must be provided (for this example).
    if (!email.trim()) {
      setFeedback("Please provide an email address.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
        }),
      });

      // If the response is not ok, try to parse the error and convert to a string.
      if (!response.ok) {
        let errorMsg = "Subscription failed. Please try again.";
        try {
          const errorData = await response.json();
          errorMsg =
            typeof errorData.error === "object"
              ? JSON.stringify(errorData.error)
              : errorData.error || errorMsg;
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
        }
        setFeedback(errorMsg);
      } else {
        const data = await response.json();
        if (data.success) {
          setFeedback("Thank you for subscribing!");
          setSubmitted(true);
        } else {
          // Ensure that if data.error is an object, it's converted to a string.
          setFeedback(
            typeof data.error === "object"
              ? JSON.stringify(data.error)
              : data.error || "Subscription failed. Please try again."
          );
        }
      }
    } catch (networkError) {
      console.error("Error during subscription:", networkError);
      setFeedback("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 h-screen w-full flex items-center justify-center z-20 bg-black bg-opacity-80 text-white">
      <div className="w-full sm:w-[400px] h-auto bg-gradient-to-b from-primary-dark to-primary-light flex flex-col z-30 relative rounded-lg p-5 shadow-lg">
        {/* Close Button */}
        <div className="absolute top-2 right-2 cursor-pointer" onClick={close}>
          <IoCloseOutline className="w-8 h-8 text-white hover:text-gray-300 transition duration-300" />
        </div>

        {/* Sign-up Form or Success Feedback */}
        <div className="w-full text-center">
          <h2 className="font-bold mb-4">Stay Updated!</h2>
          <p className="mb-6">
            Sign up for exclusive updates and news about Bet A Buddy Sports.
          </p>

          {submitted ? (
            <div className="mt-4">
              <p className="text-lg">{feedback}</p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <input
                  type="text"
                  placeholder="Your First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  maxLength={50}
                  className="w-full px-4 py-2 text-gray-900 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-dark"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Your Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  maxLength={50}
                  className="w-full px-4 py-2 text-gray-900 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-dark"
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={50}
                  className="w-full px-4 py-2 text-gray-900 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-dark"
                  required
                />
              </div>
              <p className="text-xs text-gray-200">
                By clicking Sign Up, you agree to receive email alerts about Bet A Buddy Sports.
              </p>
              <button
                type="submit"
                className="btn w-full font-semibold py-2 rounded-md shadow-md transition duration-300"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Sign Up"}
              </button>
              {feedback && (
                <p className="mt-4">
                  {typeof feedback === "object"
                    ? JSON.stringify(feedback)
                    : feedback}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
