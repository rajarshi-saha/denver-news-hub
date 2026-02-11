import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Zap, CheckCircle, XCircle, ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { NewsArticle } from "@/data/newsData";

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const generateQuiz = (article: NewsArticle): QuizQuestion[] => {
  const quizzes: Record<string, QuizQuestion[]> = {
    Environment: [
      {
        question: "What is the primary goal of major climate agreements?",
        options: ["Increase fossil fuel use", "Reduce carbon emissions", "Promote nuclear energy only", "Eliminate all industry"],
        correctIndex: 1,
        explanation: "Climate agreements primarily aim to reduce carbon emissions to combat global warming.",
      },
      {
        question: "Which energy source is considered renewable?",
        options: ["Coal", "Natural gas", "Solar", "Oil"],
        correctIndex: 2,
        explanation: "Solar energy is a renewable source that doesn't deplete natural resources.",
      },
      {
        question: "What is a carbon pricing mechanism?",
        options: ["A tax on carbon emissions", "A subsidy for oil", "A discount on gas", "None of the above"],
        correctIndex: 0,
        explanation: "Carbon pricing puts a financial cost on emissions to incentivize reductions.",
      },
    ],
    Technology: [
      {
        question: "What does 'antitrust regulation' primarily aim to prevent?",
        options: ["Data breaches", "Monopolistic practices", "Software bugs", "Cyber attacks"],
        correctIndex: 1,
        explanation: "Antitrust laws prevent companies from dominating markets unfairly.",
      },
      {
        question: "What is 'data portability'?",
        options: ["Moving servers physically", "Users taking their data between platforms", "Encrypting all data", "Deleting user accounts"],
        correctIndex: 1,
        explanation: "Data portability allows users to transfer their data between different services.",
      },
      {
        question: "What does 'self-preferencing' mean in tech?",
        options: ["Users preferring one app", "Platforms favoring their own products", "Better UI design", "Faster loading times"],
        correctIndex: 1,
        explanation: "Self-preferencing is when platforms give unfair advantage to their own products in search or rankings.",
      },
    ],
    Business: [
      {
        question: "What does 'rate cut' by the central bank typically lead to?",
        options: ["Higher borrowing costs", "Lower borrowing costs", "No change in economy", "Currency appreciation"],
        correctIndex: 1,
        explanation: "Rate cuts reduce borrowing costs, encouraging spending and investment.",
      },
      {
        question: "What does CPI stand for?",
        options: ["Central Price Index", "Consumer Price Index", "Cost Per Investment", "Commercial Price Indicator"],
        correctIndex: 1,
        explanation: "The Consumer Price Index measures the average change in prices paid by consumers.",
      },
      {
        question: "What happens when inflation 'cools'?",
        options: ["Prices rise faster", "Price increases slow down", "Economy crashes", "Unemployment spikes"],
        correctIndex: 1,
        explanation: "Cooling inflation means the rate of price increases is slowing down.",
      },
    ],
    default: [
      {
        question: `Based on this article, what sector is most directly affected?`,
        options: [article.category, "Agriculture", "Mining", "Telecommunications"],
        correctIndex: 0,
        explanation: `The ${article.category} sector is the primary focus of this article.`,
      },
      {
        question: "What is the best way to stay informed about developing stories?",
        options: ["Ignore the news", "Follow multiple credible sources", "Only read headlines", "Rely on social media"],
        correctIndex: 1,
        explanation: "Following multiple credible sources provides a balanced and thorough understanding.",
      },
      {
        question: "Why is context important when reading news?",
        options: ["It isn't important", "It helps understand implications", "It makes articles longer", "It confuses readers"],
        correctIndex: 1,
        explanation: "Context helps readers understand the broader significance and implications of events.",
      },
    ],
  };

  return quizzes[article.category] || quizzes.default;
};

interface QuizSectionProps {
  article: NewsArticle;
}

const QuizSection = ({ article }: QuizSectionProps) => {
  const [quiz] = useState(() => generateQuiz(article));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [timerActive, setTimerActive] = useState(true);

  // Timer countdown
  useEffect(() => {
    if (!timerActive || hasAnswered || isComplete) return;
    if (timeLeft <= 0) {
      setHasAnswered(true);
      setShowExplanation(true);
      setStreak(0);
      setTimerActive(false);
      return;
    }
    const t = setTimeout(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, timerActive, hasAnswered, isComplete]);

  const handleAnswer = (index: number) => {
    if (hasAnswered) return;
    setSelectedAnswer(index);
    setHasAnswered(true);
    setShowExplanation(true);
    setTimerActive(false);

    const isCorrect = index === quiz[currentQuestion].correctIndex;
    if (isCorrect) {
      const timeBonus = Math.max(timeLeft * 2, 0);
      const streakBonus = streak * 5;
      const points = 10 + timeBonus + streakBonus;
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
      setTotalPoints((p) => p + points);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentQuestion + 1 >= quiz.length) {
      setIsComplete(true);
      return;
    }
    setCurrentQuestion((c) => c + 1);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setShowExplanation(false);
    setTimeLeft(15);
    setTimerActive(true);
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setShowExplanation(false);
    setScore(0);
    setStreak(0);
    setTotalPoints(0);
    setIsComplete(false);
    setTimeLeft(15);
    setTimerActive(true);
  };

  const q = quiz[currentQuestion];
  const progress = ((currentQuestion + (hasAnswered ? 1 : 0)) / quiz.length) * 100;

  if (isComplete) {
    const maxPoints = quiz.length * 40; // rough max
    const rating = score === quiz.length ? "🏆 Perfect!" : score >= 2 ? "⭐ Great job!" : "📚 Keep learning!";

    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring" }}
          >
            <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-2xl font-serif font-bold mb-2">{rating}</h3>
            <p className="text-muted-foreground mb-4">
              You scored {score}/{quiz.length} correct
            </p>

            <div className="flex justify-center gap-6 mb-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{totalPoints}</p>
                <p className="text-xs text-muted-foreground">Total Points</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-500">{score}</p>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>
            </div>

            <div className="flex gap-1 justify-center mb-6">
              {quiz.map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-2 rounded-full ${
                    i < score ? "bg-green-500" : "bg-destructive/50"
                  }`}
                />
              ))}
            </div>

            <Button onClick={handleRestart} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Play Again
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/5 border-b pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="w-5 h-5 text-yellow-500" />
            News Quiz
          </CardTitle>
          <div className="flex items-center gap-3">
            {streak > 1 && (
              <Badge className="bg-yellow-500 text-white gap-1 animate-pulse">
                <Star className="w-3 h-3" /> {streak}x streak
              </Badge>
            )}
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="w-3 h-3" /> {totalPoints} pts
            </Badge>
          </div>
        </div>
        <Progress value={progress} className="mt-3 h-2" />
        <p className="text-xs text-muted-foreground mt-2">
          Question {currentQuestion + 1} of {quiz.length}
        </p>
      </CardHeader>

      <CardContent className="p-5">
        {/* Timer */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-sm leading-relaxed flex-1 pr-4">{q.question}</h4>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 shrink-0 ${
              timeLeft <= 5
                ? "border-destructive text-destructive animate-pulse"
                : "border-primary text-primary"
            }`}
          >
            {timeLeft}
          </div>
        </div>

        <div className="space-y-2.5">
          {q.options.map((option, i) => {
            const isCorrect = i === q.correctIndex;
            const isSelected = i === selectedAnswer;

            let optionClass = "border-border hover:border-primary/40 hover:bg-muted/30";
            if (hasAnswered) {
              if (isCorrect) optionClass = "border-green-500 bg-green-500/10";
              else if (isSelected && !isCorrect) optionClass = "border-destructive bg-destructive/10";
              else optionClass = "border-border opacity-50";
            } else if (isSelected) {
              optionClass = "border-primary bg-primary/5 ring-1 ring-primary";
            }

            return (
              <motion.button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={hasAnswered}
                className={`w-full text-left rounded-lg border p-3 transition-all flex items-center gap-3 ${optionClass}`}
                whileTap={!hasAnswered ? { scale: 0.98 } : {}}
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    hasAnswered && isCorrect
                      ? "bg-green-500 text-white"
                      : hasAnswered && isSelected && !isCorrect
                      ? "bg-destructive text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {hasAnswered && isCorrect ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : hasAnswered && isSelected && !isCorrect ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    String.fromCharCode(65 + i)
                  )}
                </span>
                <span className="text-sm">{option}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Explanation */}
        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-3 rounded-lg bg-muted/50 border"
            >
              <p className="text-xs font-semibold mb-1">💡 Explanation</p>
              <p className="text-sm text-muted-foreground">{q.explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {hasAnswered && (
          <Button onClick={handleNext} className="w-full mt-4 gap-2" size="sm">
            {currentQuestion + 1 >= quiz.length ? "See Results" : "Next Question"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizSection;
