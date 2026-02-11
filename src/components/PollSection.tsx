import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, CheckCircle2, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NewsArticle } from "@/data/newsData";

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  question: string;
  options: PollOption[];
}

const generatePoll = (article: NewsArticle): Poll => {
  const polls: Record<string, Poll> = {
    Environment: {
      question: `Do you believe the targets discussed in "${article.title.slice(0, 50)}..." are achievable?`,
      options: [
        { id: "1", text: "Yes, with strong international cooperation", votes: 234 },
        { id: "2", text: "Partially — only developed nations can meet them", votes: 187 },
        { id: "3", text: "No, they are too ambitious", votes: 93 },
        { id: "4", text: "Undecided — need more information", votes: 56 },
      ],
    },
    Technology: {
      question: "How will new tech regulations impact innovation?",
      options: [
        { id: "1", text: "Positively — levels the playing field", votes: 312 },
        { id: "2", text: "Negatively — stifles growth", votes: 198 },
        { id: "3", text: "Mixed — depends on implementation", votes: 267 },
        { id: "4", text: "No significant impact", votes: 45 },
      ],
    },
    Business: {
      question: "What's your outlook on the economy based on this development?",
      options: [
        { id: "1", text: "Optimistic — recovery is underway", votes: 289 },
        { id: "2", text: "Cautiously optimistic", votes: 356 },
        { id: "3", text: "Pessimistic — more challenges ahead", votes: 134 },
        { id: "4", text: "Neutral — too early to tell", votes: 98 },
      ],
    },
    Health: {
      question: "How hopeful are you about this medical breakthrough?",
      options: [
        { id: "1", text: "Very hopeful — game changer", votes: 445 },
        { id: "2", text: "Cautiously optimistic", votes: 312 },
        { id: "3", text: "Skeptical — needs more research", votes: 89 },
        { id: "4", text: "Need to understand more first", votes: 67 },
      ],
    },
    default: {
      question: `What's your take on "${article.title.slice(0, 50)}..."?`,
      options: [
        { id: "1", text: "Strongly support this development", votes: 203 },
        { id: "2", text: "Support with reservations", votes: 178 },
        { id: "3", text: "Oppose this direction", votes: 95 },
        { id: "4", text: "Need more information", votes: 112 },
      ],
    },
  };

  return polls[article.category] || polls.default;
};

interface PollSectionProps {
  article: NewsArticle;
}

const PollSection = ({ article }: PollSectionProps) => {
  const [poll] = useState<Poll>(() => generatePoll(article));
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [options, setOptions] = useState<PollOption[]>(poll.options);

  const totalVotes = options.reduce((sum, o) => sum + o.votes, 0);

  const handleVote = () => {
    if (!selectedOption) return;
    setOptions((prev) =>
      prev.map((o) =>
        o.id === selectedOption ? { ...o, votes: o.votes + 1 } : o
      )
    );
    setHasVoted(true);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/5 border-b pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="w-5 h-5 text-primary" />
          Community Poll
        </CardTitle>
        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
          <Users className="w-3.5 h-3.5" />
          {totalVotes + (hasVoted ? 1 : 0)} votes
        </p>
      </CardHeader>
      <CardContent className="p-5">
        <h4 className="font-semibold mb-4 text-sm leading-relaxed">{poll.question}</h4>

        <div className="space-y-3">
          {options.map((option) => {
            const pct = Math.round((option.votes / (totalVotes + (hasVoted ? 1 : 0))) * 100);
            const isSelected = selectedOption === option.id;

            return (
              <motion.button
                key={option.id}
                onClick={() => !hasVoted && setSelectedOption(option.id)}
                className={`w-full text-left rounded-lg border p-3 transition-all relative overflow-hidden ${
                  hasVoted
                    ? "cursor-default"
                    : isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/40 hover:bg-muted/30"
                }`}
                whileTap={!hasVoted ? { scale: 0.98 } : {}}
              >
                {hasVoted && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute inset-y-0 left-0 bg-primary/10 rounded-lg"
                  />
                )}
                <div className="relative flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {hasVoted && isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    )}
                    <span className="text-sm">{option.text}</span>
                  </div>
                  {hasVoted && (
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {pct}%
                    </Badge>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {!hasVoted && (
          <Button
            onClick={handleVote}
            disabled={!selectedOption}
            className="w-full mt-4"
            size="sm"
          >
            Submit Vote
          </Button>
        )}

        {hasVoted && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-muted-foreground text-center mt-4"
          >
            ✅ Thanks for voting! Results update in real-time.
          </motion.p>
        )}
      </CardContent>
    </Card>
  );
};

export default PollSection;
