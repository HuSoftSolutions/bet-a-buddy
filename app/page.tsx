"use client";

import Modal from "@/components/sign-up-modal";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { IoCloseOutline } from "react-icons/io5";

const FAQ_DATA = [
  {
    question: "How do users earn Buddy Points?",
    answer: [
      "Users earn Buddy Points on three different occasions:",
      [
        "Linking with a partner",
        "Finding opponents",
        "Playing matches"
      ],
      "You earn more points when you match with partners and opponents you haven't matched with before.",
    ],
  },
  {
    question: "How do users redeem Buddy Points for rewards?",
    answer: [
      "Users can redeem their Buddy Points at local businesses like Romo's Pizza, Park Lane Tobacconist, Van Patten Golf, and more. Simply visit these locations and show your accumulated points to receive special offers and discounts.",
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
	{
		question: "Is golf the only sport?",
		answer: [
			"Golf is the feature sport but additional sports like bowling, pickleball, horseshoes, billiards, corn hole will be usable sports in the near future."
		]
	}
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number>(-1);

  const toggleFAQ = (index = 0) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

	return (
    <section id="faq" className="py-10 px-4 bg-gray-200">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="font-bold mb-6 !text-secondary">Frequently Asked Questions</h1>
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



export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [fade, setFade] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showBanner, setShowBanner] = useState<boolean>(true);

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
      {/* Development Banner */}
      {showBanner && (
        <div className="fixed top-0 left-0 w-full bg-primary text-white py-2 text-center font-bold z-[100] flex justify-center items-center">
          <div className="flex-grow">⚠️ APP DEVELOPMENT UNDERWAY</div>
          <button 
            onClick={() => setShowBanner(false)} 
            className="mr-4 hover:text-gray-200 transition-colors"
            aria-label="Close banner"
          >
            <IoCloseOutline size={24} />
          </button>
        </div>
      )}
      
      {/* Navbar - adjusted top padding based on banner visibility */}
      <nav className={`w-full bg-white shadow-md py-4 px-6 flex justify-between items-center fixed ${showBanner ? 'top-8' : 'top-0'} left-0 z-50 transition-all duration-300`}>
        <h2 className="text-3xl font-bold text-primary uppercase header">Bet A Buddy Sports</h2>
        {/* <ul className="flex space-x-6">
          <li><a href="#about" className="hover:text-primary">About</a></li>
          <li><a href="#features" className="hover:text-primary">Features</a></li>
          <li><a href="#community" className="hover:text-primary">Community</a></li>
          <li><a href="#faq" className="hover:text-primary">FAQ</a></li>
          <li><a href="#contact" className="hover:text-primary">Contact</a></li>
        </ul> */}
      </nav>

      {/* Hero Section - adjusted based on banner visibility */}
      <section className={`relative h-screen ${showBanner ? 'pt-8' : 'pt-0'} overflow-hidden transition-all duration-300`}>
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
          <source src="/hero_video.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-85"></div>

        {/* Title and tagline */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
					{/* <div className="bg-primary-dark p-10 rounded-xl bg-opacity-70 border-8 border-primary-dark"> */}
					<Image src="/logo_white.png" width={500} height={400} className="px-5" alt="Logo" />

					<div className="">

          <p className="px-3 mt-2 text-gray-300 italic">
					 Play Local. Earn Points. Redeem Rewards.
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
            Compete in real sports matches with your friends and earn Buddy Points every time you link with a partner, find opponents, and play.
          </p>
        </div>
      </section>


      {/* Features Section - Improved Design */}
      <section id="features" className="py-20 px-4 flex flex-col items-center bg-secondary">
        <h1 className="font-extrabold pb-12 text-white uppercase text-center">How It Works</h1>

        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-10 text-center">
          <div className="bg-white p-8 shadow-lg rounded-xl border-2 border-gray-200 transform transition duration-500 hover:scale-105 hover:shadow-xl">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">1</div>
            </div>
            <h2 className="font-semibold mb-3 text-xl text-primary">Link Up</h2>
            <p className="text-primary">Match with your golf partner and opponents</p>
          </div>
          
          <div className="bg-white p-8 shadow-lg rounded-xl border-2 border-gray-200 transform transition duration-500 hover:scale-105 hover:shadow-xl">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">2</div>
            </div>
            <h2 className="font-semibold mb-3 text-xl text-primary">Compete</h2>
            <p className="text-primary">Play a match and submit your score</p>
          </div>
          
          <div className="bg-white p-8 shadow-lg rounded-xl border-2 border-gray-200 transform transition duration-500 hover:scale-105 hover:shadow-xl">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">3</div>
            </div>
            <h2 className="font-semibold mb-3 text-xl text-primary">Earn Points</h2>
            <p className="text-primary">Get rewarded for every matchup</p>
          </div>
          
          <div className="bg-white p-8 shadow-lg rounded-xl border-2 border-gray-200 transform transition duration-500 hover:scale-105 hover:shadow-xl">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">4</div>
            </div>
            <h2 className="font-semibold mb-3 text-xl text-primary">Redeem Locally</h2>
            <p className="text-primary">Use your Buddy Points at real businesses like Romo&apos;s Pizza, Park Lane Tobacconist, Van Patten Golf, and more</p>
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
            Join the Competition. Start Earning.
          </button>
        </div>
      </section>

      <FAQ />

      {/* Contact Section */}
      <section id="contact" className="bg-primary text-white py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-bold mb-4 !text-white">Get in Touch</h1>
          <p className="">
            Have questions? Reach out to us at support@betabuddy.com
          </p>
        </div>
      </section>

      <Modal show={showModal} close={() => setShowModal(false)} />

      {/* Footer */}
      <footer className="bg-white text-primary text-center py-6 font-extrabold">
        <p>
          &copy; {new Date().getFullYear()} Bet A Buddy Sports. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
