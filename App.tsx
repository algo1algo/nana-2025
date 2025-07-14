import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Wish, GalleryImage, GameId, Score } from './types';
import { WishModal } from './components/WishModal';
import { PlusIcon, QuoteIcon, MusicNoteIcon, ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, HeartIcon, LoadingSpinnerIcon } from './components/icons';
import { generateLoveMessage } from './services/geminiService';
import { GamesSection } from './components/GamesSection';

// --- MOCK DATA for initial gallery (used if DB is empty) ---
const initialGalleryImages: GalleryImage[] = [
  { id: 1, url: 'https://scontent.ftlv18-1.fna.fbcdn.net/v/t39.30808-6/471868073_10163244345257590_828146611706501377_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=cf85f3&_nc_ohc=wXQhQV0ZqzoQ7kNvwHhAwsx&_nc_oc=Adnr3b1OR54YSMPzO6Ifn85Y3liTOnkOZLQyGTB-odlFlvXXcPr-iSqEa1Xh3oCsCjM&_nc_zt=23&_nc_ht=scontent.ftlv18-1.fna&_nc_gid=X12mnZQkXU9CKqBAi-6Q5Q&oh=00_AfQ_oB7NUkamP0nAs9IOo2rrxphsOVNl85N-AtmH1iLoCA&oe=6879E24E', alt: 'Shiri smiling at the beach' },
  { id: 2, url: 'https://scontent.fsdv1-2.fna.fbcdn.net/v/t39.30808-6/472932068_18483140062043827_8141999983221246061_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=127cfc&_nc_ohc=vY_a645warAQ7kNvwHb5CNp&_nc_oc=AdnHNP8EQVoFT7UzXZDom0pqeAouvqzyiSjikZzD8shzS1lsyaNv2PW4P3-E8l9Swyg&_nc_zt=23&_nc_ht=scontent.fsdv1-2.fna&_nc_gid=Up0INyqTxAATsp1tRpW_0Q&oh=00_AfTMKBDi4KQcfZSCNyngdYqwR_bTuKyBv8VF0vhPQlPBYg&oe=6879606A', alt: 'Group photo from a trip' },
  { id: 3, url: 'https://scontent.fsdv1-2.fna.fbcdn.net/v/t39.30808-6/468433783_10161172964863723_4490468411517524607_n.jpg?stp=c120.0.720.720a_dst-jpg_s552x414_tt6&_nc_cat=106&ccb=1-7&_nc_sid=50ad20&_nc_ohc=GVBvt1e9bd0Q7kNvwFT-NlM&_nc_oc=AdnHWGApndNJ-t-ezh9mz4Rz8q-t6MiuL3lUc_xhfhLhWJj66dA4VxSL8CqU8orry2E&_nc_zt=23&_nc_ht=scontent.fsdv1-2.fna&_nc_gid=wArvScu_fSZhmYtuu5dnfA&oh=00_AfRAclji88rtnktrwS6gaw9qH0i2hPadKacPsKrkg2pcNg&oe=6879655F', alt: 'Shiri laughing with friends' },
  { id: 4, url: 'https://scontent.fsdv1-2.fna.fbcdn.net/v/t39.30808-6/468440797_10161104250138723_2028194088988871830_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=aa7094&_nc_ohc=oON10_vwDc8Q7kNvwEtwXrt&_nc_oc=AdkowvmQrNy4aVhQ0QiUJRElHXF-WccSOqQQAvVwg01ef566vvHFPBJnHzWsRh_lONA&_nc_zt=23&_nc_ht=scontent.fsdv1-2.fna&_nc_gid=mSFOxAIE4LCRqHO7J2Qo0g&oh=00_AfTFP3OFy4a9ZnqC85ZONLYRI2qkq5sAYvDJA0iuggGINQ&oe=68795639', alt: 'Birthday celebration last year' },
  { id: 5, url: 'https://scontent.fsdv1-2.fna.fbcdn.net/v/t39.30808-6/517026654_10163946010992590_2536407081921727827_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=7diOzbUUjH0Q7kNvwEv48DN&_nc_oc=Adnm6_QlLqcG4m_-XXnIAG0YZAuOTpIkVsyamIg7nKWkH45yR2C3bDJaPWjI92YcYaQ&_nc_zt=23&_nc_ht=scontent.fsdv1-2.fna&_nc_gid=1D6az9wYnB37a6x6ZAKYag&oh=00_AfTfFOVfzSwd2YnsRzLVwys7X8jtuu7uUu0fozJSnR50XQ&oe=68796D54', alt: 'Candid photo of Shiri' },
  { id: 6, url: 'https://scontent.fsdv1-2.fna.fbcdn.net/v/t39.30808-6/516544880_10163946116732590_8244724382221160182_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=127cfc&_nc_ohc=T4N9nvCEExEQ7kNvwG32Srd&_nc_oc=AdnRU-tlaHwtA4co5Feqyl6tWPZs_AmE62_MqiDFQG2Njso289I2ntqojBVDcRzU7fA&_nc_zt=23&_nc_ht=scontent.fsdv1-2.fna&_nc_gid=J4aEIOn2o578RKw3zpO_Bg&oh=00_AfTx7nOzW_x2bufEk8GrFae2JX-9Ab_Al-aTElA0q8Lx3A&oe=68797574', alt: 'Travel memory' },
];

// --- Sub-components defined outside App to prevent re-renders ---
// ... AnimatedBackground, Hero, IntroNote, WishCard, LoveSection (unchanged) ...

function App() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeGame, setActiveGame] = useState<GameId | null>(null);

  // --- Game scores: stored in backend ---
  const [gameScores, setGameScores] = useState<Record<GameId, Score[]>>({
    starCatcher: [],
    snake: [],
  });

  // --- Fetch wishes, images, and scores from backend on mount ---
  useEffect(() => {
    // Wishes
    fetch('/api/messages')
      .then(res => res.json())
      .then(data => setWishes(data));
    // Images
    fetch('/api/images')
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          setImages(
            data.map((img: any) => ({
              id: img._id || img.id,
              url: `/uploads/${img.filename}`,
              alt: img.originalname || img.alt || "user uploaded image",
            }))
          );
        } else {
          setImages(initialGalleryImages);
        }
      });
    // Game scores
    (async () => {
      const games: GameId[] = ['starCatcher', 'snake'];
      for (const gameId of games) {
        const res = await fetch(`/api/scores/${gameId}`);
        const data = await res.json();
        setGameScores(prev => ({
          ...prev,
          [gameId]: data
        }));
      }
    })();
  }, []);

  // --- Add wish: POST to backend ---
  const handleAddWish = async (name: string, message: string) => {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message, author: name }),
    });
    if (response.ok) {
      const savedWish = await response.json();
      setWishes(prev => [savedWish, ...prev]);
    } else {
      alert('Failed to save wish!');
    }
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

  // --- Image upload: POST to backend ---
  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/images', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const savedImage = await response.json();
        setImages(prev => [
          ...prev,
          {
            id: savedImage._id,
            url: `/uploads/${savedImage.filename}`,
            alt: savedImage.originalname,
          },
        ]);
      } else {
        alert('Failed to upload image!');
      }
    }
  };

  // --- Game score submit: POST to backend ---
  const handleAddScore = async (gameId: GameId, name: string, score: number) => {
    const response = await fetch(`/api/scores/${gameId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score }),
    });
    if (response.ok) {
      const savedScore = await response.json();
      setGameScores(prev => ({
        ...prev,
        [gameId]: [...prev[gameId], savedScore]
      }));
    } else {
      alert('Failed to save score!');
    }
  };

  // --- Keyboard navigation for slideshow ---
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') handleNextImage();
      if (event.key === 'ArrowRight') handlePrevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNextImage, handlePrevImage]);

  // --- Automatic slideshow transition ---
  useEffect(() => {
    if (activeGame || images.length <= 1) return;
    const timer = setInterval(() => {
      handleNextImage();
    }, 5000);
    return () => clearInterval(timer);
  }, [activeGame, currentImageIndex, images.length, handleNextImage]);

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
                    <WishCard key={wish.id || wish._id} wish={wish} />
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
                  <button onClick={handleNextImage} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/20 text-white rounded-full p-2 hover:bg-white/40 transition-all z-20" aria-label="Next image">
                    <ArrowLeftIcon className="w-8 h-8" />
                  </button>
                  <button onClick={handlePrevImage} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/20 text-white rounded-full p-2 hover:bg-white/40 transition-all z-20" aria-label="Previous image">
                    <ArrowRightIcon className="w-8 h-8" />
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
                  <span>הוסיפו תמונות שלכם עם שירי</span>
                </button>
              </div>
            </div>
          </section>

          <GamesSection
            scores={gameScores}
            onAddScore={handleAddScore}
            activeGame={activeGame}
            setActiveGame={setActiveGame}
          />

          <section id="playlist" className="py-20 px-6 text-center">
            <div className="max-w-2xl mx-auto flex flex-col items-center">
              <MusicNoteIcon className="w-20 h-20 text-soft-gold mb-4" />
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
          <PlusIcon className="w-8 h-8" />
          <span className="sr-only">הוסיפו ברכה</span>
        </button>
        <WishModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddWish={handleAddWish} />
      </div>
    </div>
  );
}

export default App;