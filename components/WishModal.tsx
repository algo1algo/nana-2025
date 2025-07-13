import React, { useState, useEffect, useCallback } from 'react';
import { CloseIcon, SparkleIcon } from './icons';
import { generateWishSuggestion } from '../services/geminiService';

interface WishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWish: (name: string, message: string) => void;
}

export const WishModal: React.FC<WishModalProps> = ({ isOpen, onClose, onAddWish }) => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSuggestion = useCallback(async () => {
    setIsGenerating(true);
    const suggestion = await generateWishSuggestion();
    setMessage(suggestion);
    setIsGenerating(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && message.trim()) {
      onAddWish(name, message);
      setName('');
      setMessage('');
    }
  };

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 transition-opacity duration-300" onClick={onClose}>
      <div className="bg-warm-off-white text-midnight-blue rounded-2xl shadow-2xl w-full max-w-lg p-6 md:p-8 relative transform transition-all duration-300 scale-95" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-midnight-blue transition-colors">
          <CloseIcon className="w-7 h-7" />
        </button>

        <h3 className="text-3xl font-bold text-center mb-6 text-midnight-blue font-serif">כתבו ברכה מהלב לשירי</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-lg font-bold text-midnight-blue mb-2">השם המלא שלך</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-muted-rose focus:border-muted-rose transition"
              required
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-lg font-bold text-midnight-blue mb-2">הברכה שלך...</label>
            <div className="relative">
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="w-full p-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-muted-rose focus:border-muted-rose transition"
                  required
                />
                 <button type="button" onClick={handleSuggestion} disabled={isGenerating} className="absolute bottom-3 left-3 flex items-center gap-2 text-xs text-muted-rose font-bold hover:text-midnight-blue disabled:opacity-50 disabled:cursor-wait transition-colors">
                  <SparkleIcon className="w-4 h-4" />
                  <span>{isGenerating ? 'חושבים...' : 'קבל/י רעיון לברכה'}</span>
                </button>
            </div>
          </div>
          
          <div>
            <button type="button" className="w-full text-center p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-muted-rose hover:text-muted-rose transition-colors">
              [+] הוסיפו תמונה משותפת (אופציונלי)
            </button>
            <p className="text-xs text-center text-gray-400 mt-1">פיצ'ר העלאת תמונות יגיע בקרוב!</p>
          </div>

          <button type="submit" className="w-full bg-muted-rose text-white font-bold text-xl py-4 rounded-lg hover:bg-opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg">
            שלח/י את הכוכב שלך
          </button>
        </form>
      </div>
    </div>
  );
};
