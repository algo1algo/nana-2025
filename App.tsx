
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Wish, GalleryImage, GameId, Score } from './types';
import { WishModal } from './components/WishModal';
import { PlusIcon, QuoteIcon, MusicNoteIcon, ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, HeartIcon, LoadingSpinnerIcon } from './components/icons';
import { generateLoveMessage } from './services/geminiService';
import { GamesSection } from './components/GamesSection';

// --- LOCALSTORAGE HELPERS ---
const getFromStorage = <T,>(key: string, fallback: T): T => {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : fallback;
    } catch (error) {
        console.error(`Error reading ${key} from localStorage`, error);
        return fallback;
    }
};

const setInStorage = <T,>(key: string, data: T) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error writing ${key} to localStorage`, error);
    }
};

// --- MOCK DATA ---
// Mock data for wishes is removed to allow for a persistent, user-driven list.
// Gallery images are kept as a starting point.
const initialGalleryImages: GalleryImage[] = [
  { id: 1, url: 'https://scontent.ftlv18-1.fna.fbcdn.net/v/t39.30808-6/471868073_10163244345257590_828146611706501377_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=cf85f3&_nc_ohc=wXQhQV0ZqzoQ7kNvwHhAwsx&_nc_oc=Adnr3b1OR54YSMPzO6Ifn85Y3liTOnkOZLQyGTB-odlFlvXXcPr-iSqEa1Xh3oCsCjM&_nc_zt=23&_nc_ht=scontent.ftlv18-1.fna&_nc_gid=X12mnZQkXU9CKqBAi-6Q5Q&oh=00_AfQ_oB7NUkamP0nAs9IOo2rrxphsOVNl85N-AtmH1iLoCA&oe=6879E24E', alt: 'Shiri smiling at the beach' },
  { id: 2, url: 'https://scontent.fsdv1-2.fna.fbcdn.net/v/t39.30808-6/472932068_18483140062043827_8141999983221246061_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=127cfc&_nc_ohc=vY_a645warAQ7kNvwHb5CNp&_nc_oc=AdnHNP8EQVoFT7UzXZDom0pqeAouvqzyiSjikZzD8shzS1lsyaNv2PW4P3-E8l9Swyg&_nc_zt=23&_nc_ht=scontent.fsdv1-2.fna&_nc_gid=Up0INyqTxAATsp1tRpW_0Q&oh=00_AfTMKBDi4KQcfZSCNyngdYqwR_bTuKyBv8VF0vhPQlPBYg&oe=6879606A', alt: 'Group photo from a trip' },
  { id: 3, url: 'https://scontent.fsdv1-2.fna.fbcdn.net/v/t39.30808-6/468433783_10161172964863723_4490468411517524607_n.jpg?stp=c120.0.720.720a_dst-jpg_s552x414_tt6&_nc_cat=106&ccb=1-7&_nc_sid=50ad20&_nc_ohc=GVBvt1e9bd0Q7kNvwFT-NlM&_nc_oc=AdnHWGApndNJ-t-ezh9mz4Rz8q-t6MiuL3lUc_xhfhLhWJj66dA4VxSL8CqU8orry2E&_nc_zt=23&_nc_ht=scontent.fsdv1-2.fna&_nc_gid=wArvScu_fSZhmYtuu5dnfA&oh=00_AfRAclji88rtnktrwS6gaw9qH0i2hPadKacPsKrkg2pcNg&oe=6879655F', alt: 'Shiri laughing with friends' },
  { id: 4, url: 'https://scontent.fsdv1-2.fna.fbcdn.net/v/t39.30808-6/468440797_10161104250138723_2028194088988871830_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=aa7094&_nc_ohc=oON10_vwDc8Q7kNvwEtwXrt&_nc_oc=AdkowvmQrNy4aVhQ0QiUJRElHXF-WccSOqQQAvVwg01ef566vvHFPBJnHzWsRh_lONA&_nc_zt=23&_nc_ht=scontent.fsdv1-2.fna&_nc_gid=mSFOxAIE4LCRqHO7J2Qo0g&oh=00_AfTFP3OFy4a9ZnqC85ZONLYRI2qkq5sAYvDJA0iuggGINQ&oe=68795639', alt: 'Birthday celebration last year' },
  { id: 5, url: 'https://scontent.fsdv1-2.fna.fbcdn.net/v/t39.30808-6/517026654_10163946010992590_2536407081921727827_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=7diOzbUUjH0Q7kNvwEv48DN&_nc_oc=Adnm6_QlLqcG4m_-XXnIAG0YZAuOTpIkVsyamIg7nKWkH45yR2C3bDJaPWjI92YcYaQ&_nc_zt=23&_nc_ht=scontent.fsdv1-2.fna&_nc_gid=1D6az9wYnB37a6x6ZAKYag&oh=00_AfTfFOVfzSwd2YnsRzLVwys7X8jtuu7uUu0fozJSnR50XQ&oe=68796D54', alt: 'Candid photo of Shiri' },
  { id: 6, url: 'https://scontent.fsdv1-2.fna.fbcdn.net/v/t39.30808-6/516544880_10163946116732590_8244724382221160182_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=127cfc&_nc_ohc=T4N9nvCEExEQ7kNvwG32Srd&_nc_oc=AdnRU-tlaHwtA4co5Feqyl6tWPZs_AmE62_MqiDFQG2Njso289I2ntqojBVDcRzU7fA&_nc_zt=23&_nc_ht=scontent.fsdv1-2.fna&_nc_gid=J4aEIOn2o578RKw3zpO_Bg&oh=00_AfTx7nOzW_x2bufEk8GrFae2JX-9Ab_Al-aTElA0q8Lx3A&oe=68797574', alt: 'Travel memory' },
];

// --- Sub-components defined outside App to prevent re-renders ---

const AnimatedBackground = () => {
    const particles = useMemo(() => Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        style: {
          left: `${Math.random() * 100}%`,
          animationDuration: `${Math.random() * 15 + 10}s`, // 10-25s
          animationDelay: `${Math.random() * 15}s`,
        },
        size: Math.random() * 20 + 8, // 8px to 28px
        type: Math.random() > 0.4 ? 'heart' : 'sparkle',
    })), []);
  
    return (
      <div className="fixed top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {particles.map(p => {
          if (p.type === 'heart') {
            return (
              <div key={p.id} className="absolute bottom-[-50px] animate-float" style={p.style}>
                <HeartIcon className="text-pink-400/30" style={{ width: p.size, height: p.size }} />
              </div>
            );
          }
          return ( // Sparkle as a dot
              <div key={p.id} className="absolute bottom-[-50px] animate-float bg-soft-gold/50 rounded-full" style={{...p.style, width: p.size/2, height: p.size/2}}>
              </div>
          );
        })}
      </div>
    );
};

const Hero: React.FC = () => (
    <header className="relative h-screen flex flex-col items-center justify-center text-center text-white bg-cover bg-center" style={{ backgroundImage: `url(https://scontent.fsdv1-2.fna.fbcdn.net/v/t39.30808-6/512681050_10163874896492590_1384420019733654948_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=127cfc&_nc_ohc=DGs6g1_LsB4Q7kNvwEHGa03&_nc_oc=AdlW08K8aTDUzvsszMCm0q743zwYwcwChBEt0Hdb_4oShImDaoMMhMpOnqthfzHSQh8&_nc_zt=23&_nc_ht=scontent.fsdv1-2.fna&_nc_gid=T6xqx0n1iiIITOeFZP7TAw&oh=00_AfRnjiqgqw33Frvt192yaJKripn3CsHRKMmFMiSQaa__Lg&oe=68796650` }}>
        <div className="absolute inset-0 bg-black opacity-40"></div>
        {[...Array(50)].map((_, i) => (
            <div key={i} className="absolute bg-soft-gold rounded-full animate-twinkle" style={{
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${Math.random() * 2 + 3}s`
            }}></div>
        ))}
        <div className="relative z-10 p-4">
            <h1 className="text-6xl md:text-8xl font-black text-soft-gold font-serif drop-shadow-lg glow-gold-text">מזל טוב, שירי!</h1>
            <p className="mt-4 text-xl md:text-2xl font-light text-warm-off-white font-sans">יום הולדת שמח, כוכבת שלנו</p>
        </div>
        <div className="absolute bottom-8 z-10">
            <ArrowDownIcon className="w-10 h-10 text-soft-gold animate-bounce"/>
        </div>
    </header>
);

const IntroNote: React.FC = () => (
    <section className="py-20 px-6 text-center">
        <h2 className="text-4xl font-bold text-warm-off-white font-serif mb-4 glow-white-text">לשירי שלנו,</h2>
        <p className="max-w-3xl mx-auto text-lg text-gray-200 leading-relaxed font-sans">
            לכבוד יום הולדתך, רצינו לאסוף לך קונסטלציה של אהבה וזכרונות. כל ברכה היא כוכב, כל תמונה היא רגע שזוהר, וכולם יחד מספרים את הסיפור המיוחד שלך. אוהבים אותך עד אין קץ.
        </p>
    </section>
);

const WishCard: React.FC<{ wish: Wish }> = ({ wish }) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl">
        <div className="p-6 relative">
            <QuoteIcon className="absolute top-4 right-4 w-10 h-10 text-muted-rose opacity-20"/>
            <p className="text-slate-600 leading-relaxed font-sans mb-4 min-h-[60px]">{wish.message}</p>
            <p className="font-bold text-midnight-blue font-sans">מאת: {wish.name}</p>
        </div>
        {wish.imageUrl && <img src={wish.imageUrl} alt={`Photo from ${wish.name}`} className="w-full h-40 object-cover" />}
    </div>
);

const LoveSection: React.FC = () => {
    const [loveMessage, setLoveMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateMessage = async () => {
      setIsLoading(true);
      setLoveMessage(null); // Clear previous message
      const message = await generateLoveMessage();
      setLoveMessage(message);
      setIsLoading(false);
    };

    return (
      <section id="love-corner" className="py-20 px-6 text-center">
          <div className="max-w-2xl mx-auto flex flex-col items-center">
              <HeartIcon className="w-20 h-20 text-soft-gold mb-4"/>
              <h2 className="text-4xl md:text-5xl font-bold text-warm-off-white font-serif mb-4 glow-white-text">פינת אהבה</h2>
              <p className="text-lg text-gray-200 mb-8 font-sans">
                  לפעמים מילים הן רק ההתחלה. לחצי על הכפתור כדי לקבל מסר של אהבה שנכתב במיוחד בשבילך.
              </p>

              {loveMessage && (
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl shadow-lg my-8 w-full animate-fade-in">
                  <p className="text-xl text-warm-off-white font-sans leading-relaxed">{loveMessage}</p>
                </div>
              )}

              <button 
                onClick={handleGenerateMessage} 
                disabled={isLoading}
                className="bg-muted-rose text-white font-bold text-xl py-4 px-10 rounded-lg hover:bg-opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center gap-3 disabled:bg-opacity-70 disabled:cursor-wait glow-rose-button"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinnerIcon className="w-6 h-6"/>
                    <span>יוצרים אהבה...</span>
                  </>
                ) : (
                  <>
                    <HeartIcon className="w-6 h-6"/>
                    <span>להוסיף אהבה</span>
                  </>
                )}
              </button>
          </div>
      </section>
    );
};


// --- Main App Component ---
function App() {
  const [wishes, setWishes] = useState<Wish[]>(() => getFromStorage<Wish[]>('wishes', []));
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [images, setImages] = useState<GalleryImage[]>(() => getFromStorage<GalleryImage[]>('galleryImages', initialGalleryImages));
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [gameScores, setGameScores] = useState<Record<GameId, Score[]>>({
    starCatcher: getFromStorage<Score[]>('scores_starCatcher', []),
    snake: getFromStorage<Score[]>('scores_snake', []),
  });

  const handleAddScore = (gameId: GameId, name: string, score: number) => {
      const newScore = { name, score };
      setGameScores(prevScores => {
          const updatedScores = [...prevScores[gameId], newScore];
          setInStorage(`scores_${gameId}`, updatedScores);
          return {
              ...prevScores,
              [gameId]: updatedScores,
          }
      });
  };

  const handleAddWish = (name: string, message: string) => {
    const newWish: Wish = {
      id: Date.now(), // Use timestamp for a more unique ID
      name,
      message,
    };
    const updatedWishes = [newWish, ...wishes];
    setWishes(updatedWishes);
    setInStorage('wishes', updatedWishes);
    setIsModalOpen(false);
  };
  
  // --- Gallery Handlers ---
  const handleNextImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  const handlePrevImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  }, [images.length]);

  const handleAddImageClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const newImage: GalleryImage = {
                id: Date.now(),
                url: e.target?.result as string,
                alt: 'User uploaded image'
            };
            const updatedImages = [...images, newImage];
            setImages(updatedImages);
            setInStorage('galleryImages', updatedImages);
        };
        reader.readAsDataURL(file);
    }
  };
  
  // Keyboard navigation for slideshow
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        // RTL friendly: left arrow for next, right for previous
        if (event.key === 'ArrowLeft') handleNextImage();
        if (event.key === 'ArrowRight') handlePrevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNextImage, handlePrevImage]);

  // Automatic slideshow transition
  useEffect(() => {
    // Don't auto-play if there's only one image or none
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      handleNextImage();
    }, 5000); // 5 seconds

    // Cleanup the interval on component unmount or when the index changes
    return () => clearInterval(timer);
  }, [currentImageIndex, images.length, handleNextImage]); // Reset timer on manual navigation or when image list changes


  return (
    <div className="relative">
      <AnimatedBackground />
      <div className="relative z-10">
        <Hero />
        <main>
          <IntroNote />

          <section id="wishes" className="py-20 px-6 bg-black/20">
              <div className="max-w-6xl mx-auto">
                  <h2 className="text-4xl md:text-5xl font-bold text-center text-warm-off-white font-serif mb-12 glow-white-text">קיר הברכות</h2>
                  {wishes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {wishes.map(wish => (
                            <WishCard key={wish.id} wish={wish} />
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 px-6 bg-white/10 rounded-xl">
                        <h3 className="text-2xl font-bold text-warm-off-white mb-4">הקיר עדיין ריק...</h3>
                        <p className="text-gray-300 mb-6">היו הראשונים להשאיר ברכה חמה לשירי!</p>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-soft-gold text-midnight-blue font-bold text-lg py-3 px-8 rounded-lg hover:bg-opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg glow-gold-button"
                        >
                            הוסיפו את הברכה שלכם
                        </button>
                    </div>
                  )}
              </div>
          </section>

          <LoveSection />

          <section id="gallery" className="py-20 px-6 bg-black/30">
              <div className="max-w-4xl mx-auto">
                  <h2 className="text-4xl md:text-5xl font-bold text-center text-warm-off-white font-serif mb-12 glow-white-text">רגעים שזוהרים</h2>
                  
                  {images.length > 0 ? (
                      <div className="relative w-full aspect-square bg-black/20 rounded-lg shadow-2xl overflow-hidden">
                          {images.map((image, index) => (
                              <img
                                  key={image.id}
                                  src={image.url}
                                  alt={image.alt}
                                  className={`slideshow-image ${index === currentImageIndex ? 'visible' : ''}`}
                              />
                          ))}
                          
                          {/* Next Button (on the left for RTL) */}
                          <button onClick={handleNextImage} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/20 text-white rounded-full p-2 hover:bg-white/40 transition-all z-20" aria-label="Next image">
                              <ArrowLeftIcon className="w-8 h-8"/>
                          </button>
                          
                          {/* Prev Button (on the right for RTL) */}
                          <button onClick={handlePrevImage} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/20 text-white rounded-full p-2 hover:bg-white/40 transition-all z-20" aria-label="Previous image">
                              <ArrowRightIcon className="w-8 h-8"/>
                          </button>

                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-sans z-20">
                              {currentImageIndex + 1} / {images.length}
                          </div>
                      </div>
                  ) : (
                      <div className="aspect-square bg-black/20 rounded-lg shadow-inner flex items-center justify-center">
                           <p className="text-gray-400">הגלריה ריקה, הוסיפו את התמונה הראשונה!</p>
                      </div>
                  )}

                  <div className="text-center mt-8">
                      <input type="file" ref={fileInputRef} onChange={handleFileSelected} accept="image/*" className="hidden" />
                      <button onClick={handleAddImageClick} className="bg-soft-gold text-midnight-blue font-bold text-lg py-3 px-8 rounded-lg hover:bg-opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center gap-2 mx-auto glow-gold-button">
                          <PlusIcon className="w-6 h-6" />
                          <span>הוסיפו תמונה שלכם</span>
                      </button>
                  </div>
              </div>
          </section>
          
          <GamesSection scores={gameScores} onAddScore={handleAddScore} />

          <section id="playlist" className="py-20 px-6 text-center">
              <div className="max-w-2xl mx-auto flex flex-col items-center">
                  <MusicNoteIcon className="w-20 h-20 text-soft-gold mb-4"/>
                  <h2 className="text-4xl md:text-5xl font-bold text-warm-off-white font-serif mb-4 glow-white-text">יצרנו לך פסקול אישי</h2>
                  <p className="text-lg text-gray-200 mb-8 font-sans">
                      אוסף שירים שמזכירים לנו אותך, לרגעים של שמחה, ריקוד והשראה.
                  </p>
                  <a href="https://youtube.com/playlist?list=PLD7541336B0EF26A9&si=qjf2iNYa_7nYI6xq" target="_blank" rel="noopener noreferrer" className="bg-muted-rose text-white font-bold text-xl py-4 px-10 rounded-lg hover:bg-opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg glow-rose-button">
                      נגני את הפלייליסט
                  </a>
              </div>
          </section>

        </main>
        <footer className="py-12 text-center text-warm-off-white font-sans bg-black/20">
          <p>נבנה באהבה אינסופית עבור שירי בשן ❤️ יום הולדת 2025</p>
        </footer>

        <button onClick={() => setIsModalOpen(true)} className="fixed bottom-6 left-6 bg-soft-gold text-midnight-blue rounded-full p-4 shadow-lg hover:bg-opacity-90 transform hover:scale-110 transition-all duration-300 z-40 glow-gold-button">
          <PlusIcon className="w-8 h-8"/>
          <span className="sr-only">הוסיפו ברכה</span>
        </button>

        <WishModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddWish={handleAddWish}/>
      </div>
    </div>
  );
}

export default App;
