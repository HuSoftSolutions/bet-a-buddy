"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { IoCloseOutline } from "react-icons/io5";


const FAQ_DATA = [
  {
    question: "How do users earn points?",
    answer: [
      "Users earn points on three different occasions:",
      [
        "Matching with a partner",
        "Matching with an opponent",
        "Winning the match",
      ],
      "You earn more points when you match with partners and opponents you haven't matched with before.",
    ],
  },
  {
    question: "How do users redeem points for prizes?",
    answer: [
      "Users redeem prizes with their accumulated points by heading over to the merchandise store to discover what they are eligible for based on their accumulated point total.",
    ],
  },
  {
    question: "Is it free to join?",
    answer: [
      "Yes, we do offer a free version of Bet A Buddy Sports. However, a premium version is available which gives users many more features, offering a much higher quality experience.",
    ],
  },
  {
    question: "Do people with similar abilities have to play together?",
    answer: [
      "No. Once Bet A Buddy Sports has some data on your ability, we will be able to assign handicaps and point spreads to ensure the match between athletes of differing abilities is played on a level playing field.",
    ],
  },
  {
    question: "How do funds from wagers get transferred from the winning team to the losing team?",
    answer: [
      "Each team will have a mandatory reporter who will declare that they won or lost. Bet A Buddy Sports integrates with Venmo and funds are sent from the losing team to the winning team.",
    ],
  },
  {
    question: "What if users who are partnered cannot get a match with people they send challenge requests to?",
    answer: [
      "If you're having trouble finding opponents via challenge requests, you can opt to move into the challenge suggestions where the app will match you and your teammate with random opponents that you do not know.",
      "This is similar to how a dating site would work where teams with similar criteria are suggested to you and vice versa.",
    ],
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number>(-1);

  const toggleFAQ = (index = 0) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

	return (
    <section id="faq" className="py-10 px-4 bg-gray-100">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="font-bold mb-6">Frequently Asked Questions</h1>
        <div className="space-y-4 text-left">
          {FAQ_DATA.map((faq, index) => (
            <div key={index} className="bg-white p-4 shadow-md rounded-lg border border-gray-200">
              <button
                onClick={() => toggleFAQ(index)}
                className="font-semibold cursor-pointer w-full text-left flex justify-between items-center"
              >
                <h2>{faq.question}</h2>
                <span className={`transform transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""}`}>
                  ▼
                </span>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="mt-2">
                  {faq.answer.map((part, i) =>
                    Array.isArray(part) ? (
                      <ul key={i} className="list-disc pl-5">
                        {part.map((sub, j) => (
                          <li key={j}>{sub}</li>
                        ))}
                      </ul>
                    ) : (
                      <p key={i} className="mt-2">{part}</p>
                    )
                  )}
                </div>
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
      <div className="w-full sm:w-[400px] h-auto bg-gradient-to-b from-primary-dark to-primary-light flex flex-col z-30 relative rounded-lg p-5 shadow-lg">
        {/* Close Button */}
        <div className="absolute top-2 right-2 cursor-pointer" onClick={close}>
          <IoCloseOutline className="w-8 h-8 text-white hover:text-gray-300 transition duration-300" />
        </div>

        {/* Sign-up Form */}
        <div className="w-full text-center">
          <h2 className="font-bold mb-4">Stay Updated!</h2>
          <p className="mb-6">
            Sign up for exclusive updates and news about Bet A Buddy Sports.
          </p>

          <form className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Your Name"
                className="w-full px-4 py-2 text-gray-900 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-dark"
                required
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Your Email"
                className="w-full px-4 py-2 text-gray-900 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-dark"
                required
              />
            </div>
            <button
              type="submit"
              className="btn w-full font-semibold py-2 rounded-md shadow-md transition duration-300"
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
		const savedScrollPosition = sessionStorage.getItem("scrollPosition");
		if (savedScrollPosition) {
			window.scrollTo(0, parseInt(savedScrollPosition));
		}
	
		return () => {
			sessionStorage.setItem("scrollPosition", window.scrollY.toString());
		};
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
      <nav className="w-full bg-black shadow-md py-4 px-6 flex justify-between items-center fixed top-0 left-0 z-50">
        <h2 className="text-3xl font-bold text-primary uppercase header">Bet A Buddy Sports</h2>
        {/* <ul className="flex space-x-6">
          <li><a href="#about" className="hover:text-primary">About</a></li>
          <li><a href="#features" className="hover:text-primary">Features</a></li>
          <li><a href="#community" className="hover:text-primary">Community</a></li>
          <li><a href="#faq" className="hover:text-primary">FAQ</a></li>
          <li><a href="#contact" className="hover:text-primary">Contact</a></li>
        </ul> */}
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {/* Video background */}
        <video
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
            fade ? "opacity-100" : "opacity-100"
          }`}
          autoPlay
          loop
          muted
          playsInline
          ref={videoRef}
        >
          <source src="/betabuddyherovideo_3.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-85"></div>

        {/* Title and tagline */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
					{/* <div className="bg-primary-dark p-10 rounded-xl bg-opacity-70 border-8 border-primary-dark"> */}
					<Image src="betabuddysportslogo-green.svg" width={100} height={100} className="mb-5" alt="Logo" />

					<div className="">

          <h1 className="font-bold text-primary uppercase">
            Bet A Buddy Sports
          </h1>
          <p className="px-3 mt-2 text-gray-300">
					 Partner up, challenge others, and control the outcome with your skills to cash in! 
          </p>
          <button className="btn py-2 px-6 rounded-full shadow-md mt-10">
            <a href="#about" className="hover:text-white">
              Learn More
            </a>
          </button>
        </div>
				</div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-extrabold mb-4 text-primary">What is Bet A Buddy Sports?</h1>
          <p className="text-primary">
					A fun and social way to place bets with friends and use rewards points for prizes.
          </p>
        </div>
      </section>


      {/* Features Section */}
      <section id="features" className="py-16 px-4 flex flex-col items-center bg-black">
				<h1 className="font-extrabold pb-10 text-white uppercase">Bet on your<span className="text-primary">$</span>elf</h1>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-6 shadow-md rounded-lg border border-gray-200 transform transition duration-500 hover:scale-105">
            <h2 className="font-semibold mb-2 text-primary-dark">Easy Bets</h2>
            <p className="text-primary">Place friendly wagers with your buddies in just a few clicks.</p>
          </div>
          <div className="bg-white p-6 shadow-md rounded-lg border border-gray-200 transform transition duration-500 hover:scale-105">
            <h2 className="font-semibold mb-2 text-primary-dark">Track Results</h2>
            <p className="text-primary">Real-time updates on bets, winnings, and leaderboards.</p>
          </div>
          <div className="bg-white p-6 shadow-md rounded-lg border border-gray-200 transform transition duration-500 hover:scale-105">
            <h2 className="font-semibold mb-2 text-primary-dark">Win Big</h2>
            <p className="text-primary">Win cash on the wager AND win points redeemable for prizes.</p>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className=" py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-bold mb-4">Join the Community</h1>
          <p className="mb-6">
            Connect with like-minded sports fans and enjoy the thrill of
            friendly betting.
          </p>
          <button
            className="btn py-2 px-6 rounded-full shadow-md"
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
          <h1 className="font-bold mb-4">Get in Touch</h1>
          <p className="">
            Have questions? Reach out to us at support@betabuddy.com
          </p>
        </div>
      </section>

      <Modal show={showModal} close={() => setShowModal(false)} />

      {/* Footer */}
      <footer className="bg-black text-white text-center py-6">
        <p>
          &copy; {new Date().getFullYear()} Bet A Buddy Sports. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
