import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Clock, Trophy } from "lucide-react";
import CyberButton from "@/components/CyberButton";
import { Progress } from "@/components/ui/progress";

// Mock questions for demonstration
const mockQuestions = [
  {
    id: 1,
    question: "Un email d'une banque demandant de vérifier vos informations personnelles est toujours légitime",
    answer: false,
    category: "Phishing"
  },
  {
    id: 2,
    question: "Il est sûr d'utiliser le même mot de passe pour plusieurs comptes en ligne",
    answer: false,
    category: "Mots de passe"
  },
  {
    id: 3,
    question: "Le protocole HTTPS garantit que le site web est sécurisé et fiable",
    answer: true,
    category: "Réseaux"
  },
  {
    id: 4,
    question: "Les mises à jour de sécurité doivent être installées dès qu'elles sont disponibles",
    answer: true,
    category: "Sécurité"
  },
  {
    id: 5,
    question: "Partager des informations personnelles sur les réseaux sociaux n'a aucun risque",
    answer: false,
    category: "RGPD"
  },
];

export default function Quiz() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get("mode");
  const pseudo = searchParams.get("pseudo");

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);

  const currentQuestion = mockQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / mockQuestions.length) * 100;

  useEffect(() => {
    if (mode === "chrono" && !answered && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !answered) {
      handleAnswer(null);
    }
  }, [timeLeft, answered, mode]);

  const handleAnswer = (answer: boolean | null) => {
    setAnswered(true);
    setSelectedAnswer(answer);
    
    if (answer === currentQuestion.answer) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQuestionIndex < mockQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setAnswered(false);
        setSelectedAnswer(null);
        setTimeLeft(30);
      } else {
        navigate(`/score?score=${score + (answer === currentQuestion.answer ? 1 : 0)}&total=${mockQuestions.length}&mode=${mode}&pseudo=${pseudo}`);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <Trophy className="h-6 w-6" />
            <span className="text-2xl font-bold">{score}</span>
          </div>
          
          {mode === "chrono" && (
            <div className="flex items-center gap-2 text-secondary">
              <Clock className="h-6 w-6" />
              <span className="text-2xl font-bold">{timeLeft}s</span>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Question {currentQuestionIndex + 1}/{mockQuestions.length}</span>
            <span className="text-primary font-medium">{currentQuestion.category}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <div className="bg-card border-2 border-border rounded-lg p-8 shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 leading-relaxed">
            {currentQuestion.question}
          </h2>

          {!answered ? (
            <div className="grid grid-cols-2 gap-4">
              <CyberButton
                size="xl"
                variant="secondary"
                onClick={() => handleAnswer(true)}
                className="h-24 text-2xl font-bold"
              >
                OUI
              </CyberButton>
              <CyberButton
                size="xl"
                variant="primary"
                onClick={() => handleAnswer(false)}
                className="h-24 text-2xl font-bold"
              >
                NON
              </CyberButton>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`text-center p-6 rounded-lg ${
                selectedAnswer === currentQuestion.answer 
                  ? "bg-cyber-green/20 border-2 border-cyber-green" 
                  : "bg-cyber-red/20 border-2 border-cyber-red"
              }`}>
                <div className="flex items-center justify-center gap-3 mb-2">
                  {selectedAnswer === currentQuestion.answer ? (
                    <>
                      <CheckCircle2 className="h-8 w-8 text-cyber-green" />
                      <span className="text-2xl font-bold text-cyber-green">Bonne réponse !</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-8 w-8 text-cyber-red" />
                      <span className="text-2xl font-bold text-cyber-red">Mauvaise réponse 😅</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  La bonne réponse était : <span className="font-bold">{currentQuestion.answer ? "OUI" : "NON"}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Timer progress for chrono mode */}
        {mode === "chrono" && !answered && (
          <Progress 
            value={(timeLeft / 30) * 100} 
            className="h-1"
          />
        )}
      </div>
    </div>
  );
}
