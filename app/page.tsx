"use client";
import { useEffect, useRef, useState } from "react";
import { IoCloseOutline } from "react-icons/io5";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number>(-1);

  const toggleFAQ = (index = 0) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section id="faq" className="py-16 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6">How It Works</h2>
        <div className="space-y-4 text-left">
          {[
            {
              question: "How do I place a bet?",
              answer:
                "Simply create a bet, invite your friends, and track the results.",
            },
            {
              question: "Is it free to join?",
              answer:
                "Yes, signing up and placing bets with friends is completely free.",
            },
            {
              question: "How do I place a bet?",
              answer:
                "Simply create a bet, invite your friends, and track the results.",
            },
            {
              question: "Is it free to join?",
              answer:
                "Yes, signing up and placing bets with friends is completely free.",
            },
          ].map((faq, index) => (
            <div
              key={index}
              className="bg-white p-4 shadow-md rounded-lg border border-gray-200"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="font-semibold cursor-pointer w-full text-left flex justify-between items-center"
              >
                {faq.question}
                <span
                  className={`transform transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index
                    ? "max-h-[500px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <p className="mt-2">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

interface ModalProps {
  show: boolean;
  close: () => void;
}

const Modal: React.FC<ModalProps> = ({ show, close }) => {
  return show === true ? (
    <div className="fixed top-0 left-0 h-screen w-full flex items-center justify-center z-20 bg-black bg-opacity-80 text-white">
      <div className="w-full sm:w-[400px] h-auto bg-gradient-to-b from-green-600 to-green-800 flex flex-col z-30 relative rounded-lg p-5 shadow-lg">
        {/* Close Button */}
        <div className="absolute top-2 right-2 cursor-pointer" onClick={close}>
          <IoCloseOutline className="w-8 h-8 text-white hover:text-gray-300 transition duration-300" />
        </div>

        {/* Sign-up Form */}
        <div className="w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Stay Updated!</h2>
          <p className="mb-6 text-sm">
            Sign up for exclusive updates and news about Bet A Buddy.
          </p>

          <form className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Your Name"
                className="w-full px-4 py-2 text-gray-900 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                required
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Your Email"
                className="w-full px-4 py-2 text-gray-900 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-white text-green-700 font-semibold py-2 rounded-md shadow-md hover:bg-gray-100 transition duration-300"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  ) : null;
};

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [fade, setFade] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    window.history.replaceState({}, document.title, window.location.pathname);
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;

    videoRef.current.playbackRate = 1;

    videoRef.current.addEventListener("timeupdate", () => {
      const video = videoRef.current;
      if (!video) return;
      setFade(video.currentTime >= video.duration - 1);
    });
  }, []);

  return (
    <div className="relative bg-gray-50 min-h-screen text-gray-900">
      {/* Navbar */}
      <nav className="w-full bg-white shadow-md py-4 px-6 flex justify-between items-center fixed top-0 left-0 z-50">
        <h2 className="text-xl font-bold text-green-800">Bet A Buddy</h2>
        {/* <ul className="flex space-x-6">
          <li><a href="#about" className="hover:text-green-600">About</a></li>
          <li><a href="#features" className="hover:text-green-600">Features</a></li>
          <li><a href="#community" className="hover:text-green-600">Community</a></li>
          <li><a href="#faq" className="hover:text-green-600">FAQ</a></li>
          <li><a href="#contact" className="hover:text-green-600">Contact</a></li>
        </ul> */}
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {/* Video background */}
        <video
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
            fade ? "opacity-75" : "opacity-100"
          }`}
          autoPlay
          loop
          muted
          playsInline
          ref={videoRef}
        >
          <source src="/hero_video.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-80"></div>

        {/* Title and tagline */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
          <h1 className="text-4xl sm:text-7xl font-bold text-green-800 ">
            Bet A Buddy
          </h1>
          <p className="text-sm px-3 sm:text-lg mt-2 text-white">
            The ultimate sports betting experience with friends
          </p>
          <button className="bg-green-700 text-white py-2 px-6 rounded-full shadow-md hover:bg-green-800 mt-10 animate-pulse">
            <a href="#about" className="hover:text-white">
              Learn More
            </a>
          </button>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">What is Bet A Buddy?</h2>
          <p className="text-lg">
            A fun and social way to place bets with friends and track results
            seamlessly.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-6 shadow-md rounded-lg border border-gray-200 transform transition duration-500 hover:scale-105">
            <h3 className="text-xl font-semibold mb-2">Easy Bets</h3>
            <p>Place friendly wagers with your buddies in just a few clicks.</p>
          </div>
          <div className="bg-white p-6 shadow-md rounded-lg border border-gray-200 transform transition duration-500 hover:scale-105">
            <h3 className="text-xl font-semibold mb-2">Track Results</h3>
            <p>Real-time updates on bets, winnings, and leaderboards.</p>
          </div>
          <div className="bg-white p-6 shadow-md rounded-lg border border-gray-200 transform transition duration-500 hover:scale-105">
            <h3 className="text-xl font-semibold mb-2">Win Big</h3>
            <p>Compete with friends and climb the ranks for rewards.</p>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="bg-green-100 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Join the Community</h2>
          <p className="text-lg mb-6">
            Connect with like-minded sports fans and enjoy the thrill of
            friendly betting.
          </p>
          <button
            className="bg-green-700 text-white py-2 px-6 rounded-full shadow-md hover:bg-green-800"
            onClick={() => {
              console.log("fired");
              setShowModal(true);
            }}
          >
            Sign Up Now
          </button>
        </div>
      </section>

      <FAQ />

      {/* Contact Section */}
      <section id="contact" className="bg-gray-100 py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
          <p className="text-lg">
            Have questions? Reach out to us at support@betabuddy.com
          </p>
        </div>
      </section>

      <Modal show={showModal} close={() => setShowModal(false)} />

      {/* Footer */}
      <footer className="bg-green-900 text-white text-center py-6">
        <p>
          &copy; {new Date().getFullYear()} Bet A Buddy. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
